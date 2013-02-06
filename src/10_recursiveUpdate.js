    function recursiveUpdate(modelObj, viewModelObj, context, parentObj) {
        var p, q, found, foundModels, modelId, idName, length, unwrapped = unwrap(viewModelObj),
            wasWrapped = (viewModelObj !== unwrapped), child, map, tempArray, childTemp, childMap;

        if (fnLog) {
            fnLog(context);//log object being unmapped
        }

        if (wasWrapped && (isNullOrUndefined(unwrapped) ^ isNullOrUndefined(modelObj))) {
            //if you have an observable to update and either the new or old value is 
            //null or undefined then update the observable
            viewModelObj(modelObj);
        }
        else if (modelObj && unwrapped && unwrapped.constructor == Object && modelObj.constructor === Object) {
            for (p in modelObj) {//loop through object properties and update them

                if (viewModelObj.___$customChildren && viewModelObj.___$customChildren[p]) {
                    childMap = viewModelObj.___$customChildren[p].map || viewModelObj.___$customChildren[p];
                    unwrapped[p] = childMap(modelObj[p]);
                }
                else {
                    child = unwrapped[p];

                    if (!wasWrapped && unwrapped.hasOwnProperty(p) && (isPrimativeOrDate(child) || (child && child.constructor === Array))) {
                        unwrapped[p] = modelObj[p];
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
                        recursiveUpdate(modelObj[p], unwrapped[p], {
                            name: p,
                            parent: (context.name === "[i]" ? context.parent : context.name) + "." + p,
                            full: context.full + "." + p
                        }, unwrapped);
                    }
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
                            recursiveUpdate(modelObj[p], unwrapped[q], {
                                name: "[i]", parent: context.name + "[i]", full: context.full + "[i]"
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