    ko.viewmodel = {
        options: {
            makeChildArraysObservable: true,
            logging: false
        },
        fromModel: function fnFromModel(model, options) {
            var settings = getPathSettingsDictionary(options);
            initInternals(this.options, "Mapping From Model");
            return recrusiveFrom(model, settings, rootContext);
        },
        toModel: function fnToModel(viewmodel) {
            initInternals(this.options, "Mapping To Model");
            return recrusiveTo(viewmodel, rootContext);
        },
        updateFromModel: function fnUpdateFromModel(viewmodel, model) {
            initInternals(this.options, "Update From Model");
            return recursiveUpdate(model, viewmodel, rootContext);
        }
    };
