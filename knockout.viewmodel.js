/*ko.viewmodel.js - version 2.0.3
* Copyright 2013, Dave Herren http://coderenaissance.github.com/knockout.viewmodel/
* License: MIT (http://www.opensource.org/licenses/mit-license.php)*/
/*jshint eqnull:true, boss:true, loopfunc:true, evil:true, laxbreak:true, undef:true, unused:true, browser:true, immed:true, devel:true, sub: true, maxerr:50 */
/*global ko:false */

(function () {
    //Module declarations. For increased compression with simple settings on the closure compiler,
    //the ko functions are stored in variables. These variable names will be shortened by the compiler, 
    //whereas references to ko would not be. There is also a performance savings from this.
    var unwrap = ko.utils.unwrapObservable,
        isObservable = ko.isObservable,
        makeObservable = ko.observable,
        makeObservableArray = ko.observableArray,
        rootContext = { name: "{root}", parent: "{root}", full: "{root}" },
        fnLog, makeChildArraysObservable, crossFrameSafe,
        badResult = function fnBadResult() { };



    function isNullOrUndefined(obj) {//checks if obj is null or undefined
        return obj === null || obj === undefined;
    }

    function isArray(obj, crossFrameSafe) {
       if(!obj) return false;
       return crossFrameSafe ? Object.prototype.toString.call(obj) === "[object Array]" : obj instanceof Array;
    }

    function isObject(obj, crossFrameSafe) {
        if(!obj) return false;
        return crossFrameSafe ? Object.prototype.toString.call(obj) === "[object Object]" : obj.constructor === Object;
    }

    function isFunction(obj, crossFrameSafe) {
        if(!obj) return false;
        return crossFrameSafe ? Object.prototype.toString.call(obj) === "[object Function]" : obj.constructor === Function;
    }

    function isString(obj, crossFrameSafe){
        if(!obj) return false;
        return crossFrameSafe ? Object.prototype.toString.call(obj) === "[object String]" : obj.constructor === String;
    }

    function isNumber(obj, crossFrameSafe){
        if(!obj) return false;
        return crossFrameSafe ? Object.prototype.toString.call(obj) === "[object Number]" : obj.constructor === Number;
    }

    function isBoolean(obj, crossFrameSafe){
        if(!obj) return false;
        return crossFrameSafe ? Object.prototype.toString.call(obj) === "[object Boolean]" : obj.constructor === Boolean;
    }

    //while dates aren't part of the JSON spec it doesn't hurt to support them as it's not unreasonable to think they might be added to the model manually.
    //undefined is also not part of the spec, but it's currently be supported to be more in line with ko.mapping and probably doesn't hurt.
    function isPrimitiveOrDate(obj) {
        return obj === null || obj === undefined ||  obj.constructor === String || obj.constructor === Number || obj.constructor === Boolean || obj instanceof Date;
    }


    //Gets settings for the specified path
    function getPathSettings(settings, context) {
        //Settings for more specific paths are chosen over less specific ones.
        var pathSettings = settings ? settings[context.full] || settings[context.parent] || settings[context.name] || {} : {};
        if (fnLog) fnLog(context, pathSettings, settings);//log what mapping will be used
        return pathSettings;
    }

    //Converts options into a dictionary of path settings
    //This allows for path settings to be looked up efficiently
    function getPathSettingsDictionary(options) {
        var result = {}, shared = options ? options.shared || {} : {},
            settings, fn, index, key, length, settingType, childName, child;
        for (settingType in options) {
            settings = options[settingType] || {};
            //Settings can either be dictionaries(associative arrays) or arrays
            //ignore shared option... contains functions that can be assigned by name
            if (settingType === "shared") continue;
            else if (isArray(settings,crossFrameSafe)) {//process array list for append and exclude
                for (index = 0, length = settings.length; index < length; index++) {
                    key = settings[index];
                    result[key] = result[key] || {};
                    result[key][settingType] = true;
                    result[key].settingType = result[key].settingType ? "multiple" : settingType;
                }
            }
            else if (isObject(settings,crossFrameSafe)) {//process associative array for extend and map
                for (key in settings) {
                    result[key] = result[key] || {};
                    fn = settings[key];
                    fn = settingType !== "arrayChildId" && fn && isString(fn,crossFrameSafe)&& shared[fn] ? shared[fn] : fn;
                    if (fn && isObject(fn,crossFrameSafe)) {//associative array for map/unmap passed in instead of map function
                        for (childName in fn) {
                            //if children of fn are strings then replace with shared function if available
                            if ((child = fn[childName]) && (isString(child,crossFrameSafe)) && shared[child]) {
                                fn[childName] = shared[child];
                            }
                        }
                    }
                    result[key][settingType] = fn;
                    result[key].settingType = result[key].settingType ? "multiple" : settingType;

                }
            }
        }
        return result;
    }


    function recursiveFrom(modelObj, settings, context, pathSettings) {
        var temp, result, p, length, idName, newContext, customPathSettings, extend, optionProcessed,
        childPathSettings, childObj;
        pathSettings = pathSettings || getPathSettings(settings, context);

        if (customPathSettings = pathSettings.custom) {
            optionProcessed = true;
            //custom can either be specified as a single map function or as an 
            //object with map and unmap properties
            if (isFunction(customPathSettings,crossFrameSafe)) {
                result = customPathSettings(modelObj);
                if (!isNullOrUndefined(result)) {
                    result.___$mapCustom = customPathSettings;
                }
            }
            else {
                result = customPathSettings.map(modelObj);
                if (!isNullOrUndefined(result)) {//extend object with mapping info where possible
                    result.___$mapCustom = customPathSettings.map;//preserve map function for updateFromModel calls
                    if (customPathSettings.unmap) {//preserve unmap function for toModel calls
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
        else if (isPrimitiveOrDate(modelObj)) {
            //primitive and date children of arrays aren't mapped... all others are
            result = context.parentIsArray ? modelObj : makeObservable(modelObj);
        }
        else if (isArray(modelObj, crossFrameSafe)) {
            result = [];

            for (p = 0, length = modelObj.length; p < length; p++) {
                result[p] = recursiveFrom(modelObj[p], settings, {
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
                    item = recursiveFrom(item, settings, newContext);
                    result.push(item);
                };
                result.unshiftFromModel = function (item) {
                    item = recursiveFrom(item, settings, newContext);
                    result.unshift(item);
                };
                result.popToModel = function (item) {
                    item = result.pop();
                    return recursiveTo(item, newContext);
                };
                result.shiftToModel = function (item) {
                    item = result.shift();
                    return recursiveTo(item, newContext);
                };
            }

        }
        else if (isObject(modelObj, crossFrameSafe))  {
            result = {};
            for (p in modelObj) {
                newContext = {
                    name: p,
                    parent: (context.name === "[i]" ? context.parent : context.name) + "." + p,
                    full: context.full + "." + p
                };
                childObj = modelObj[p];
                childPathSettings = isPrimitiveOrDate(childObj) ? getPathSettings(settings, newContext) : undefined;

                if (childPathSettings && childPathSettings.custom) {//primitivish value w/ custom mapping
                    //since primative children cannot store their own custom functions, handle processing here and store them in the parent
                    result.___$customChildren = result.___$customChildren || {};
                    result.___$customChildren[p] = childPathSettings.custom;

                    if (isFunction(childPathSettings.custom, crossFrameSafe)) {
                        result[p] = childPathSettings.custom(modelObj[p]);
                    }
                    else {
                        result[p] = childPathSettings.custom.map(modelObj[p]);
                    }
                }
                else {
                    temp = recursiveFrom(childObj, settings, newContext, childPathSettings);//call recursive from on each child property

                    if (temp !== badResult) {//properties that couldn't be mapped return badResult
                        result[p] = temp;
                    }

                }
            }
        }

        if (!optionProcessed && (extend = pathSettings.extend)) {
            if (isFunction(extend,crossFrameSafe)) {//single map function specified
                //Extend can either modify the mapped value or replace it
                //Falsy values assumed to be undefined
                result = extend(result) || result;
            }
            else if (isObject(extend,crossFrameSafe)) {//map and/or unmap were specified as part of object
                if (isFunction(extend.map,crossFrameSafe)) {
                    result = extend.map(result) || result;//use map to get result
                }

                if (isFunction(extend.unmap,crossFrameSafe)) {
                    result.___$unmapExtend = extend.unmap;//store unmap for use by toModel
                }
            }
        }
        return result;
    }

    function recursiveTo(viewModelObj, context) {
        var result, p, length, temp, unwrapped = unwrap(viewModelObj), child, recursiveResult,
            wasWrapped = (viewModelObj !== unwrapped);//this works because unwrap observable calls isObservable and returns the object unchanged if not observable

        if (fnLog) {
            fnLog(context);//log object being unmapped
        }

        if (!wasWrapped && viewModelObj && isFunction(viewModelObj, crossFrameSafe)) {//Exclude functions
            return badResult;
        }
        else if (viewModelObj && viewModelObj.___$unmapCustom) {//Defer to customUnmapping where specified
            result = viewModelObj.___$unmapCustom(viewModelObj);
        }
        else if ((wasWrapped && isPrimitiveOrDate(unwrapped)) || isNullOrUndefined(unwrapped)) {
            //return null, undefined, values, and wrapped primativish values as is
            result = unwrapped;
        }
        else if (isArray(unwrapped,crossFrameSafe)) {//create new array to return and add unwrapped values to it
            result = [];
            for (p = 0, length = unwrapped.length; p < length; p++) {
                result[p] = recursiveTo(unwrapped[p], {
                    name: "[i]", parent: context.name + "[i]", full: context.full + "[i]"
                });
            }
        }
        else if (isObject(unwrapped,crossFrameSafe)) {//create new object to return and add unwrapped values to it
            result = {};
            for (p in unwrapped) {
                if (p.substr(0, 4) !== "___$") {//ignore all properties starting with the magic string as internal
                    if (viewModelObj.___$customChildren && viewModelObj.___$customChildren[p] && viewModelObj.___$customChildren[p].unmap) {
                        result[p] = viewModelObj.___$customChildren[p].unmap(unwrapped[p]);
                    }
                    else {
                        child = unwrapped[p];
                        if (!ko.isComputed(child) && !((temp = unwrap(child)) && isFunction(temp,crossFrameSafe))) {

                            recursiveResult = recursiveTo(child, {
                                name: p,
                                parent: (context.name === "[i]" ? context.parent : context.name) + "." + p,
                                full: context.full + "." + p
                            });

                            //if badResult wasn't returned then add property
                            if (recursiveResult !== badResult) {
                                result[p] = recursiveResult;
                            }
                        }
                    }
                }
            }
        }
        else {
            //If it wasn't wrapped and it's not a function then return it.
            if (!wasWrapped && (!isFunction(unwrapped,crossFrameSafe))) {
                result = unwrapped;
            }
        }

        if (viewModelObj && viewModelObj.___$unmapExtend) {//if available call extend unmap function
            result = viewModelObj.___$unmapExtend(result, viewModelObj);
        }

        return result;
    }

    function recursiveUpdate(modelObj, viewModelObj, context, parentObj, noncontiguousObjectUpdateCount) {
        var p, q, foundModels, foundViewmodels, modelId, viewmodelId, idName, length, unwrapped = unwrap(viewModelObj),
            wasWrapped = (viewModelObj !== unwrapped), child, map, tempArray, childTemp, childMap, unwrappedChild, tempChild;

        if (fnLog) {
            fnLog(context);//log object being unmapped
        }

        if (wasWrapped && (isNullOrUndefined(unwrapped) ^ isNullOrUndefined(modelObj))) {
            //if you have an observable to update and either the new or old value is 
            //null or undefined then update the observable
            viewModelObj(modelObj);
        }
        else if (modelObj && unwrapped && isObject(unwrapped,crossFrameSafe) && isObject(modelObj,crossFrameSafe)) {
            for (p in modelObj) {//loop through object properties and update them

                if (viewModelObj.___$customChildren && viewModelObj.___$customChildren[p]) {
                    childMap = viewModelObj.___$customChildren[p].map || viewModelObj.___$customChildren[p];
                    unwrapped[p] = childMap(modelObj[p]);
                }
                else {
                    child = unwrapped[p];

                    if (!wasWrapped && unwrapped.hasOwnProperty(p) && (isPrimitiveOrDate(child) || (child && isArray(child,crossFrameSafe)))) {
                        unwrapped[p] = modelObj[p];
                    }
                    else if (child && isFunction(child.___$mapCustom,crossFrameSafe)) {
                        if (isObservable(child)) {
                            childTemp = child.___$mapCustom(modelObj[p], child);//get child value mapped by custom maping
                            childTemp = unwrap(childTemp);//don't nest observables... what you want is the value from the customMapping
                            child(childTemp);//update child;
                        }
                        else {//property wasn't observable? update it anyway for return to server
                            unwrapped[p] = child.___$mapCustom(modelObj[p], child);
                        }
                    }
                    else if (isNullOrUndefined(modelObj[p]) && unwrapped[p] && isObject(unwrapped[p],crossFrameSafe)) {
                        //Replace null or undefined with object for round trip to server; probably won't affect the view
                        //WORKAROUND: If values are going to switch between obj and null/undefined and the UI needs to be updated
                        //then the user should use the extend option to wrap the object in an observable
                        unwrapped[p] = modelObj[p];
                    }
                    else {//Recursive update everything else
                        if (!!noncontiguousObjectUpdateCount) {
                            var fnRecursivePropertyObjectUpdate = (function (modelObj, viewModelObj, p) {
                                return function () {//keep in sync with else below
                                    recursiveUpdate(modelObj[p], unwrapped[p], {
                                        name: p,
                                        parent: (context.name === "[i]" ? context.parent : context.name) + "." + p,
                                        full: context.full + "." + p
                                    }, unwrapped, noncontiguousObjectUpdateCount);
                                    noncontiguousObjectUpdateCount(noncontiguousObjectUpdateCount() - 1);
                                };
                            }(modelObj, viewModelObj, p));
                            noncontiguousObjectUpdateCount(noncontiguousObjectUpdateCount() + 1);
                            setTimeout(fnRecursivePropertyObjectUpdate, 0);
                        }
                        else {//keep in sync with if above
                            recursiveUpdate(modelObj[p], unwrapped[p], {
                                name: p,
                                parent: (context.name === "[i]" ? context.parent : context.name) + "." + p,
                                full: context.full + "." + p
                            });
                        }
                    }
                }
            }
        }
        else if (unwrapped && isArray(unwrapped,crossFrameSafe)) {
            if (idName = viewModelObj.___$childIdName) {//id is specified, create, update, and delete by id
                foundModels = [];
                foundViewmodels = [];
                for (p = modelObj.length - 1; p >= 0; p--) {
                    modelId = modelObj[p][idName];
                    for (q = unwrapped.length - 1; q >= 0; q--) {
                        child = unwrapped[q];
                        unwrappedChild = unwrap(child);
                        viewmodelId = unwrap(unwrappedChild[idName]);
                        if (viewmodelId === modelId) {//If updated model id equals viewmodel id then update viewmodel object with model data
                            if (child.___$mapCustom) {

                                if (ko.isObservable(child)) {
                                    tempChild = child.___$mapCustom(modelObj[p], child);
                                    if (isObservable(tempChild) && tempChild != child) {
                                        child(unwrap(tempChild));
                                    }
                                    //else custom mapping returned previous observable;
                                    //if it's smart enough to do that, assume it updated it correctly	
                                }
                                else {
                                    unwrapped[q] = child.___$mapCustom(modelObj[p], child);
                                }
                            }
                            else {
                                
                                if (!!noncontiguousObjectUpdateCount) {//keep in sync with else block below
                                    var fnRecursiveArrayChildObjectUpdate = (function (modelObj, viewModelObj, p, q) {
                                        return function () {
                                            recursiveUpdate(modelObj[p], unwrapped[q], {
                                                name: "[i]", parent: context.name + "[i]", full: context.full + "[i]"
                                            }, undefined, noncontiguousObjectUpdateCount);

                                            noncontiguousObjectUpdateCount(noncontiguousObjectUpdateCount() - 1);
                                        };
                                    }(modelObj, viewModelObj, p, q));
                                    noncontiguousObjectUpdateCount(noncontiguousObjectUpdateCount() + 1);
                                    setTimeout(fnRecursiveArrayChildObjectUpdate, 0);
                                }
                                else {//keep in sync with if block above
                                    recursiveUpdate(modelObj[p], unwrapped[q], {
                                        name: "[i]", parent: context.name + "[i]", full: context.full + "[i]"
                                    });
                                }
                            }
                            foundViewmodels[q] = true;
                            foundModels[p] = true;
                            break;
                        }
                    }
                }
                for (q = unwrapped.length - 1; q >= 0; q--) {
                    if (!foundViewmodels[q]) {//If missing from model remove from viewmodel
                        viewModelObj.splice(q, 1);
                    }
                }
                for (p = modelObj.length - 1; p >= 0; p--) {
                    if (!foundModels[p]) {//If not found and updated in viewmodel then add to viewmodel
                        viewModelObj.pushFromModel(modelObj[p]);
                    }
                }
            }
            else {//no id specified, replace old array items with new array items
                tempArray = [];
                map = viewModelObj.___$mapCustom;
                if (isFunction(map,crossFrameSafe)) {//update array with mapped objects, use indexer for performance
                    for (p = 0, length = modelObj.length; p < length; p++) {
                        tempArray[p] = modelObj[p];
                    }
                    viewModelObj(map(tempArray));
                }
                else {//Can't use indexer for assignment; have to preserve original mapping with push
                    viewModelObj(tempArray);
                    for (p = 0, length = modelObj ? modelObj.length : 0; p < length; p++) {
                        viewModelObj.pushFromModel(modelObj[p]);
                    }
                }
            }
        }
        else if (wasWrapped) {//If it makes it this far and it was wrapped then update it
            viewModelObj(modelObj);
        }

        if (context.name === "{root}" && !!noncontiguousObjectUpdateCount) {
            return {
                onComplete:function (fnOnComplete) {
                    if(fnOnComplete && isFunction(fnOnComplete, crossFrameSafe)){
                        if (!!noncontiguousObjectUpdateCount) {
                            ko.computed(function () {
                                if (fnOnComplete && noncontiguousObjectUpdateCount() === 0) {
                                    fnOnComplete();
                                    fnOnComplete = undefined;
                                }
                            }).extend({throttle:50});
                        }
                        else{
                            fnOnComplete();
                        }
                    }
                }
            };
        }
    }

    function initInternals(options, startMessage) {
        makeChildArraysObservable = options.makeChildArraysObservable;
        crossFrameSafe = options.crossFrameSafe;

        if (window.console && options.logging) {
            //if logging should be done then log start message and add logging function
            console.log(startMessage);

            //Updates the console with information about what has been mapped and how
            fnLog = function fnUpdateConsole(context, pathSettings, settings) {
                var msg;
                if (pathSettings && pathSettings.settingType) {//if a setting will be used log it
                    //message reads: SettingType FullPath (matched: path that was matched)
                    msg = pathSettings.settingType + " " + context.full + " (matched: '" + (
                        (settings[context.full] ? context.full : "") ||
                        (settings[context.parent] ? context.parent : "") ||
                        (context.name)
                    ) + "')";
                } else {//log that default mapping was used for the path
                    msg = "default " + context.full;
                }
                console.log("- " + msg);
            };
        }
        else {
            fnLog = undefined;//setting the fn to undefined makes it easy to test if logging should be done
        }
    }

    ko.viewmodel = {
        options: {
            makeChildArraysObservable: true,
            logging: false,
			crossFrameSafe: false
        },
        fromModel: function fnFromModel(model, options) {
            var settings = getPathSettingsDictionary(options);
            initInternals(this.options, "Mapping From Model");
            return recursiveFrom(model, settings, rootContext);
        },
        toModel: function fnToModel(viewmodel) {
            initInternals(this.options, "Mapping To Model");
            return recursiveTo(viewmodel, rootContext);
        },
        updateFromModel: function fnUpdateFromModel(viewmodel, model, makeNoncontiguousObjectUpdates) {
            var noncontiguousObjectUpdateCount = makeNoncontiguousObjectUpdates ? ko.observable(0) : undefined;
            initInternals(this.options, "Update From Model");
            return recursiveUpdate(model, viewmodel, rootContext, undefined, noncontiguousObjectUpdateCount);
        }
    };
}());
