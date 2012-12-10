/// <reference path="FromTo-Mapping-qunit-tests.js" />
var model, updatedModel, modelResult;
module("Simple Types", {
    setup: function () {
        ko.viewmodel.logging = true;

        model = {
            stringProp: "test",
            id: 5,
            date: new Date("01/01/2001")
        };

        updatedModel = {
            stringProp: "test2",
            id: 6,
            date: new Date("02/01/2002")
        };

    },
    teardown: function () {
        ko.viewmodel.logging = false;
        model = undefined;
        updatedModel = undefined;
        modelResult = undefined;
    }
});


test("Basic", function () {

    var viewmodel = ko.viewmodel.fromModel(model);

    deepEqual(viewmodel().stringProp(), model.stringProp, "From Model String Test");
    deepEqual(viewmodel().id(), model.id, "From Model Number Test");
    deepEqual(viewmodel().date(), model.date, "From Model Date Test");

    ko.viewmodel.updateFromModel(updatedModel, viewmodel);

    deepEqual(viewmodel().stringProp(), updatedModel.stringProp, "Update String Test");
    deepEqual(viewmodel().id(), updatedModel.id, "Update Number Test");
    deepEqual(viewmodel().date(), updatedModel.date, "Update Date Test");

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult, updatedModel, "Result Object Comparison");
});

test("Extend", function () {

    var viewmodel = ko.viewmodel.fromModel(model, {
        extend: {
            "{root}": function(root){
                root.isValid = ko.computed(function () {
                    return root().stringProp.isValid() && root().id.isValid() && root().date.isValid();
                });
            },
            "{root}.stringProp": function (stringProp) {
                stringProp.isValid = ko.computed(function () {
                    return stringProp() && stringProp().length;
                });
            },
            "{root}.id": function (id) {
                id.isValid = ko.computed(function () {
                    return id() && id() > 0;
                });
            },
            "{root}.date": function (date) {
                date.isValid = ko.computed(function () {
                    return date() && date() < new Date();
                });
            },
        }
    });

    deepEqual(viewmodel().stringProp(), model.stringProp, "From Model String Test");
    deepEqual(viewmodel().id(), model.id, "From Model Number Test");
    deepEqual(viewmodel().date(), model.date, "From Model Date Test");
    deepEqual(viewmodel.isValid(), true, "Extension check");

    ko.viewmodel.updateFromModel(updatedModel, viewmodel);

    deepEqual(viewmodel().stringProp(), updatedModel.stringProp, "Update String Test");
    deepEqual(viewmodel().id(), updatedModel.id, "Update Number Test");
    deepEqual(viewmodel().date(), updatedModel.date, "Update Date Test");
    deepEqual(viewmodel.isValid(), true, "Extension check");

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult, updatedModel, "Result Object Comparison");
    deepEqual(viewmodel.isValid(), true, "Extension check");
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
            unmap: function(item){

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


