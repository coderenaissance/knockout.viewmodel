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
        fnLog, makeChildArraysObservable,
        badResult = function fnBadResult() { };

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
            else if (settings instanceof Array) {//process array list for append and exclude
                for (index = 0, length = settings.length; index < length; index++) {
                    key = settings[index];
                    result[key] = result[key] || {};
                    result[key][settingType] = true;
                    result[key].settingType = result[key].settingType ? "multiple" : settingType;
                }
            }
            else if (settings.constructor === Object && settingType != "paths") {//process associative array for extend and map
                for (key in settings) {
                    result[key] = result[key] || {};
                    fn = settings[key];
                    fn = settingType !== "arrayChildId" && fn && fn.constructor === String && shared[fn] ? shared[fn] : fn;
                    if (fn && fn.constructor === Object) {//associative array for map/unmap passed in instead of map function
                        for (childName in fn) {
                            //if children of fn are strings then replace with shared function if available
                            if ((child = fn[childName]) && (child.constructor == String) && shared[child]) {
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

    function isNullOrUndefined(obj) {//checks if obj is null or undefined
        return obj === null || obj === undefined;
    }

    //while dates aren't part of the JSON spec it doesn't hurt to support them as it's not unreasonable to think they might be added to the model by transform.
    //undefined is also not part of the spec, but it's currently be supported to be more in line with ko.mapping and probably doesn't hurt.
    function isPrimativeOrDate(obj) {
        return obj === null || obj === undefined || obj.constructor === String || obj.constructor === Number || obj.constructor === Boolean || obj instanceof Date;
    }

    function recrusiveFrom(modelObj, settings, context, pathSettings) {
        var temp, result, p, length, idName, newContext, extend, 
        childPathSettings, childObj;
        pathSettings = pathSettings || getPathSettings(settings, context);

        if (pathSettings.custom) {//custom property

        }
        else if (pathSettings.append) {//append property
            result = modelObj;//append
        }
        else if (pathSettings.exclude) {
            return badResult;
        }
        else {
            if (pathSettings.transform) {//transform property
                modelObj = pathSettings.transform(modelObj);//transform
            }

            if (isPrimativeOrDate(modelObj)) {
			    if(context.parentIsArray){//primative and date children of arrays aren't mapped.
				    result =  modelObj;
			    }
			    else{
				    result = makeObservable(modelObj);
			    }
            }
            else if (modelObj instanceof Array) {
                result = [];

                for (p = 0, length = modelObj.length; p < length; p++) {
                    result[p] = recrusiveFrom(modelObj[p], settings, {
                        name: "[i]", parent: context.name + "[i]", full: context.full + "[i]", parentIsArray: true
                    });
                    if (result[p] === badResult) {
                        result[p] = undefined;
                    }
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
                        return recursiveTo(item, newContext);
                    };
                    result.shiftToModel = function (item) {
                        item = result.shift();
                        return recursiveTo(item, newContext);
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

                    temp = recrusiveFrom(childObj, settings, newContext, childPathSettings);//call recursive from on each child property

                    if (temp !== badResult) {//properties that couldn't be mapped return badResult
                        result[p] = temp;
                    }

                }
            }
		
		    if(pathSettings.nullable){//make sure nullable objects are observable and provide method to update
			    result = isObservable(result) ? result : makeObservable(result);
			    result.___$updateNullWithMappedObject = function(item){
			        var newValue = recrusiveFrom(item, settings, context, pathSettings);
				    result(newValue);
			    }
			    pathSettings.nullable = false;
		    }

            if (extend = pathSettings.extend) {
                result = extend(result) || result;
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

        if (!wasWrapped && viewModelObj && viewModelObj.constructor === Function) {//Exclude functions
            return badResult;
        }
        else if ((wasWrapped && isPrimativeOrDate(unwrapped)) || isNullOrUndefined(unwrapped)) {
            //return nonwrapped null and undefined values, and wrapped primativish values as is
            result = unwrapped;
        }
        else if (unwrapped instanceof Array) {//create new array to return and add unwrapped values to it
            result = [];
            for (p = 0, length = unwrapped.length; p < length; p++) {
                result[p] = recursiveTo(unwrapped[p], {
                    name: "[i]", parent: context.name + "[i]", full: context.full + "[i]"
                });
            }
        }
        else if (unwrapped.constructor === Object) {//create new object to return and add unwrapped values to it
            result = {};
            for (p in unwrapped) {
                if (p.substr(0, 4) !== "___$") {//ignore all properties starting with the magic string as internal
                    child = unwrapped[p];
                    if (!ko.isComputed(child) && !((temp = unwrap(child)) && temp.constructor === Function)) {

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
        else {
            //If it wasn't wrapped and it's not a function then return it.
            if (!wasWrapped && (typeof unwrapped !== "function")) {
                result = unwrapped;
            }
        }

        if (pathSettings.untransform) {//transform property
            modelObj = pathSettings.transform(modelObj);//transform
        }

        return result;
    }

    function recursiveUpdate(modelObj, viewModelObj, context, parentObj, noncontiguousObjectUpdateCount) {
        var p, q, foundModels, foundViewmodels, modelId, viewmodelId, idName, length, unwrapped = unwrap(viewModelObj),
            wasWrapped = (viewModelObj !== unwrapped), child, map, tempArray, childTemp, childMap, unwrappedChild, tempChild;

        if (fnLog) {
            fnLog(context);//log object being updated
        }

        if (pathSettings.transform) {//transform property
            modelObj = pathSettings.transform(modelObj);//transform
        }

        if (wasWrapped && viewModelObj.___$updateNullWithMappedObject && isNullOrUndefined(unwrapped)) {
            viewModelObj.___$updateNullWithMappedObject(modelObj);
        }
        else if (wasWrapped && (isNullOrUndefined(unwrapped) ^ isNullOrUndefined(modelObj))) { 
            //if observable and the new or old value is null or undefined then update the observable
            viewModelObj(modelObj);
        }
        else if (modelObj && unwrapped && unwrapped.constructor == Object && modelObj.constructor === Object) {
            for (p in modelObj) {//loop through object properties and update them

                child = unwrapped[p];

                if (!wasWrapped && unwrapped.hasOwnProperty(p) && (isPrimativeOrDate(child) || (child && child.constructor === Array))) {
                    unwrapped[p] = modelObj[p];
                }
                else if (isNullOrUndefined(modelObj[p]) && unwrapped[p] && unwrapped[p].constructor === Object) {
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
        else if (unwrapped && unwrapped instanceof Array) {
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

        if (context.name === "{root}" && !!noncontiguousObjectUpdateCount) {
            return {
                onComplete: function (fnOnComplete) {
                    if (fnOnComplete && typeof fnOnComplete == "function") {
                        if (!!noncontiguousObjectUpdateCount) {
                            ko.computed(function () {
                                if (fnOnComplete && noncontiguousObjectUpdateCount() === 0) {
                                    fnOnComplete();
                                    fnOnComplete = undefined;
                                }
                            }).extend({ throttle: 50 });
                        }
                        else {
                            fnOnComplete();
                        }
                    }
                }
            };
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

    ko.viewmodel = {
        mappingBuilder: function () {
            var mapping = {
                paths:  {}, 
                extend: {},
                custom: {},
                append: [],
                exclude: [],
                nullable:[],
                arrayChildId: {},
                shared: {}
            };

            function pathCheck(path, type) {
                var msg, result = true;
                if (mapping.paths[path]) {
                    msg = "Could not add " + type + "-map for path '" + path + "': path already defined.";
                    console.log(msg);
                    result = false;
                }
                return result;
            }

            var builder = {
                __getMapping: function () {
                    return mapping;
                },
                transform:function(path, transform){
                    if (pathCheck(path, "transform")) {
                        mapping.paths[path] = true;
                        if (transform.constructor === Function) {
                            mapping.transform[path] = transform;
                        }
                        else if (typeof transform === "string") {
                            if (!mapping.shared[transform]) {
                                throw new Error("Could not add extend for path '" + path + "': No definition for '" + transform + "' was found'");
                            }
                            else {
                                mapping.transform[path] = transform;
                            }
                        }
                        else if (transform.constructor === Object) {
                            if (transform.beforeMapping) {
                                mapping.transformBeforeMappin[path] = transform.beforeMapping;
                            }
                            else if (transform.beforeMapping) {
                                mapping.transformAfterUnmapping[path] = transform.afterUnmapping;
                            }
                        }
                    }
                    return builder;
                },
                extend: function (path, extend) {
                    if (pathCheck(path, "extend")) {
                        mapping.paths[path] = true;
                        if (extend.constructor === Function) {
                            mapping.extend[path] = { map: extend };
                        }
                        else if (typeof extend === "string") {
                            if (!mapping.shared[extend]) {
                                throw new Error("Could not add extend for path '" + path + "': No definition for '" + extend + "' was found'");
                            }
                            else {
                                mapping.extend[path] = extend;
                            }
                        }
                    }
                    return builder;
                },
                append: function (path) {
                    var index, length;
                    if (typeof path === "string") {
                        if (pathCheck(path, "Append")) {
                            mapping.paths[path] = true;
                            mapping.append.push(path);
                        }
                    }
                    else if (path.constructor === Array) {
                        length = path.length;
                        for (index = 0; index < length; index++) {
                            builder.append(path[index]);
                        }
                    }
                    return builder;
                },
                exclude: function (path) {
                    var index, length;
                    if (typeof path === "string") {
                        if (pathCheck(path, "Exclude")) {
                            mapping.paths[path] = true;
                            mapping.exclude.push(path);
                        }
                    }
                    else if (path.constructor === Array){
                        length = path.length;
                        for (index = 0; index < length; index++) {
                            builder.exclude(path[index]);
                        }
                    }
                    return builder;
                },
                arrayChildId: function (path, idName) {
                    if (!!mapping.arrayChildId[path]) {
                        console.log("Could not add ArrayChildId for path '" + path + "'. ArrayChildId mapping already defined.");
                    }
                    else {
                        mapping.arrayChildId[path] = idName;
                    }
                    return builder;
                },
                define: function (name, definition) {
                    if (!!mapping.shared[name]) {
                        console.log("Could not define '" + name + "' because '" + name + "' is  already defined.");
                    }
                    else {
                        mapping.shared[name] = definition;
                    }
                    return builder;
                },
                flagAsNullable: function (path) {
                    var index, length;
                    if (typeof path === "string") {
                            mapping.nullable.push(path);
                    }
                    else if (path.constructor === Array) {
                        length = path.length;
                        for (index = 0; index < length; index++) {
                            builder.flagAsNullable(path[index]);
                        }
                    }
                    return builder;
                }
            };
            return builder;
        },
        options: {
            makeChildArraysObservable: true,
            logging: false
        },
        fromModel: function fnFromModel(model, mapping) {
            mapping = !!mapping && !!mapping.__getMapping ? mapping.__getMapping() : mapping;
            var settings = getPathSettingsDictionary(mapping);
            initInternals(this.options, "Mapping From Model");
            return recrusiveFrom(model, settings, rootContext);
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
