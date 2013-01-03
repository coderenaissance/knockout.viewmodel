/*ko.viewmodel.js - version 1.1.0
* Copyright 2012, Dave Herren http://coderenaissance.github.com/knockout.viewmodel/
* License: MIT (http://www.opensource.org/licenses/mit-license.php)*/
/*jshint eqnull:true, boss:true, loopfunc:true, evil:true, laxbreak:true, undef:true, unused:true, browser:true, immed:true, devel:true, sub: true, maxerr:50 */
/*global ko:false */
ko["viewmodel"] = (function () {
    //Declarations for compatibility with closure compiler
    var unwrapObservable = ko["utils"]["unwrapObservable"],
        isObservable = ko["isObservable"],
        makeObservable = ko["observable"],
        makeObservableArray = ko["observableArray"],
        rootContext = { name: "{root}", parentChildName: "{root}", qualifiedName: "{root}" };

    function updateConsole(context, pathSettings) {
        var msg;
        if (ko.viewmodel.logging && window.console) {
            if (pathSettings && pathSettings.settingType) {
                msg = pathSettings.settingType + " " + context.qualifiedName + " (matched: '" + (
                    (pathSettings[context.qualifiedName + ":" + pathSettings.settingType] ? context.qualifiedName : "") ||
                    (pathSettings[context.parentChildName + ":" + pathSettings.settingType] ? context.parentChildName : "") ||
                    (context.name)
                ) + "')";
            } else {
                msg = "default " + context.qualifiedName;
            }
            window.console.log("- " + msg);
        }
    }
    function GetPathSettings(settings, context) {
        var pathSettings = settings ? settings[context.qualifiedName] || settings[context.parentChildName] || settings[context.name] || {} : {};
        updateConsole(context, pathSettings);
        return pathSettings;
    }
    function GetSettingsFromOptions(options) {
        var mapping = {}, settings, index, key, settingType;
        for (settingType in options) {
            settings = options[settingType] || {};
            if (settings.length !== undefined) {
                for (index = 0; index < settings.length; index++) {
                    key = settings[index];
                    mapping[key] = {};
                    mapping[key][settingType] = true;
                    mapping[key].settingType = settingType;
                }
            }
            else {
                for (key in settings) {
                    mapping[key] = {};
                    mapping[key][settingType] = settings[key];
                    mapping[key].settingType = settingType;
                }
            }
        }
        return mapping;
    }

    function isNullOrUndefined(obj) { return obj === null || obj === undefined; }
    function isStandardProperty(obj, objType) { return obj === null || objType === "undefined" || objType === "string" || objType === "number" || objType === "boolean" || (objType === "object" && typeof obj.getMonth === "function"); }
    function isObjectProperty(obj, objType) { return obj != null && objType === "object" && obj.length === undefined && !isStandardProperty(obj, objType); }
    function isArrayProperty(obj, objType) { return obj != null && objType === "object" && obj.length !== undefined; }

    function fnRecursiveFrom(modelObj, settings, context) {
        var temp, mapped, p, idName, objType = typeof modelObj, newContext,
        pathSettings = GetPathSettings(settings, context);
        if (pathSettings["custom"]) {
            if (typeof pathSettings["custom"] === "function") {
                mapped = pathSettings["custom"](modelObj);
            }
            else {
                mapped = pathSettings["custom"]["map"](modelObj);
                if (!isNullOrUndefined(mapped)) {
                    mapped["..map"] = pathSettings["custom"]["map"];
                    if (pathSettings["custom"]["unmap"]) {
                        mapped["..unmap"] = pathSettings["custom"]["unmap"];
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
        else if (isStandardProperty(modelObj, objType)) {
            mapped = context.parentIsArray ? modelObj : makeObservable(modelObj);
            if (pathSettings["id"]) {
                mapped["..isid"] = true;
            }
        }
        else if (isObjectProperty(modelObj, objType)) {
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
        else if (isArrayProperty(modelObj, objType)) {
            mapped = [];

            for (p = 0; p < modelObj.length; p++) {
                mapped[p] = fnRecursiveFrom(modelObj[p], settings, {
                    name: "[i]", parentChildName: context.name + "[i]", qualifiedName: context.qualifiedName + "[i]", parentIsArray: true
                });
            }

            if (!context.parentIsArray) {
                newContext = { name: "[i]", parentChildName: context.name + "[i]", qualifiedName: context.qualifiedName + "[i]", parentIsArray: true};
                mapped = ko.observableArray(mapped);
                mapped["..push"] = mapped["push"];
                mapped["..unshift"] = mapped["unshift"];
                mapped["..shift"] = mapped["shift"];
                mapped["..pop"] = mapped["pop"];
                mapped["push"] = function (item, options) {
                    if (item === undefined) return;
                    item = options && options.map ? item : fnRecursiveFrom(item, settings, newContext);
                    mapped["..push"](item);
                };
                mapped["unshift"] = function (item, options) {
                    if (item === undefined) return;
                    item = options && options.map ? item : fnRecursiveFrom(item, settings, newContext);
                    mapped["..unshift"](item);
                };
                mapped["pop"] = function (options) {
                    var result = mapped["..pop"](item);
                    return options && options.unmap ? fnRecursiveTo(result) : result;
                };
                mapped["shift"] = function (unmap) {
                    var result = mapped["..shift"](item);
                    return options && options.unmap ? fnRecursiveTo(result) : result;
                };
            }

        }
        return pathSettings["extend"] ? (pathSettings["extend"](mapped) || mapped) : mapped;
    }

    function fnRecursiveTo(viewModelObj, context) {
        var mapped, p, unwrapped = unwrapObservable(viewModelObj),
            wasNotWrapped = (viewModelObj === unwrapped),
            objType = typeof unwrapped;
        updateConsole(context, null);
        if (viewModelObj === null) {
            return null;
        }
        else if (viewModelObj !== undefined && viewModelObj["..unmap"]) {
            mapped = viewModelObj["..unmap"](viewModelObj);
        }
        else if (unwrapped === null || unwrapped.hasOwnProperty("..appended")) {
            mapped = unwrapped;
        }
        else if (isStandardProperty(unwrapped, objType) && !wasNotWrapped) {
            mapped = unwrapped;
        }
        else if (isObjectProperty(unwrapped, objType)) {
            mapped = {};
            for (p in unwrapped) {
                mapped[p] = fnRecursiveTo(unwrapped[p], {
                    name: p,
                    parentChildName: (context.name === "[i]" ? context.parentChildName : context.name) + "." + p,
                    qualifiedName: context.qualifiedName + "." + p
                });
            }
        }
        else if (isArrayProperty(unwrapped, objType)) {
            mapped = [];
            for (p = 0; p < unwrapped.length; p++) {
                mapped.push(fnRecursiveTo(unwrapped[p], {
                    name: "[i]", parentChildName: context.name + "[i]", qualifiedName: context.qualifiedName + "[i]"
                }));
            }
        }
        return mapped;
    }

    function fnRecursiveUpdate(modelObj, viewModelObj, context) {
        var p, q, found, foundModels, modelId, idName, unwrapped = unwrapObservable(viewModelObj), unwrappedType = typeof unwrapped,
            wasWrapped = (viewModelObj !== unwrapped);
        updateConsole(context, null);
        if (isNullOrUndefined(viewModelObj) || viewModelObj.hasOwnProperty("..appended")) return;
        else if (viewModelObj === undefined || unwrapped === modelObj) return;
        else if (wasWrapped && (isNullOrUndefined(unwrapped) ^ isNullOrUndefined(modelObj))) {
            viewModelObj(modelObj);
        }
        else if (isObjectProperty(unwrapped, unwrappedType) && isObjectProperty(modelObj, unwrappedType)) {
            for (p in modelObj) {
                if (unwrapped[p] && typeof unwrapped[p]["..map"] === "function") {
                    if (isObservable(unwrapped[p])) {
                        unwrapped[p](unwrapObservable(unwrapped[p]["..map"](modelObj[p])));
                    }
                    else {
                        unwrapped[p] = unwrapped[p]["..map"](modelObj[p]);
                    }
                }
                else if (modelObj && modelObj[p] === null && isObjectProperty(unwrapped[p], typeof unwrapped[p])) {
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
        else if (isArrayProperty(unwrapped, unwrappedType)) {
            if (unwrapped[0]["..idName"]) {//array
                idName = unwrapped[0]["..idName"];
                foundModels = [];
                for (p = modelObj.length - 1; p >= 0; p--) {
                    found = false;
                    modelId = modelObj[p][idName];
                    for (q = unwrapped.length - 1; q >= 0; q--) {
                        if (modelId === unwrapped[q][idName]()) {
                            fnRecursiveUpdate(modelObj[p], unwrapped[p], {
                                name: "[i]", parentChildName: context.name + "[i]", qualifiedName: context.qualifiedName + "[i]"
                            });
                            found = true;
                            foundModels[q] = true;
                            break;
                        }
                    }
                    if (!found) {
                        viewModelObj.splice(p, 1);
                    }
                }
                for (p = modelObj.length - 1; p >= 0; p--) {
                    if (!foundModels[p]) {
                        viewModelObj.push(modelObj[p]);
                    }
                }
            }
            else {
                viewModelObj([]);
                for (p = 0; p < modelObj.length; p++) {
                    if (typeof viewModelObj["..map"] === "function") {
                        viewModelObj.push(viewModelObj["..map"](modelObj));
                    }
                    else {
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
        "logging": false,
        "fromModel": function fnFromModel(model, options) {
            var settings = GetSettingsFromOptions(options);
            if (ko.viewmodel.logging && window.console) window.console.log("Mapping From Model");
            return fnRecursiveFrom(model, settings, rootContext);
        },
        "toModel": function fnToModel(viewmodel) {
            if (ko.viewmodel.logging && window.console) window.console.log("Mapping To Model");
            return fnRecursiveTo(viewmodel, rootContext);
        },
        "updateFromModel": function fnUpdateFromModel(viewmodel, model) {
            if (ko.viewmodel.logging && window.console) window.console.log("Update From Model");
            return fnRecursiveUpdate(model, viewmodel, rootContext);
        }
    };
}());
