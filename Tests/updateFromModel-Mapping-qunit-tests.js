module("updateFromModel Mapping", {
    setup: function () {
        //ko.viewmodel.options.logging = true;
    },
    teardown: function () {
        //ko.viewmodel.options.logging = false;
    }
});

test("Update appended string", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: {
            string: "Test"
        }
    };

    updatedModel = {
        items: {
            string: "Changed"
        }
    };

    var options = {
        append: ["{root}.items.string"]
    };

    viewmodel = ko.viewmodel.fromModel(model, options);

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    modelResult = ko.viewmodel.toModel(viewmodel);

    notDeepEqual(modelResult, model, "toModel assert");
});

test("Update appended object", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: {
            string: "Test"
        }
    };

    updatedModel = {
        items: {
            string: "Changed"
        }
    };

    var options = {
        append: ["{root}.items"]
    };

    viewmodel = ko.viewmodel.fromModel(model, options);

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    modelResult = ko.viewmodel.toModel(viewmodel);

    notDeepEqual(modelResult, model, "toModel assert");
});