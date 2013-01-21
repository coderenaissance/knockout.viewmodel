/*ko.viewmodel.js - version 1.1.5
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
        fnLog, isCompat;

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
            //Settings can either be dictionaries(assiative arrays) or arrays
            //ignore shared option... contains functions that can be assigned by name
            if (settingType === "shared") continue;
            else if (settings instanceof Array) {//process array list for append and exclude
                for (index = 0, length = settings.length; index < length; index++) {
                    key = settings[index];
                    result[key] = {};
                    result[key][settingType] = true;
                    result[key].settingType = settingType;
                }
            }
            else {//process associative array for extend and map
                for (key in settings) {
                    result[key] = {};
                    fn = settings[key];
                    fn = settingType !== "arrayChildId" && fn && fn.constructor === String && shared[fn] ? shared[fn] : fn;
                    result[key][settingType] = fn;
                    result[key].settingType = settingType;
                }
            }
        }
        return result;
    }

    function isNullOrUndefined(obj) {
        return obj === null || obj === undefined;
    }

    //while dates aren't part of the JSON spec it doesn't hurt to support them as it's not unreasonable to think they might be added to the model manually.
    //undefined is also not part of the spec, but it's currently be supported to be more in line with ko.mapping and probably doesn't hurt.
    function isPrimativeOrDate(obj) {
        return obj === null || obj === undefined || obj.constructor === String || obj.constructor === Number || obj.constructor === Boolean || obj instanceof Date;
    }

    function fnRecursiveFrom(modelObj, settings, context, internalDoNotWrapArray) {
        var temp, result, p, length, idName, newContext, customPathSettings, extend,
        pathSettings = GetPathSettings(settings, context);

        if (fnLog) fnLog(context);//Log object being mapped
        if (customPathSettings = pathSettings.custom) {
            //custom can either be specified as a single map function or as an 
            //object with map and unmap properties
            if (typeof customPathSettings === "function") {
                result = customPathSettings(modelObj);
            }
            else {
                result = customPathSettings.map(modelObj);
                if (!isNullOrUndefined(result)) {//extend object with mapping info where possible
                    result.$$$mapCustom = customPathSettings.map;//preserve map function for updateFromModel calls
                    if (customPathSettings.unmap) {//perserve unmap function for toModel calls
                        result.$$$unmapCustom = customPathSettings.unmap;
                    }
                }
            }
        }
        else if (pathSettings.append) {
            if (!isNullOrUndefined(modelObj)) {
                modelObj.$$$appended = undefined;
            }
            result = modelObj;
        }
        else if (pathSettings.exclude) return;
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

            if ((isCompat !== true || !context.parentIsArray) && !internalDoNotWrapArray) {

                newContext = { name: "[i]", parent: context.name + "[i]", full: context.full + "[i]", parentIsArray: true };
                result = makeObservableArray(result);

                //add id name to object so it can be accessed later when updating children
                if (idName = pathSettings.arrayChildId) {
                    result.$$$childIdName = idName;
                }

                //wrap push and unshift with functions that will map objects
                //the functions close over settings and context allowing the objects and their children
                //to be corre correctly mapped. Options allow mapping to be overridden for already mapped objects.
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

            //create mapped object
            for (p in modelObj) {
                temp = fnRecursiveFrom(modelObj[p], settings, {//call recursive from on each child property
                    name: p,
                    parent: (context.name === "[i]" ? context.parent : context.name) + "." + p,
                    full: context.full + "." + p
                });

                if (temp !== undefined) {//TODO:Why checking for undefined here?
                    result[p] = temp;
                }
            }
        }

        
        if (extend = pathSettings.extend) {
            if (typeof extend === "function") {
                //Extend can either modify the mapped value or replace it
                //Falsy values assumed to be undefined
                result = extend(result) || result;
            }
            else if (extend.constructor === Object){
                if (typeof extend.map === "function") {
                    result = extend.map(result) || result;
                }

                if (typeof extend.unmap === "function") {
                    result.$$$unmapExtend = extend.unmap;
                }
            }
        }
        return result;
    }

    function fnRecursiveTo(viewModelObj, context) {
        var result, p, length, temp, unwrapped = unwrap(viewModelObj), child, recursiveResult,
            wasWrapped = (viewModelObj !== unwrapped);//this works because unwrap observable calls isObservable and returns the object unchanged if not observable

        if (fnLog) fnLog(context);//log object being unmapped
        if (!wasWrapped && viewModelObj && viewModelObj.constructor === Function) return;
        if (viewModelObj && viewModelObj.$$$unmapCustom) {
            result = viewModelObj.$$$unmapCustom(viewModelObj);
        }
        else if ((wasWrapped && isPrimativeOrDate(unwrapped)) || isNullOrUndefined(unwrapped) || unwrapped.hasOwnProperty("$$$appended")) {
            result = unwrapped;
        }
        else if (unwrapped instanceof Array) {
            result = [];
            for (p = 0, length = unwrapped.length; p < length; p++) {
                result[p] = fnRecursiveTo(unwrapped[p], {
                    name: "[i]", parent: context.name + "[i]", full: context.full + "[i]"
                });
            }
        }
        else if (unwrapped.constructor === Object) {
            result = {};
            for (p in unwrapped) {
                if (p.substr(0,2) !== "$$$"){
                    child = unwrapped[p];
                    if (!ko.isComputed(child) && !((temp = unwrap(child)) && temp.constructor === Function)) {

                        recursiveResult = fnRecursiveTo(child, {
                            name: p,
                            parent: (context.name === "[i]" ? context.parent : context.name) + "." + p,
                            full: context.full + "." + p
                        });

                        //since undefined is returned for functions... check undefined result to check that the child wasn't a function... need to performance test alternatives
                        if (recursiveResult !== undefined || !((temp = unwrap(child)) && temp.constructor === Function)) {
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

        if (viewModelObj && viewModelObj.$$$unmapExtend) {
            result = viewModelObj.$$$unmapExtend(result, viewModelObj);
        }

        return result;
    }

    function fnRecursiveUpdate(modelObj, viewModelObj, context) {
        var p, q, found, foundModels, modelId, idName, length, unwrapped = unwrap(viewModelObj),
            wasWrapped = (viewModelObj !== unwrapped), child, map, tempArray;
        if (fnLog) fnLog(context);//Log object being updated

        if (!isNullOrUndefined(viewModelObj) && (viewModelObj.hasOwnProperty("$$$appended") || unwrapped === modelObj)) return;
        else if (wasWrapped && (isNullOrUndefined(unwrapped) ^ isNullOrUndefined(modelObj))) {
            viewModelObj(modelObj);
        }
        else if (modelObj && unwrapped && unwrapped.constructor == Object && modelObj.constructor === Object) {
            for (p in modelObj) {
                child = unwrapped[p];
                if (child && typeof child.$$$mapCustom === "function") {
                    if (isObservable(child)) {
                        child(unwrap(child.$$$mapCustom(modelObj[p])));
                    }
                    else {
                        unwrapped[p] = unwrapped[p].$$$mapCustom(modelObj[p]);
                    }
                }
                else if (isNullOrUndefined(modelObj[p]) && unwrapped[p] && unwrapped[p].constructor === Object) {
                    unwrapped[p] = modelObj[p];
                }
                else {
                    fnRecursiveUpdate(modelObj[p], unwrapped[p], {
                        name: p,
                        parent: (context.name === "[i]" ? context.parentChildName : context.name) + "." + p,
                        full: context.full + "." + p
                    });
                }
            }
        }
        else if (unwrapped && unwrapped instanceof Array) {
            if (idName = viewModelObj.$$$childIdName) {//id is specified, create, update, and delete by id
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
                map = viewModelObj.$$$mapCustom;
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
        isCompat = options.mappingCompatability;
        if (window.console && options.logging) {
            console.log(startMessage);
            //Updates the console with information about what has been mapped and how
            fnLog = function fnUpdateConsole(context, pathSettings, settings) {
                var msg;
                if (pathSettings && pathSettings.settingType) {
                    msg = pathSettings.settingType + " " + context.full + " (matched: '" + (
                        (settings[context.full] ? context.full : "") ||
                        (settings[context.parent] ? context.parent : "") ||
                        (context.name)
                    ) + "')";
                } else {
                    msg = "default " + context.full;
                }
                console.log("- " + msg);
            };
        }
        else {
            fnLog = undefined;
        }
    }

    return {
        options: {
            mappingCompatability: false,
            logging: false
        },
        fromModel: function fnFromModel(model, options) {
                settings = GetPathSettingsDictionary(options);
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
