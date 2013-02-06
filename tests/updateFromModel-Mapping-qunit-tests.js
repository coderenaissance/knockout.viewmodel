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
        item: {
            string: "Test"
        }
    };

    updatedModel = {
        item: {
            string: "Changed"
        }
    };

    var options = {
        append: ["{root}.item.string"]
    };

    viewmodel = ko.viewmodel.fromModel(model, options);

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    modelResult = ko.viewmodel.toModel(viewmodel);

    notDeepEqual(modelResult, model, "toModel assert");
});

test("Update appended string", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        item: {
            string: "Test"
        }
    };

    updatedModel = {
        item: {
            string: "Changed"
        }
    };

    var options = {
        append: ["{root}.item.string"]
    };

    viewmodel = ko.viewmodel.fromModel(model, options);

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    modelResult = ko.viewmodel.toModel(viewmodel);

    notDeepEqual(modelResult, model, "toModel assert");
});

test("Update appended object", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        item: {
            string: "Test"
        }
    };

    updatedModel = {
        item: {
            string: "Changed"
        }
    };

    var options = {
        append: ["{root}.item"]
    };

    viewmodel = ko.viewmodel.fromModel(model, options);

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult, updatedModel, "toModel assert");
});

test("Update appended array", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            string: "Test"
        }]
    };

    updatedModel = {
        items: [{
            string: "Updated"
        }]
    };

    var options = {
        append: ["{root}.items"]
    };

    viewmodel = ko.viewmodel.fromModel(model, options);

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    modelResult = ko.viewmodel.toModel(viewmodel);

    notDeepEqual(modelResult, model, "toModel assert");
});

test("Update appended array", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            string: "Test"
        }]
    };

    updatedModel = {
        items: [{
            string: "Updated"
        }]
    };

    var options = {
        custom: {
            "{root}.items[i].string":{
                map: function (unmapped) {
                    return "a" + unmapped;
                },
                unmap: function (mapped) {
                    return mapped.substring(1);
                }
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, options);

    deepEqual(viewmodel.items()[0].string, "a" + model.items[0].string);

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    deepEqual(viewmodel.items()[0].string, "a" + updatedModel.items[0].string);

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult.items[0].string, updatedModel.items[0].string);

});