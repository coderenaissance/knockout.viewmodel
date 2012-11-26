/*ko.viewmodel.js v1.0
* Copyright 2012, Dave Herren https://github.com/coderenaissance/knockout.viewmodel
* License: MIT (http://www.opensource.org/licenses/mit-license.php)*/
/*jshint eqnull:true, boss:true, loopfunc:true, evil:true, laxbreak:true, undef:true, unused:true, browser:true, immed:true, devel:true, maxerr:50 */
/*global ko:false */
ko.viewmodel = (function () {
    var fromSettings, toSettings;
    function updateConsole(context, mapType, settings) {
        var msg;
        if (ko.viewmodel.logging && window.console) {
            if (mapType) {
                msg = mapType + " " + context.qualifiedName + " (matched: '" + (
                    (settings[context.qualifiedName + ":" + mapType] ? context.qualifiedName : "") ||
                    (settings[context.parentChildName + ":" + mapType] ? context.parentChildName : "") ||
                    (context.name)
                ) + "')";
            } else {
                msg = "Parsing " + context.qualifiedName;
            }
            window.console.log( msg);
        }
    }
    function GetPathSetting(settings, context, mapType) {
        var t = ":" + mapType,
            result = settings ? settings[context.qualifiedName + t] || settings[context.parentChildName + t] || settings[context.name + t] : undefined;
        if(result){
            updateConsole(context, mapType, settings)
        }
        return result;
    }
    function GetSettings(options) {
        var mapping = {}, settings, index, key, settingType;
        for (settingType in options) {
            settings = options[settingType] || {};
            if (settings.length !== undefined) {
                for (index = 0; index < settings.length; index++) mapping[settings[index] + ":" + settingType] = true;
            }
            else {
                for (key in settings) mapping[key + ":" + settingType] = settings[key];
            }
        }
        return mapping;
    }

    function isStandardProperty(obj, objType){ return obj === null || objType === "undefined" || objType === "string" || objType === "number" || objType === "boolean" || (objType === "object" && typeof obj.getMonth === "function"); }
    function isObjectProperty(obj, objType) { return objType === "object" && obj.length === undefined; }
    function isArrayProperty(obj, objType) { return objType === "object" && obj.length !== undefined; }

    function fnToRecursive(obj, context) {
        var mapped, p, fnExtend,
            unwrapped = ko.utils.unwrapObservable(obj),
            wasNotWrapped = (obj === unwrapped),
            objType = typeof unwrapped, settings = toSettings,
            fnMap = GetPathSetting(settings,context,"map");
        updateConsole(context);
        if (fnMap) return fnMap(obj);
        else if (GetPathSetting(settings, context, "append")) return unwrapped;
        else if (GetPathSetting(settings, context, "exclude")) return undefined;
        else if (wasNotWrapped && !GetPathSetting(settings, context, "override")) return undefined;
        else if (ko.isComputed(obj) && !GetPathSetting(settings, context, "override")) return undefined;
        else if (isStandardProperty(unwrapped, objType))
            mapped = unwrapped;
        else if (isObjectProperty(unwrapped, objType)) {
            mapped = {};
            for (p in unwrapped) {
                mapped[p] = fnToRecursive(unwrapped[p], {
                    name: p,
                    parentChildName: (context.name === "[i]" ? context.parentChildName : context.name) + "." + p,
                    qualifiedName: context.qualifiedName + "." + p
                });
            }
        }
        else if (isArrayProperty(unwrapped, objType)) {//array
            mapped = [];
            for (p = 0; p < unwrapped.length; p++) {
                mapped.push(fnToRecursive(unwrapped[p], {
                    name: "[i]", parentChildName: context.name + "[i]", qualifiedName: context.qualifiedName + "[i]"
                }));
            }
        }
        fnExtend = GetPathSetting(settings,context,"extend");
        return fnExtend ? (fnExtend(mapped) || mapped) : mapped;
    }

    function fnFromRecursive(obj, context) {
        var mapped, p, objType = typeof obj, fnExtend, isOverride
        settings = fromSettings, fnMap = GetPathSetting(settings, context, "map");
        updateConsole(context);
        if (fnMap) return fnMap(obj);
        else if (GetPathSetting(settings, context, "append")) return obj;
        else if (GetPathSetting(settings, context, "exclude")) return undefined;
        else if (isStandardProperty(obj, objType)){
            isOverride = GetPathSetting(settings,context,"override");
            mapped = isOverride ? obj : ko.observable(obj);
        }
        else if (isObjectProperty(obj, objType)) {
            mapped = {};
            for (p in obj) {
                mapped[p] = fnFromRecursive(obj[p], {
                    name: p,
                    parentChildName: (context.name === "[i]" ? context.parentChildName : context.name) + "." + p,
                    qualifiedName: context.qualifiedName + "." + p
                });
            }
            isOverride = GetPathSetting(settings,context,"override");
            mapped = isOverride ? mapped : ko.observable(mapped);
        }
        else if (isArrayProperty(obj, objType)) {
            isOverride = GetPathSetting(settings,context,"override");
            mapped = isOverride ? [] : ko.observableArray([]);
            for (p = 0; p < obj.length; p++) {
                mapped.push(fnFromRecursive(obj[p], {
                    name: "[i]", parentChildName: context.name + "[i]", qualifiedName: context.qualifiedName + "[i]"
                }));
            }
        }
        fnExtend = !isOverride ? GetPathSetting(settings, context, "extend") : null;
        return fnExtend ? (fnExtend(mapped) || mapped) : mapped;
    }
    return {
        logging: false,
        fromModel: function fromModel(obj, options) {
            fromSettings = options ? GetSettings(options) : {};
            if (ko.viewmodel.logging && window.console) window.console.log("Mapping From Model");
            return fnFromRecursive(obj, { name: "{root}", parentChildName: "{root}", qualifiedName: "{root}" });
        },
        toModel: function toModel(obj, options) {
            toSettings = options ? GetSettings(options) : {};
            if (ko.viewmodel.logging && window.console) window.console.log("Mapping From Model");
            return fnToRecursive(obj, { name: "{root}", parentChildName: "{root}", qualifiedName: "{root}" });
        }
    };
}());