/// <reference path="FromTo-Mapping-qunit-tests.js" />
var model, updatedModel;
module("", {
    setup: function () {
        ko.viewmodel.logging = true;

        testData.model = {};

        updatedModel = {};

    },
    teardown: function () {
        ko.viewmodel.logging = false;
        model = undefined;
        updatedModel = undefined;
    }
});



test("Basic", function () {

    var viewmodel = ko.viewmodel.fromModel(model);

    deepEqual(viewmodel(), model, "From Model...");

    ko.viewmodel.updateFromModel(updatedModel, viewmodel);

    deepEqual(viewmodel(), updatedModel, "Update...");

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult.stringProp, updatedModel.stringProp, "To Model..");

});

test("Extend", function () {

    var viewmodel = ko.viewmodel.fromModel(model, {
        extend: function (item) {
        }
    });

    deepEqual(viewmodel(), model, "From Model...");

    ko.viewmodel.updateFromModel(updatedModel);

    deepEqual(viewmodel(), updatedModel, "Update...");

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult, updatedModel, "To Model...");
});

test("Append", function () {

    var viewmodel = ko.viewmodel.fromModel(model, {
        append: [""]
    });
});

test("Override", function () {

    var viewmodel = ko.viewmodel.fromModel(model, {
        override: [""]
    });

    deepEqual(viewmodel(), model, "From Model...");

    ko.viewmodel.updateFromModel(updatedModel);

    deepEqual(viewmodel(), updatedModel, "Update...");

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult, updatedModel, "To Model...");
});

test("Custom basic", function () {

    var viewmodel = ko.viewmodel.fromModel(model, {
        custom: function (item) {
        }
    });

    deepEqual(viewmodel(), model, "From Model...");

    ko.viewmodel.updateFromModel(updatedModel);

    deepEqual(viewmodel(), updatedModel, "Update...");

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult, updatedModel, "To Model...");
});

test("Custom map and unmap", function () {

    var viewmodel = ko.viewmodel.fromModel(model, {
        custom: {
            map: function (item) {
            },
            unmap: function (item) {

            }
        }
    });

    deepEqual(viewmodel(), model, "From Model...");

    ko.viewmodel.updateFromModel(updatedModel);

    deepEqual(viewmodel(), updatedModel, "Update...");

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult, updatedModel, "To Model...");
});

test("Exclude", function () {

    var viewmodel = ko.viewmodel.fromModel(model, {
        extend: function (item) {
        }
    });

    deepEqual(viewmodel(), model, "From Model...");

    ko.viewmodel.updateFromModel(updatedModel);

    deepEqual(viewmodel(), updatedModel, "Update...");

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult, updatedModel, "To Model...");
});


test("Update with obj with same id", function () {

    var viewmodel = ko.viewmodel.fromModel(model, {
        id: []
    });

    deepEqual(viewmodel(), model, "From Model...");

    ko.viewmodel.updateFromModel(updatedModel);

    deepEqual(viewmodel(), updatedModel, "Update...");

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult, updatedModel, "To Model...");
});

test("Update with obj with different id", function () {

    var viewmodel = ko.viewmodel.fromModel(model, {
        id: []
    });

    deepEqual(viewmodel(), model, "From Model...");

    ko.viewmodel.updateFromModel(updatedModel);

    deepEqual(viewmodel(), updatedModel, "Update...");

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult, updatedModel, "To Model...");
});


