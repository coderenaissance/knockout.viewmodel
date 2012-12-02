/*ko.viewmodel.js v1.0
* Copyright 2012, Dave Herren http://coderenaissance.github.com/knockout.viewmodel/
* License: MIT (http://www.opensource.org/licenses/mit-license.php)*/
/*jshint eqnull:true, boss:true, loopfunc:true, evil:true, laxbreak:true, undef:true, unused:true, browser:true, immed:true, devel:true, sub: true, maxerr:50 */
/*global ko:false */
ko.viewmodel = (function () {
    function updateConsole(context, pathSettings) {
        var msg;
        if (ko.viewmodel.logging && window.console) {
            if (pathSettings.settingType) {
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
        if(pathSettings){
            updateConsole(context, pathSettings);
        }
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

    function isMissing(obj, objType){ return obj === null || objType === "undefined";}
    function isStandardProperty(obj, objType){ return obj === null || objType === "undefined" || objType === "string" || objType === "number" || objType === "boolean" || (objType === "object" && typeof obj.getMonth === "function"); }
    function isObjectProperty(obj, objType) { return objType === "object" && obj.length === undefined && !isStandardProperty(obj,objType);}
    function isArrayProperty(obj, objType) { return objType === "object" && obj.length !== undefined; }

    function fnRecursiveTo(viewModelObj, settings, context) {
        var mapped, p, unwrapped = ko.utils.unwrapObservable(viewModelObj),
            wasNotWrapped = (viewModelObj === unwrapped),
            objType = typeof unwrapped,
            pathSettings = GetPathSettings(settings, context);
        if (pathSettings["map"]) return pathSettings["map"](viewModelObj);
        else if (pathSettings["append"]) return unwrapped;
        else if (pathSettings["exclude"]) return;
        else if (wasNotWrapped && !pathSettings["override"]) return;
        else if (ko.isComputed(viewModelObj) && !pathSettings["override"]) return;
        else if (isStandardProperty(unwrapped, objType))
            mapped = unwrapped;
        else if (isObjectProperty(unwrapped, objType)) {
            mapped = {};
            for (p in unwrapped) {
                mapped[p] = fnRecursiveTo(unwrapped[p], settings, {
                    name: p,
                    parentChildName: (context.name === "[i]" ? context.parentChildName : context.name) + "." + p,
                    qualifiedName: context.qualifiedName + "." + p
                });
            }
        }
        else if (isArrayProperty(unwrapped, objType)) {//array
            mapped = [];
            for (p = 0; p < unwrapped.length; p++) {
                mapped.push(fnRecursiveTo(unwrapped[p], settings, {
                    name: "[i]", parentChildName: context.name + "[i]", qualifiedName: context.qualifiedName + "[i]"
                }));
            }
        }
        return pathSettings["extend"] ? (pathSettings["extend"](mapped) || mapped) : mapped;
    }

    function fnRecursiveFrom(modelObj, settings, context) {
        var mapped, p, q, idName, objType = typeof modelObj, fnExtend,
        pathSettings = GetPathSettings(settings, context);
        if (pathSettings["map"]) return pathSettings["map"](modelObj);
        else if (pathSettings["append"]) return modelObj;
        else if (pathSettings["exclude"]) return;
        else if (isStandardProperty(modelObj, objType)) {
            if (!pathSettings["override"]) {
                mapped = ko.observable(modelObj);
                if(pathSettings["id"]){
                    mapped["__isid"] = true;
                }
            }
            else {
                mapped = modelObj;
            }
        }
        else if (isObjectProperty(modelObj, objType)) {
            mapped = {};
            idName = undefined;
            for (p in modelObj) {
                mapped[p] = fnRecursiveFrom(modelObj[p], settings, {
                    name: p,
                    parentChildName: (context.name === "[i]" ? context.parentChildName : context.name) + "." + p,
                    qualifiedName: context.qualifiedName + "." + p
                });
                idName = mapped[p] && mapped[p]["__isid"] ? p : idName;
            }
            if (!pathSettings["override"]) {
                mapped = ko.observable(mapped);
                mapped["__idName"] = idName;
            }
        }
        else if (isArrayProperty(modelObj, objType)) {
            mapped = pathSettings["override"] ? [] : ko.observableArray([]);
            mapped["__push"] = mapped["push"];
            mapped["push"] = function (item) {
                item = fnRecursiveFrom(modelObj[item], settings, {
                    name: "[i]", parentChildName: context.name + "[i]", qualifiedName: context.qualifiedName + "[i]"
                });
                mapped["__push"](item);
            };
            for (p = 0; p < modelObj.length; p++) {
                mapped["push"](p);
            }
        }
        fnExtend = !pathSettings["override"] ? pathSettings["extend"] : null;
        return fnExtend ? (fnExtend(mapped) || mapped) : mapped;
    }
    function fnRecursiveUpdate(modelObj, viewModelObj, settings, context) {
        var p, q, viewModelItem, viewModelId, found, modelItem, unwrapped = ko.utils.unwrapObservable(viewModelObj), unwrappedType = typeof unwrapped,
            wasWrapped = (viewModelObj !== unwrapped), modelObjType = typeof modelObj,
            pathSettings = GetPathSettings(settings, context);
        if (unwrapped === modelObj) return;
        else if(wasWrapped && (isMissing(unwrapped, unwrappedType) ^ isMissing(modelObj, viewModelObj))) viewModelObj(modelObj);
        else if (isObjectProperty(unwrapped, unwrappedType) && isObjectProperty(modelObj, unwrappedType)) {
            if (wasWrapped || pathSettings["override"]) {
                for (p in modelObj) {
                    fnRecursiveUpdate(modelObj[p], unwrapped[p], settings, {
                        name: p,
                        parentChildName: (context.name === "[i]" ? context.parentChildName : context.name) + "." + p,
                        qualifiedName: context.qualifiedName + "." + p
                    });
                }
            }
        }
        else if (isArrayProperty(unwrapped, unwrappedType) && viewModelObj[0]()["__idName"]) {//array
            idName = viewModel[0]()["__idName"];
            for (p = 0; p < viewModelObj.length; p++) {
                found = false;
                viewModelItem = unwrapped[p];
                viewModelId = viewModelObj[idName]();
                for (q = 0; q < unwrapped.length; q++) {
                    modelItem = unwrapped[q];
                    if (viewModelId === modelItem["idName"]()) {
                        fnRecursiveUpdate(modelObj[p], unwrapped[p], settings, {
                            name: "[i]", parentChildName: context.name + "[i]", qualifiedName: context.qualifiedName + "[i]"
                        });
                        found = true;
                    }                    
                }
                if (!found) viewModelObj.splice(p);
            }
        }
        else if (wasWrapped) viewModelObj(modelObj);
    }
    return {
        logging: false,
        fromModel: function fnFromModel(model, options) {
            var settings = options ? GetSettingsFromOptions(options) : {};
            if (ko.viewmodel.logging && window.console) window.console.log("Mapping From Model");
            return fnRecursiveFrom(model, settings, { name: "{root}", parentChildName: "{root}", qualifiedName: "{root}" });
        },
        toModel: function fnToModel(viewmodel, options) {
            var settings = options ? GetSettingsFromOptions(options) : {};
            if (ko.viewmodel.logging && window.console) window.console.log("Mapping To Model");
            return fnRecursiveTo(viewmodel, settings, { name: "{root}", parentChildName: "{root}", qualifiedName: "{root}" });
        },
        updateFromModel: function fnUpdateFromModel(model, viewmodel, options) {
            var settings = options ? GetSettingsFromOptions(options) : {};
            if (ko.viewmodel.logging && window.console) window.console.log("Update From Model");
            return fnRecursiveUpdate(model, viewmodel, settings, { name: "{root}", parentChildName: "{root}", qualifiedName: "{root}" });
        }
    };
}());