/*!
 * ko.viewmodel.js v0.3.2
 * Copyright 2012, Dave Herren
 *
 * Freely distributable under the MIT license.
 * Portions of accounting.js are inspired or borrowed from underscore.js
 *
 * Full details and documentation:
 * https://github.com/coderenaissance/knockout.viewmodel
 */

ko.viewmodel = (function () {
    function updateConsole(objType, context, fnMap, rootMessage) {
        if (ko.viewmodel.debug && window.console) {
            var prefix = (fnMap ? "  custom " : "  ") + objType + ": ",
                fullyQualifiedName = context.fullyQualifiedName,
                parentChildName = (context.fullyQualifiedName != context.parentChildName) ? (" | " + context.parentChildName) : "",
                name = (context.parentChildName != context.name) ? (" | " + context.name) : "";
            window.console.log(prefix + fullyQualifiedName + parentChildName + name);
        }
    }
    function getCustomMappingFunction(customMapping, context) { 
        return customMapping ? customMapping[context.fullyQualifiedName] || customMapping[context.parentChildName] || customMapping[context.name] : undefined
    }
    return {
        debug: false,
        fromModel: function fnFromModel(obj, customMapping) {
            var fnRecursive = ko.viewmodel.fromModel;
            var mapped, p,
                context = arguments[2] || { name: "{root}", parentChildName: "{root}", fullyQualifiedName: "{root}" },
                fnMap = getCustomMappingFunction(customMapping, context),
                objType = typeof obj;
            if (ko.viewmodel.debug && window.console && context.name === "{root}") window.console.log("Mapping From Model");
            if (obj === null || objType === "undefined" || objType === "string" || objType === "number" || objType === "boolean" || (objType === "object" && typeof obj.getMonth === "function"))
                mapped = ko.observable(obj);
            else if (objType === "object" && obj.length === undefined) {
                mapped = {};
                for (p in obj) {
                    mapped[p] = fnRecursive(obj[p], customMapping, {
                        name: p,
                        parentChildName: (context.name === "[i]" ? context.parentChildName : context.name) + "." + p,
                        fullyQualifiedName: context.fullyQualifiedName + "." + p
                    });
                }
                mapped = (context.name === "[i]" /*|| name === "{root}"*/) ? mapped : ko.observable(mapped);
            }
            else if (objType === "object" && obj.length != undefined) {
                mapped = ko.observableArray([]);
                for (p = 0; p < obj.length; p++) {
                    mapped.push(fnRecursive(obj[p], customMapping, {
                        name: "[i]", parentChildName: context.name + "[i]", fullyQualifiedName: context.fullyQualifiedName + "[i]"
                    }));
                }
            }
            updateConsole(objType, context, fnMap);
            return !fnMap ? mapped : fnMap(mapped, customMapping, context);
        },
        toModel: function (obj, customMapping) {
            var fnRecursive = ko.viewmodel.toModel;
            var mapped, p,
                context = arguments[2] || { name: "{root}", parentChildName: "{root}", fullyQualifiedName: "{root}" },
                unwrapped = ko.utils.unwrapObservable(obj), objType = typeof unwrapped,
                fnMap = getCustomMappingFunction(customMapping, context);
            if (ko.viewmodel.debug && window.console && context.name === "{root}") window.console.log("Mapping To Model");
            if (unwrapped === null || objType === "undefined" || objType === "string" || objType === "number" || objType === "boolean" || (objType === "object" && typeof unwrapped.getMonth === "function"))
                mapped = unwrapped;
            else if (objType === "object" && unwrapped.length === undefined) {
                mapped = {};
                for (p in unwrapped) {
                    mapped[p] = fnRecursive(unwrapped[p], customMapping, {
                            name: p,
                            parentChildName: (context.name === "[i]" ? context.parentChildName : context.name) + "." + p,
                            fullyQualifiedName: context.fullyQualifiedName + "." + p
                        });
                }
            }
            else if (objType === "object" && unwrapped.length !== undefined) {//array
                mapped = [];
                for (p = 0; p < unwrapped.length; p++) {
                    mapped.push(fnRecursive(unwrapped[p], customMapping, {
                        name: "[i]", parentChildName: context.name + "[i]", fullyQualifiedName: context.fullyQualifiedName + "[i]"
                    }));
                }
            }
            updateConsole(objType, context, fnMap);
            return !fnMap ? mapped : fnMap(mapped, customMapping, context);
        }
    }
}());