/*ko.viewmodel.js - version 2.0.0
* Copyright 2013, Dave Herren http://coderenaissance.github.com/knockout.viewmodel/
* License: MIT (http://www.opensource.org/licenses/mit-license.php)*/
/*jshint eqnull:true, boss:true, loopfunc:true, evil:true, laxbreak:true, undef:true, unused:true, browser:true, immed:true, devel:true, sub: true, maxerr:50 */
/*global ko:false */

//The following recursive algorithms, functions which call themselves, but are conceptually just loops
//Like all loops when executed over a large enough number of items every statement executed bears a noticible load 
//Performance is of key concern in this project, so in many cases terse code is used to reduce the number of statements executed
//which is especially important in older versions of IE; Given equal performance less terse code is to be prefered.
ko.viewmodel = (function () {
    //Module declarations. For increased compression with simple settings on the closure compiler,
    //the ko functions are stored in variables. These variable names will be shortened by the compiler, 
    //whereas references to ko would not be. There is also a performance savings from this.
    var unwrap = ko.utils.unwrapObservable,
        isObservable = ko.isObservable,
        makeObservable = ko.observable,
        makeObservableArray = ko.observableArray,
        rootContext = { name: "{root}", parent: "{root}", full: "{root}" },
        fnLog, makeChildArraysObservable,
        badResult = function fnBadResult() { };

    //Gets settings for the specified path
    function GetPathSettings(settings, context) {
        //Settings for more specific paths are chosen over less specific ones.
        var pathSettings = settings ? settings[context.full] || settings[context.parent] || settings[context.name] || {} : {};
        if (fnLog) fnLog(context, pathSettings, settings);//log what mapping will be used
        return pathSettings;
    }

    //Converts options into a dictionary of path settings
    //This allows for path settings to be looked up efficiently
    function GetPathSettingsDictionary(options) {
        var result = {}, shared = options ? options.shared || {} : {},
            settings, fn, index, key, length, settingType;
        for (settingType in options) {
            settings = options[settingType] || {};
            //Settings can either be dictionaries(associative arrays) or arrays
            //ignore shared option... contains functions that can be assigned by name
            if (settingType === "shared") continue;
            else if (settings instanceof Array) {//process array list for append and exclude
                for (index = 0, length = settings.length; index < length; index++) {
                    key = settings[index];
                    result[key] = result[key] || {};
                    result[key][settingType] = true;
                    result[key].settingType = result[key].settingType ? "multiple" : settingType;
                }
            }
            else {//process associative array for extend and map
                for (key in settings) {
                    result[key] = result[key] || {};
                    fn = settings[key];
                    fn = settingType !== "arrayChildId" && fn && fn.constructor === String && shared[fn] ? shared[fn] : fn;
                    result[key][settingType] = fn;
                    result[key].settingType = result[key].settingType ? "multiple" : settingType;
                }
            }
        }
        return result;
    }

    function isNullOrUndefined(obj) {//checks if obj is null or undefined
        return obj === null || obj === undefined;
    }

    //while dates aren't part of the JSON spec it doesn't hurt to support them as it's not unreasonable to think they might be added to the model manually.
    //undefined is also not part of the spec, but it's currently be supported to be more in line with ko.mapping and probably doesn't hurt.
    function isPrimativeOrDate(obj) {
        return obj === null || obj === undefined || obj.constructor === String || obj.constructor === Number || obj.constructor === Boolean || obj instanceof Date;
    }

    function fnRecursiveFrom(modelObj, settings, context) {
        var temp, result, p, length, idName, newContext, customPathSettings, extend, optionProcessed,
        pathSettings = GetPathSettings(settings, context);

        if (fnLog) {//Log object being mapped
            fnLog(context);
        }

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
            //Q:Can't mark null or undefined as appended, all others are ok
            if (!isNullOrUndefined(modelObj)) {
                modelObj.___$appended = undefined;
            }
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
                result[p] = fnRecursiveFrom(modelObj[p], settings, {
                    name: "[i]", parent: context.name + "[i]", full: context.full + "[i]", parentIsArray: true
                });
            }

            //only makeObservableArray extend with mapping functions if it's not a nested array or mapping compatabitlity is off
            if (makeChildArraysObservable !== true || !context.parentIsArray) {

                newContext = { name: "[i]", parent: context.name + "[i]", full: context.full + "[i]", parentIsArray: true };
                result = makeObservableArray(result);

                //if available add id name to object so it can be accessed later when updating children
                if (idName = pathSettings.arrayChildId) {
                    result.___$childIdName = idName;
                }

                //wrap array methods for adding and removing items in functions that
                //close over settings and context allowing the objects and their children to be correctly mapped.
                result.pushFromModel = function (item) {
                    item = fnRecursiveFrom(item, settings, newContext);
                    result.push(item);
                };
                result.unshiftFromModel = function (item) {
                    item = fnRecursiveFrom(item, settings, newContext);
                    result.unshift(item);
                };
                result.popToModel = function (item) {
                    item = result.pop();
                    return fnRecursiveTo(item, newContext);
                };
                result.shiftToModel = function (item) {
                    item = result.shift();
                    return fnRecursiveTo(item, newContext);
                };
            }

        }
        else if (modelObj.constructor === Object) {
            result = {};
            for (p in modelObj) {
                temp = fnRecursiveFrom(modelObj[p], settings, {//call recursive from on each child property
                    name: p,
                    parent: (context.name === "[i]" ? context.parent : context.name) + "." + p,
                    full: context.full + "." + p
                });

                if (temp !== badResult) {//properties that couldn't be mapped return badResult
                    result[p] = temp;
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

    function fnRecursiveTo(viewModelObj, context) {
        var result, p, length, temp, unwrapped = unwrap(viewModelObj), child, recursiveResult,
            wasWrapped = (viewModelObj !== unwrapped);//this works because unwrap observable calls isObservable and returns the object unchanged if not observable

        if (fnLog) {
            fnLog(context);//log object being unmapped
        }

        if (!wasWrapped && viewModelObj && viewModelObj.constructor === Function) {//Exclude functions
            return badResult;
        }
        else if (viewModelObj && viewModelObj.___$unmapCustom) {//Defer to customUnmapping where specified
            result = viewModelObj.___$unmapCustom(viewModelObj);
        }
        else if ((wasWrapped && isPrimativeOrDate(unwrapped)) || isNullOrUndefined(unwrapped) || unwrapped.hasOwnProperty("___$appended")) {
            //return null, undefined, appended values, and wrapped primativish values as is
            result = unwrapped;
        }
        else if (unwrapped instanceof Array) {//create new array to return and add unwrapped values to it
            result = [];
            for (p = 0, length = unwrapped.length; p < length; p++) {
                result[p] = fnRecursiveTo(unwrapped[p], {
                    name: "[i]", parent: context.name + "[i]", full: context.full + "[i]"
                });
            }
        }
        else if (unwrapped.constructor === Object) {//create new object to return and add unwrapped values to it
            result = {};
            for (p in unwrapped) {
                if (p.substr(0, 2) !== "___$") {//ignore all properties starting with the magic string as internal
                    child = unwrapped[p];
                    if (!ko.isComputed(child) && !((temp = unwrap(child)) && temp.constructor === Function)) {

                        recursiveResult = fnRecursiveTo(child, {
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
        else {
            //If it wasn't wrapped and it's not a function then return it.
            if (!wasWrapped && (typeof unwrapped !== "function")) {
                result = unwrapped;
            }
        }

        if (viewModelObj && viewModelObj.___$unmapExtend) {//if available call extend unmap function
            result = viewModelObj.___$unmapExtend(result, viewModelObj);
        }

        return result;
    }

    function fnRecursiveUpdate(modelObj, viewModelObj, context) {
        var p, q, found, foundModels, modelId, idName, length, unwrapped = unwrap(viewModelObj),
            wasWrapped = (viewModelObj !== unwrapped), child, map, tempArray, childTemp;
        if (fnLog) fnLog(context);//Log object being updated

        if (wasWrapped && (isNullOrUndefined(unwrapped) ^ isNullOrUndefined(modelObj))) {
            //if you have an observable to update and either the new or old value is 
            //null or undefined then update the observable
            viewModelObj(modelObj);
        }
        else if (modelObj && unwrapped && unwrapped.constructor == Object && modelObj.constructor === Object) {
            for (p in modelObj) {//loop through object properties and update them
                child = unwrapped[p];
                if (!isNullOrUndefined(child) && viewModelObj.hasOwnProperty("___$appended")) {
                    //update appended child for round trip to server... 
                    //this probably won't affect view in most cases, though it could
                    //Q: what would be the work around if the user didn't want this updated?
                    unwrapped[p] = modelObj;
                }
                else if (child && typeof child.___$mapCustom === "function") {
                    if (isObservable(child)) {
                        childTemp = child.___$mapCustom(modelObj[p])//get child value mapped by custom maping
                        childTemp = unwrap(childTemp);//don't nest observables... what you want is the value from the customMapping
                        child(childTemp);//update child;
                    }
                    else {//property wasn't observable? update it anyway for return to server
                        unwrapped[p] = unwrapped[p].___$mapCustom(modelObj[p]);
                    }
                }
                else if (isNullOrUndefined(modelObj[p]) && unwrapped[p] && unwrapped[p].constructor === Object) {
                    //Replace null or undefined with object for round trip to server; probably won't affect the view
                    //WORKAROUND: If values are going to switch between obj and null/undefined and the UI needs to be updated
                    //then the user should use the extend option to wrap the object in an observable
                    unwrapped[p] = modelObj[p];
                }
                else {//Recursive update everything else
                    fnRecursiveUpdate(modelObj[p], unwrapped[p], {
                        name: p,
                        parent: (context.name === "[i]" ? context.parentChildName : context.name) + "." + p,
                        full: context.full + "." + p
                    });
                }
            }
        }
        else if (unwrapped && unwrapped instanceof Array) {
            if (idName = viewModelObj.___$childIdName) {//id is specified, create, update, and delete by id
                foundModels = [];
                for (p = modelObj.length - 1; p >= 0; p--) {
                    found = false;
                    modelId = modelObj[p][idName];
                    for (q = unwrapped.length - 1; q >= 0; q--) {
                        if (modelId === unwrapped[q][idName]()) {//If updated model id equals viewmodel id then update viewmodel object with model data
                            fnRecursiveUpdate(modelObj[p], unwrapped[q], {
                                name: "[i]", parentChildName: context.name + "[i]", full: context.full + "[i]"
                            });
                            found = true;
                            foundModels[q] = true;
                            break;
                        }
                    }
                    if (!found) {//If not found in updated model then remove from viewmodel
                        viewModelObj.splice(p, 1);
                    }
                }
                for (p = modelObj.length - 1; p >= 0; p--) {
                    if (!foundModels[p]) {//If found and updated in viewmodel then add to viewmodel
                        viewModelObj.pushFromModel(modelObj[p]);
                    }
                }
            }
            else {//no id specified, replace old array items with new array items
                tempArray = [];
                map = viewModelObj.___$mapCustom;
                if (typeof map === "function") {//update array with mapped objects, use indexer for performance
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
    }

    function initInternals(options, startMessage) {
        makeChildArraysObservable = options.makeChildArraysObservable;
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

    return {
        options: {
            makeChildArraysObservable: true,
            logging: false
        },
        fromModel: function fnFromModel(model, options) {
            var settings = GetPathSettingsDictionary(options);
            initInternals(this.options, "Mapping From Model");
            return fnRecursiveFrom(model, settings, rootContext);
        },
        toModel: function fnToModel(viewmodel) {
            initInternals(this.options, "Mapping To Model");
            return fnRecursiveTo(viewmodel, rootContext);
        },
        updateFromModel: function fnUpdateFromModel(viewmodel, model) {
            initInternals(this.options, "Update From Model");
            return fnRecursiveUpdate(model, viewmodel, rootContext);
        }
    };
}());
