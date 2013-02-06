
    function recrusiveFrom(modelObj, settings, context, pathSettings) {
        var temp, result, p, length, idName, newContext, customPathSettings, extend, optionProcessed,
        pathSettings = pathSettings || getPathSettings(settings, context), childPathSettings, childObj;

        if (customPathSettings = pathSettings.custom) {
            optionProcessed = true;
            //custom can either be specified as a single map function or as an 
            //object with map and unmap properties
            if (typeof customPathSettings === "function") {
                result = customPathSettings(modelObj);
            }
            else {
                result = customPathSettings.map(modelObj);
                if (!isNullOrUndefined(result)) {//extend object with mapping info where possible
                    result.___$mapCustom = customPathSettings.map;//preserve map function for updateFromModel calls
                    if (customPathSettings.unmap) {//perserve unmap function for toModel calls
                        result.___$unmapCustom = customPathSettings.unmap;
                    }
                }
            }
        }
        else if (pathSettings.append) {//append property
            optionProcessed = true;
            result = modelObj;//append
        }
        else if (pathSettings.exclude) {
            optionProcessed = true;
            return badResult;
        }
        else if (isPrimativeOrDate(modelObj)) {
            //primative and date children of arrays aren't mapped... all others are
            result = context.parentIsArray ? modelObj : makeObservable(modelObj);
        }
        else if (modelObj instanceof Array) {
            result = [];

            for (p = 0, length = modelObj.length; p < length; p++) {
                result[p] = recrusiveFrom(modelObj[p], settings, {
                    name: "[i]", parent: context.name + "[i]", full: context.full + "[i]", parentIsArray: true
                });
            }

            //only makeObservableArray extend with mapping functions if it's not a nested array or mapping compatabitlity is off
            if (!context.parentIsArray || makeChildArraysObservable) {

                newContext = { name: "[i]", parent: context.name + "[i]", full: context.full + "[i]", parentIsArray: true };
                result = makeObservableArray(result);

                //if available add id name to object so it can be accessed later when updating children
                if (idName = pathSettings.arrayChildId) {
                    result.___$childIdName = idName;
                }

                //wrap array methods for adding and removing items in functions that
                //close over settings and context allowing the objects and their children to be correctly mapped.
                result.pushFromModel = function (item) {
                    item = recrusiveFrom(item, settings, newContext);
                    result.push(item);
                };
                result.unshiftFromModel = function (item) {
                    item = recrusiveFrom(item, settings, newContext);
                    result.unshift(item);
                };
                result.popToModel = function (item) {
                    item = result.pop();
                    return recrusiveTo(item, newContext);
                };
                result.shiftToModel = function (item) {
                    item = result.shift();
                    return recrusiveTo(item, newContext);
                };
            }

        }
        else if (modelObj.constructor === Object) {
            result = {};
            for (p in modelObj) {
                newContext = {
                    name: p,
                    parent: (context.name === "[i]" ? context.parent : context.name) + "." + p,
                    full: context.full + "." + p
                };
                childObj = modelObj[p];
                childPathSettings = isPrimativeOrDate(childObj) ? getPathSettings(settings, newContext) : undefined;

                if (childPathSettings && childPathSettings.custom) {//primativish value w/ custom maping
                    //since primative children cannot store their own custom functions, handle processing here and store them in the parent
                    result.___$customChildren = result.___$customChildren || {};
                    result.___$customChildren[p] = childPathSettings.custom;

                    if (typeof childPathSettings.custom === "function") {
                        result[p] = childPathSettings.custom(modelObj[p]);
                    }
                    else {
                        result[p] = childPathSettings.custom.map(modelObj[p]);
                    }
                }
                else {
                    temp = recrusiveFrom(childObj, settings, newContext, childPathSettings);//call recursive from on each child property

                    if (temp !== badResult) {//properties that couldn't be mapped return badResult
                        result[p] = temp;
                    }

                }
            }
        }

        if (!optionProcessed && (extend = pathSettings.extend)) {
            if (typeof extend === "function") {//single map function specified
                //Extend can either modify the mapped value or replace it
                //Falsy values assumed to be undefined
                result = extend(result) || result;
            }
            else if (extend.constructor === Object) {//map and/or unmap were specified as part of object
                if (typeof extend.map === "function") {
                    result = extend.map(result) || result;//use map to get result
                }

                if (typeof extend.unmap === "function") {
                    result.___$unmapExtend = extend.unmap;//store unmap for use by toModel
                }
            }
        }
        return result;
    }