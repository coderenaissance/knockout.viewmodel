
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