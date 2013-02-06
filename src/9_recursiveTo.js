    function recrusiveTo(viewModelObj, context) {
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
        else if ((wasWrapped && isPrimativeOrDate(unwrapped)) || isNullOrUndefined(unwrapped)) {
            //return null, undefined, values, and wrapped primativish values as is
            result = unwrapped;
        }
        else if (unwrapped instanceof Array) {//create new array to return and add unwrapped values to it
            result = [];
            for (p = 0, length = unwrapped.length; p < length; p++) {
                result[p] = recrusiveTo(unwrapped[p], {
                    name: "[i]", parent: context.name + "[i]", full: context.full + "[i]"
                });
            }
        }
        else if (unwrapped.constructor === Object) {//create new object to return and add unwrapped values to it
            result = {};
            for (p in unwrapped) {
                if (p.substr(0, 4) !== "___$") {//ignore all properties starting with the magic string as internal
                    if (viewModelObj.___$customChildren && viewModelObj.___$customChildren[p] && viewModelObj.___$customChildren[p].unmap) {
                        result[p] = viewModelObj.___$customChildren[p].unmap(unwrapped[p]);
                    }
                    else {
                        child = unwrapped[p];
                        if (!ko.isComputed(child) && !((temp = unwrap(child)) && temp.constructor === Function)) {

                            recursiveResult = recrusiveTo(child, {
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
