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

test("Append root", function () {

    var viewmodel = ko.viewmodel.fromModel(model, {
        append: ["{root}"]
    });
	
	deepEqual(viewmodel, model, "From Model Test");
	
	ko.viewmodel.updateFromModel(updatedModel, viewmodel);
	
	notEqual(viewmodel, updatedModel, "Update Fail Test");
	
	modelResult = ko.viewmodel.toModel(viewmodel);
	
	deepEqual(modelResult, model, "Result");
});

test("Append property", function () {

    var viewmodel = ko.viewmodel.fromModel(model, {
        append: ["{root}.stringProp"]
    });
	
	deepEqual(viewmodel().stringProp, model.stringProp, "From Model String Test");
    deepEqual(viewmodel().id(), model.id, "From Model Number Test");
    deepEqual(viewmodel().date(), model.date, "From Model Date Test");
	
	ko.viewmodel.updateFromModel(updatedModel, viewmodel);
	
	notEqual(viewmodel().stringProp, updatedModel.stringProp, "From Model String Test Fail");
	deepEqual(viewmodel().id(), updatedModel.id, "Update Number Test");
    deepEqual(viewmodel().date(), updatedModel.date, "Update Date Test");
	
	modelResult = ko.viewmodel.toModel(viewmodel);
	
	notEqual(modelResult.stringProp, updatedModel.stringProp, "Update String Test");
    deepEqual(modelResult.id, updatedModel.id, "Update Number Test");
    deepEqual(modelResult.date, updatedModel.date, "Update Date Test");
});

test("Override root", function () {

    var viewmodel = ko.viewmodel.fromModel(model, {
        override: ["{root}"]
    });

    deepEqual(viewmodel.stringProp(), model.stringProp, "From Model String Test");
    deepEqual(viewmodel.id(), model.id, "From Model Number Test");
    deepEqual(viewmodel.date(), model.date, "From Model Date Test");
	
	ko.viewmodel.updateFromModel(updatedModel, viewmodel);
	
	deepEqual(viewmodel.stringProp(), updatedModel.stringProp, "From Model String Test Fail");
	deepEqual(viewmodel.id(), updatedModel.id, "Update Number Test");
    deepEqual(viewmodel.date(), updatedModel.date, "Update Date Test");
	
	modelResult = ko.viewmodel.toModel(viewmodel);
	
	deepEqual(modelResult.stringProp, updatedModel.stringProp, "Update String Test");
    deepEqual(modelResult.id, updatedModel.id, "Update Number Test");
    deepEqual(modelResult.date, updatedModel.date, "Update Date Test");
});

test("Override property", function () {

    var viewmodel = ko.viewmodel.fromModel(model, {
        override: ["{root}.stringProp"]
    });

	deepEqual(viewmodel().stringProp, model.stringProp, "From Model String Test");
    deepEqual(viewmodel().id(), model.id, "From Model Number Test");
    deepEqual(viewmodel().date(), model.date, "From Model Date Test");
	
	ko.viewmodel.updateFromModel(updatedModel, viewmodel);
	
	notEqual(viewmodel().stringProp, updatedModel.stringProp, "From Model String Test Fail");
	deepEqual(viewmodel().id(), updatedModel.id, "Update Number Test");
    deepEqual(viewmodel().date(), updatedModel.date, "Update Date Test");
	
	modelResult = ko.viewmodel.toModel(viewmodel);
	
	notEqual(modelResult.stringProp, updatedModel.stringProp, "Update String Test");
    deepEqual(modelResult.id, updatedModel.id, "Update Number Test");
    deepEqual(modelResult.date, updatedModel.date, "Update Date Test");
});

test("Custom basic", function () {

    var viewmodel = ko.viewmodel.fromModel(model, {
        custom: {
			"{root}.date":function (date) {
				return ko.observable(date.valueOf());
			}
		}
    });

    deepEqual(viewmodel().stringProp(), model.stringProp, "From Model String Test");
    deepEqual(viewmodel().id(), model.id, "From Model Number Test");
    deepEqual(viewmodel().date(), model.date.valueOf(), "From Model Date Test");

    ko.viewmodel.updateFromModel(updatedModel);

	deepEqual(viewmodel().stringProp(), updatedModel.stringProp, "Update String Test");
    deepEqual(viewmodel().id(), updatedModel.id, "Update Number Test");
    notEqual(viewmodel().date(), updatedModel.date.valueOf(), "Update Date Test");

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult.stringProp, updatedModel.stringProp, "Update String Test");
    deepEqual(modelResult.id, updatedModel.id, "Update Number Test");
    notEqual(modelResult.date, updatedModel.date, "Update Date Test");
});

test("Custom map and unmap", function () {

    var viewmodel = ko.viewmodel.fromModel(model, {
        custom: {
			"{root}.date":{
				map: function (date) {
					return ko.observable(date.valueOf());
				},
				update: function (date) {//what if update isn't supplied... should map be used?
					return ko.observable(date.valueOf());
				},
				unmap: function(date){
					return new Date(date());
				}
			}
        }
    });

    deepEqual(viewmodel().stringProp(), model.stringProp, "From Model String Test");
    deepEqual(viewmodel().id(), model.id, "From Model Number Test");
    deepEqual(viewmodel().date(), model.date.valueOf(), "From Model Date Test");

    ko.viewmodel.updateFromModel(updatedModel);

	deepEqual(viewmodel().stringProp(), updatedModel.stringProp, "Update String Test");
    deepEqual(viewmodel().id(), updatedModel.id, "Update Number Test");
    deepEqual(viewmodel().date(), updatedModel.date.valueOf(), "Update Date Test");

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult.stringProp, updatedModel.stringProp, "Update String Test");
    deepEqual(modelResult.id, updatedModel.id, "Update Number Test");
    deepEqual(modelResult.date, updatedModel.date, "Update Date Test");
});

test("Exclude", function () {

    var viewmodel = ko.viewmodel.fromModel(model, {
        exclude: ["{root}.stringProp"]
    });

	equal(viewmodel().hasOwnProperty("stringProp"), false, "From Model String Prop Not Exist");
    deepEqual(viewmodel().id(), model.id, "From Model Number Test");
    deepEqual(viewmodel().date(), model.date, "From Model Date Test");

    ko.viewmodel.updateFromModel(updatedModel);

	equal(viewmodel().hasOwnProperty("stringProp"), false, "Update... String Prop Not Exist");
    deepEqual(viewmodel().id(), updatedModel.id, "Update Number Test");
    deepEqual(viewmodel().date(), updatedModel.date, "Update Date Test");

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


