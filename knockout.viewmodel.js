/*ko.viewmodel.js v1.0
* Copyright 2012, Dave Herren http://coderenaissance.github.com/knockout.viewmodel/
* License: MIT (http://www.opensource.org/licenses/mit-license.php)*/
/*jshint eqnull:true, boss:true, loopfunc:true, evil:true, laxbreak:true, undef:true, unused:true, browser:true, immed:true, devel:true, maxerr:50 */
/*global ko:false */
ko.viewmodel = (function () {
    var fromSettings, toSettings;
    function updateConsole(context, settings) {
        var msg;
        if (ko.viewmodel.logging && window.console) {
            if (settings.settingType) {
                msg = settings.settingType + " " + context.qualifiedName + " (matched: '" + (
                    (settings[context.qualifiedName + ":" + settings.settingType] ? context.qualifiedName : "") ||
                    (settings[context.parentChildName + ":" + settings.settingType] ? context.parentChildName : "") ||
                    (context.name)
                ) + "')";
            } else {
                msg = "default " + context.qualifiedName;
            }
            window.console.log("- " + msg);
        }
    }
    function GetPathSettings(settings, context) {
        var result = settings ? settings[context.qualifiedName] || settings[context.parentChildName] || settings[context.name] || {} : {};
        if(result){
            updateConsole(context, result)
        }
        return result;
    }
    function GetSettings(options) {
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

    function isStandardProperty(obj, objType){ return obj === null || objType === "undefined" || objType === "string" || objType === "number" || objType === "boolean" || (objType === "object" && typeof obj.getMonth === "function"); }
    function isObjectProperty(obj, objType) { return objType === "object" && obj.length === undefined; }
    function isArrayProperty(obj, objType) { return objType === "object" && obj.length !== undefined; }

    function fnToRecursive(obj, context) {
        var mapped, p, fnExtend,
            unwrapped = ko.utils.unwrapObservable(obj),
            wasNotWrapped = (obj === unwrapped),
            objType = typeof unwrapped,
            settings = GetPathSettings(toSettings, context);
        if (settings["map"]) return settings["map"](obj);
        else if (settings["append"]) return unwrapped;
        else if (settings["exclude"]) return undefined;
        else if (wasNotWrapped && !settings["override"]) return undefined;
        else if (ko.isComputed(obj) && !settings["override"]) return undefined;
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
        return settings.extend ? (settings.extend(mapped) || mapped) : mapped;
    }

    function fnFromRecursive(obj, context) {
        var mapped, p, objType = typeof obj, fnExtend,
        settings = GetPathSettings(fromSettings, context);
        if (settings["map"]) return settings["map"](obj);
        else if (settings["append"]) return obj;
        else if (settings["exclude"]) return undefined;
        else if (isStandardProperty(obj, objType)){
            mapped = settings["override"] ? obj : ko.observable(obj);
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
            mapped = settings["override"] ? mapped : ko.observable(mapped);
        }
        else if (isArrayProperty(obj, objType)) {
            mapped = settings["override"] ? [] : ko.observableArray([]);
            for (p = 0; p < obj.length; p++) {
                mapped.push(fnFromRecursive(obj[p], {
                    name: "[i]", parentChildName: context.name + "[i]", qualifiedName: context.qualifiedName + "[i]"
                }));
            }
        }
        fnExtend = !settings["override"] ? settings.extend : null;
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
            if (ko.viewmodel.logging && window.console) window.console.log("Mapping To Model");
            return fnToRecursive(obj, { name: "{root}", parentChildName: "{root}", qualifiedName: "{root}" });
        }
    };
}());