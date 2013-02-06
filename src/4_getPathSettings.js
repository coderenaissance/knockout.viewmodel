
    //Gets settings for the specified path
    function getPathSettings(settings, context) {
        //Settings for more specific paths are chosen over less specific ones.
        var pathSettings = settings ? settings[context.full] || settings[context.parent] || settings[context.name] || {} : {};
        if (fnLog) fnLog(context, pathSettings, settings);//log what mapping will be used
        return pathSettings;
    }