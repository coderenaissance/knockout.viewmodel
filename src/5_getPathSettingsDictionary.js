
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
            else if (settings.constructor === Object) {//process associative array for extend and map
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