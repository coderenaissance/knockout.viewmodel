/// <reference path="FromTo-Mapping-qunit-tests.js" />
var model, updatedModel, modelResult;
module("Null Tests", {
    setup: function () {
        ko.viewmodel.logging = true;

        model = {
            Prop1: null,
            Prop2: "test2"
        };

        updatedModel = {
            Prop1: "test2",
            Prop2: null
        };

    },
    teardown: function () {
        ko.viewmodel.logging = false;
        model = undefined;
        updatedModel = undefined;
        modelResult = undefined;
    }
});

//test("Extend", function () {

//    var viewmodel = ko.viewmodel.fromModel(model, {
//        extend: {
//            "{root}.Prop1": function (val) {
//                val.isValid = ko.computed(function () {
//                    return val() && val().length;
//                });
//            },
//            "{root}.Prop2": function (val) {
//                val.isValid = ko.computed(function () {
//                    return val() && val() > 0;
//                });
//            }
//        }
//    });

//    deepEqual(viewmodel.Prop1(), model.Prop1, "Null Prop Test");
//    deepEqual(viewmodel.Prop2(), model.Prop2, "String Prop Test");
//    deepEqual(viewmodel.isValid(), true, "Extension check");

//    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

//    deepEqual(viewmodel.Prop1(), updatedModel.Prop1, "Null to Value Update Test");
//    deepEqual(viewmodel.Prop2(), updatedModel.Prop2, "Value to Null Update Test");
//    deepEqual(viewmodel.isValid(), true, "Extension check");

//    modelResult = ko.viewmodel.toModel(viewmodel);

//    deepEqual(modelResult, updatedModel, "Result Object Comparison");
//});

//test("Append property", function () {

//    var viewmodel = ko.viewmodel.fromModel(model, {
//        append: ["{root}.Prop1", "{root}.Prop2"]
//    });
	
//    deepEqual(viewmodel.Prop1, model.Prop1, "Null to Value Update Test");
//    deepEqual(viewmodel.Prop2, model.Prop2, "Value to Null Update Test");
	
//	ko.viewmodel.updateFromModel(viewmodel, updatedModel);
	
//	notEqual(viewmodel.Prop1, updatedModel.Prop1, "Null to Value Update Test");
//	notEqual(viewmodel.Prop2, updatedModel.Prop2, "Value to Null Update Test");
	
//	modelResult = ko.viewmodel.toModel(viewmodel);
	
//	notEqual(modelResult.Prop1, updatedModel.Prop1, "Null to Value Update Test");
//	notEqual(modelResult.Prop2, updatedModel.Prop2, "Value to Null Update Test");

//});

//test("Custom basic", function () {

//    var viewmodel = ko.viewmodel.fromModel(model, {
//        custom: {
//			"{root}.date":function (date) {
//				return ko.observable(date.valueOf());
//			}
//		}
//    });

//    deepEqual(viewmodel.stringProp(), model.stringProp, "From Model String Test");
//    deepEqual(viewmodel.id(), model.id, "From Model Number Test");
//    deepEqual(viewmodel.date(), model.date.valueOf(), "From Model Date Test");

//    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

//	deepEqual(viewmodel.stringProp(), updatedModel.stringProp, "Update String Test");
//    deepEqual(viewmodel.id(), updatedModel.id, "Update Number Test");
//    notEqual(viewmodel.date(), updatedModel.date.valueOf(), "Update Date Test");

//    modelResult = ko.viewmodel.toModel(viewmodel);

//    deepEqual(modelResult.stringProp, updatedModel.stringProp, "To Model String Test");
//    deepEqual(modelResult.id, updatedModel.id, "To Model Number Test");
//    deepEqual(modelResult.date, updatedModel.date, "To Model Date Test");
//});

//test("Custom map and unmap", function () {

//    var viewmodel = ko.viewmodel.fromModel(model, {
//        custom: {
//			"{root}.date":{
//				map: function (date) {
//					return ko.observable(date.valueOf());
//				},
//				unmap: function(date){
//					return new Date(date());
//				}
//			}
//        }
//    });

//    deepEqual(viewmodel.stringProp(), model.stringProp, "From Model String Test");
//    deepEqual(viewmodel.id(), model.id, "From Model Number Test");
//    deepEqual(viewmodel.date(), model.date.valueOf(), "From Model Date Test");

//    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

//	deepEqual(viewmodel.stringProp(), updatedModel.stringProp, "Update String Test");
//    deepEqual(viewmodel.id(), updatedModel.id, "Update Number Test");
//    deepEqual(viewmodel.date(), updatedModel.date.valueOf(), "Update Date Test");

//    modelResult = ko.viewmodel.toModel(viewmodel);

//    deepEqual(modelResult.stringProp, updatedModel.stringProp, "To Model String Test");
//    deepEqual(modelResult.id, updatedModel.id, "To Model Number Test");
//    deepEqual(modelResult.date, updatedModel.date, "To Model Date Test");
//});

//test("Exclude", function () {

//    var viewmodel = ko.viewmodel.fromModel(model, {
//        exclude: ["{root}.stringProp"]
//    });

//	equal(viewmodel.hasOwnProperty("stringProp"), false, "From Model String Prop Not Exist");
//    deepEqual(viewmodel.id(), model.id, "From Model Number Test");
//    deepEqual(viewmodel.date(), model.date, "From Model Date Test");

//    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

//	equal(viewmodel.hasOwnProperty("stringProp"), false, "Update... String Prop Not Exist");
//    deepEqual(viewmodel.id(), updatedModel.id, "Update Number Test");
//    deepEqual(viewmodel.date(), updatedModel.date, "Update Date Test");

//    modelResult = ko.viewmodel.toModel(viewmodel);

//    notEqual(modelResult.stringProp, updatedModel.stringProp, "To Model String Test");
//    deepEqual(modelResult.id, updatedModel.id, "To Model Number Test");
//    deepEqual(modelResult.date, updatedModel.date, "To Model Date Test");
//});



