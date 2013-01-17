/*ko.viewmodel.js - version 1.1.5
* Copyright 2013, Dave Herren http://coderenaissance.github.com/knockout.viewmodel/
* License: MIT (http://www.opensource.org/licenses/mit-license.php)*/
/*jshint eqnull:true, boss:true, loopfunc:true, evil:true, laxbreak:true, undef:true, unused:true, browser:true, immed:true, devel:true, sub: true, maxerr:50 */
/*global ko:false */
ko.viewmodel = (function () {
    //Declarations for compatibility with closure compiler
    var unwrapObservable = ko.utils.unwrapObservable,
        isObservable = ko.isObservable,
        makeObservable = ko.observable,
        makeObservableArray = ko.observableArray,
        rootContext = { name: "{root}", parentChildName: "{root}", qualifiedName: "{root}" };

    //Updates the console with information about what has been mapped and how
    //Note: All calls to this function should be preceeded by if(ko.viewmodel.logging) in order
    //to reduce the number of statements executed in the loop when logging is turned off
    //and reduce long running script errors in older versions of IE
    function updateConsole(context, pathSettings, settings) {
        var msg;
        if (ko.viewmodel.logging && window.console) {
            if (pathSettings && pathSettings.settingType) {
                msg = pathSettings.settingType + " " + context.qualifiedName + " (matched: '" + (
                    (settings[context.qualifiedName] ? context.qualifiedName : "") ||
                    (settings[context.parentChildName] ? context.parentChildName : "") ||
                    (context.name)
                ) + "')";
            } else {
                msg = "default " + context.qualifiedName;
            }
            window.console.log("- " + msg);
        }
    }

    //Gets settings for the specified path
    function GetPathSettings(settings, context) {
        //Settings for more specific paths are chosen over less specific ones.
        var pathSettings = settings ? settings[context.qualifiedName] || settings[context.parentChildName] || settings[context.name] || {} : {};
        if (ko.viewmodel.logging) updateConsole(context, pathSettings, settings);
        return pathSettings;
    }

    //Converts options into a dictionary of path settings
    //This allows for path settings to be looked up efficiently
    function GetPathSettingsDictionary(options) {
        var result = {}, settings, index, key, length, settingType;
        for (settingType in options) {
            settings = options[settingType] || {};
            //Settings can either be dictionaries(assiative arrays) or arrays
            if (settings.constructor === Array) {//process array list for append and exclude
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
                    result[key][settingType] = settings[key];
                    result[key].settingType = settingType;
                }
            }
        }
        return result;
    }

    function isNullOrUndefined(obj) { return obj === null || obj === undefined; }
    function isPrimativeOrDate(obj, objType) { return obj === null || obj === undefined || obj.constructor === String || obj.constructor === Number || obj.constructor === Boolean || obj.constructor === Date; }

    function fnRecursiveFrom(modelObj, settings, context, internalDoNotWrapArray) {
        var temp, mapped, p, length, idName, objType, newContext, customPathSettings,
        pathSettings = GetPathSettings(settings, context);

        if (customPathSettings = pathSettings["custom"]) {
            if (typeof customPathSettings === "function") {
                mapped = customPathSettings(modelObj);
            }
            else {
                mapped = customPathSettings["map"](modelObj);
                if (!isNullOrUndefined(mapped)) {
                    mapped["..map"] = customPathSettings["map"];
                    if (customPathSettings["unmap"]) {
                        mapped["..unmap"] = customPathSettings["unmap"];
                    }
                }
            }
        }
        else if (pathSettings["append"]) {
            if (modelObj != null) {
                modelObj["..appended"] = undefined;
            }
            mapped = modelObj;
        }
        else if (pathSettings["exclude"]) return;
        else if (isPrimativeOrDate(modelObj)) {
            mapped = context.parentIsArray ? modelObj : makeObservable(modelObj);
            if (pathSettings["id"]) {
                mapped["..isid"] = true;
            }
        }
        else if (modelObj.constructor === Array) {
            mapped = [];

            for (p = 0, length = modelObj.length; p < length; p++) {
                mapped[p] = fnRecursiveFrom(modelObj[p], settings, {
                    name: "[i]", parentChildName: context.name + "[i]", qualifiedName: context.qualifiedName + "[i]", parentIsArray: true
                });
            }

            if ((ko.viewmodel.mappingCompatability !== true || !context.parentIsArray) && !internalDoNotWrapArray) {
                newContext = { name: "[i]", parentChildName: context.name + "[i]", qualifiedName: context.qualifiedName + "[i]", parentIsArray: true };
                mapped = makeObservableArray(mapped);
                mapped["..push"] = mapped["push"];
                mapped["..unshift"] = mapped["unshift"];
                mapped["push"] = function (item, options) {
                    if (item === undefined) return;
                    item = (!options || options.map) ? fnRecursiveFrom(item, settings, newContext) : item;
                    mapped["..push"](item);
                };
                mapped["unshift"] = function (item, options) {
                    if (item === undefined) return;
                    item = (!options || options.map) ? fnRecursiveFrom(item, settings, newContext) : item;
                    mapped["..unshift"](item);
                };
            }

        }
        else if (modelObj.constructor === Object) {
            mapped = {};
            idName = undefined;
            for (p in modelObj) {
                temp = fnRecursiveFrom(modelObj[p], settings, {
                    name: p,
                    parentChildName: (context.name === "[i]" ? context.parentChildName : context.name) + "." + p,
                    qualifiedName: context.qualifiedName + "." + p
                });
                if (temp !== undefined) {
                    mapped[p] = temp;
                    idName = mapped[p] && mapped[p]["..isid"] ? p : idName;
                }
            }
            if (idName) {
                mapped["..idName"] = idName;
            }
        }

        return pathSettings["extend"] ? (pathSettings["extend"](mapped) || mapped) : mapped;
    }

    function fnRecursiveTo(viewModelObj, context) {
        var mapped, p, length, temp, unwrapped = unwrapObservable(viewModelObj), child, recursiveResult,
            wasWrapped = !(viewModelObj === unwrapped);//this works because unwrap observable calls isObservable and returns the object unchanged if not observable

        if (ko.viewmodel.logging) updateConsole(context, null);
        if (!wasWrapped && viewModelObj && viewModelObj.constructor === Function) return;
        if (viewModelObj && viewModelObj["..unmap"]) {
            mapped = viewModelObj["..unmap"](viewModelObj);
        }
        else if ((wasWrapped && isPrimativeOrDate(unwrapped)) || isNullOrUndefined(unwrapped) || unwrapped.hasOwnProperty("..appended")) {
            mapped = unwrapped;
        }
        else if (unwrapped.constructor === Array) {
            mapped = [];
            for (p = 0, length = unwrapped.length; p < length; p++) {
                mapped[p] = fnRecursiveTo(unwrapped[p], {
                    name: "[i]", parentChildName: context.name + "[i]", qualifiedName: context.qualifiedName + "[i]"
                });
            }
        }
        else if (unwrapped.constructor === Object) {
            mapped = {};
            for (p in unwrapped) {
                if (p.substr(0,2) !== ".."){
                    child = unwrapped[p];
                    if (!ko.isComputed(child) && !((temp = unwrapObservable(child)) && temp.constructor === Function)) {

                        recursiveResult = fnRecursiveTo(child, {
                            name: p,
                            parentChildName: (context.name === "[i]" ? context.parentChildName : context.name) + "." + p,
                            qualifiedName: context.qualifiedName + "." + p
                        });

                        //since undefined is returned for functions... check undefined result to check that the child wasn't a function... need to performance test alternatives
                        if (recursiveResult !== undefined || !((temp = unwrapObservable(child)) && temp.constructor === Function)) {
                            mapped[p] = recursiveResult;
                        }
                    }
                }
            }
        }
        else {
            if (!wasWrapped && (typeof unwrapped !== "function")) {
                mapped = unwrapped;
            }
        }

        return mapped;
    }

    function fnRecursiveUpdate(modelObj, viewModelObj, context) {
        var p, q, found, foundModels, modelId, idName, length, unwrapped = unwrapObservable(viewModelObj),
            wasWrapped = (viewModelObj !== unwrapped), child, map, tempArray;
        if (ko.viewmodel.logging) updateConsole(context, null);

        if (isNullOrUndefined(viewModelObj) || viewModelObj.hasOwnProperty("..appended") || unwrapped === modelObj) return;
        else if (wasWrapped && (isNullOrUndefined(unwrapped) ^ isNullOrUndefined(modelObj))) {
            viewModelObj(modelObj);
        }
        else if (unwrapped.constructor == Object && modelObj.constructor === Object) {
            for (p in modelObj) {
                child = unwrapped[p];
                if (child && typeof child["..map"] === "function") {
                    if (isObservable(child)) {
                        child(unwrapObservable(child["..map"](modelObj[p])));
                    }
                    else {
                        unwrapped[p] = unwrapped[p]["..map"](modelObj[p]);
                    }
                }
                else if (modelObj[p] === null && unwrapped[p] && unwrapped[p].constructor === Object) {
                    unwrapped[p] = null;
                }
                else {
                    fnRecursiveUpdate(modelObj[p], unwrapped[p], {
                        name: p,
                        parentChildName: (context.name === "[i]" ? context.parentChildName : context.name) + "." + p,
                        qualifiedName: context.qualifiedName + "." + p
                    });
                }
            }
        }
        else if (unwrapped && unwrapped.constructor === Array) {
            if (idName = unwrapped["..idName"]) {//id is specified, create, update, and delete by id
                foundModels = [];
                for (p = modelObj.length - 1; p >= 0; p--) {
                    found = false;
                    modelId = modelObj[p][idName];
                    for (q = unwrapped.length - 1; q >= 0; q--) {
                        if (modelId === unwrapped[q][idName]()) {//If updated model id equals viewmodel id then update viewmodel object with model data
                            fnRecursiveUpdate(modelObj[p], unwrapped[q], {
                                name: "[i]", parentChildName: context.name + "[i]", qualifiedName: context.qualifiedName + "[i]"
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
                        viewModelObj.push(modelObj[p]);
                    }
                }
            }
            else {//no id specified, replace old array items with new array items
                tempArray = [];
                map = viewModelObj["..map"];
                if (typeof map === "function") {//update array with mapped objects, use indexer for performance
                    for (p = 0, length = modelObj.length; p < length; p++) {
                        tempArray[p] = modelObj[p];
                    }
                    viewModelObj(map(tempArray));
                }
                else {//Can't use indexer for assignment; have to preserve original mapping with push
                    viewModelObj(tempArray);
                    for (p = 0, length = modelObj.length; p < length; p++) {
                        viewModelObj.push(modelObj[p]);
                    }
                }
            }
        }
        else if (wasWrapped) {
            viewModelObj(modelObj);
        }
    }
    return {
        mappingCompatability: false,
        logging: false,
        fromModel: function fnFromModel(model, options) {
            var settings = GetPathSettingsDictionary(options);
            if (ko.viewmodel.logging && window.console) window.console.log("Mapping From Model");
            return fnRecursiveFrom(model, settings, rootContext);
        },
        toModel: function fnToModel(viewmodel) {
            if (ko.viewmodel.logging && window.console) window.console.log("Mapping To Model");
            return fnRecursiveTo(viewmodel, rootContext);
        },
        updateFromModel: function fnUpdateFromModel(viewmodel, model) {
            if (ko.viewmodel.logging && window.console) window.console.log("Update From Model");
            return fnRecursiveUpdate(model, viewmodel, rootContext);
        }
    };
}());
