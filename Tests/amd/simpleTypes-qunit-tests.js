/// <reference path="FromTo-Mapping-qunit-tests.js" />
define(['knockout', 'viewmodel'], function (ko) {
    var run = function () {
        var model, updatedModel, modelResult;
        module("Simple Types", {
            setup: function () {
                //ko.viewmodel.options.logging = true;

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
                //ko.viewmodel.options.logging = false;
                model = undefined;
                updatedModel = undefined;
                modelResult = undefined;
            }
        });


        test("Basic", function () {

            var viewmodel = ko.viewmodel.fromModel(model);

            deepEqual(viewmodel.stringProp(), model.stringProp, "From Model String Test");
            deepEqual(viewmodel.id(), model.id, "From Model Number Test");
            deepEqual(viewmodel.date(), model.date, "From Model Date Test");

            ko.viewmodel.updateFromModel(viewmodel, updatedModel);

            deepEqual(viewmodel.stringProp(), updatedModel.stringProp, "Update String Test");
            deepEqual(viewmodel.id(), updatedModel.id, "Update Number Test");
            deepEqual(viewmodel.date(), updatedModel.date, "Update Date Test");

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(modelResult, updatedModel, "Result Object Comparison");
        });

        test("Extend", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                extend: {
                    "{root}": function(root){
                        root.isValid = ko.computed(function () {
                            return root.stringProp.isValid() && root.id.isValid() && root.date.isValid();
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
                    }
                }
            });

            deepEqual(viewmodel.stringProp(), model.stringProp, "From Model String Test");
            deepEqual(viewmodel.id(), model.id, "From Model Number Test");
            deepEqual(viewmodel.date(), model.date, "From Model Date Test");
            deepEqual(viewmodel.isValid(), true, "Extension check");

            ko.viewmodel.updateFromModel(viewmodel, updatedModel);

            deepEqual(viewmodel.stringProp(), updatedModel.stringProp, "Update String Test");
            deepEqual(viewmodel.id(), updatedModel.id, "Update Number Test");
            deepEqual(viewmodel.date(), updatedModel.date, "Update Date Test");
            deepEqual(viewmodel.isValid(), true, "Extension check");

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(viewmodel.isValid(), true, "Extension check");
        });

        test("Append root", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                append: ["{root}"]
            });
        	
        	deepEqual(viewmodel, model, "From Model Test");
        	
        	ko.viewmodel.updateFromModel(viewmodel, updatedModel);
        	
        	notEqual(viewmodel, updatedModel, "Update Fail Test");
        	
        	modelResult = ko.viewmodel.toModel(viewmodel);
        	
        	deepEqual(modelResult, model, "Result");
        });

        test("Append property", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                append: ["{root}.stringProp"]
            });
        	
        	deepEqual(viewmodel.stringProp, model.stringProp, "From Model String Test");
            deepEqual(viewmodel.id(), model.id, "From Model Number Test");
            deepEqual(viewmodel.date(), model.date, "From Model Date Test");
        	
        	ko.viewmodel.updateFromModel(viewmodel, updatedModel);
        	
        	deepEqual(viewmodel.stringProp, updatedModel.stringProp, "From Model String Test Fail");
        	deepEqual(viewmodel.id(), updatedModel.id, "Update Number Test");
            deepEqual(viewmodel.date(), updatedModel.date, "Update Date Test");
        	
        	modelResult = ko.viewmodel.toModel(viewmodel);
        	
        	deepEqual(modelResult.stringProp, updatedModel.stringProp, "To Model String Test");
            deepEqual(modelResult.id, updatedModel.id, "To Model Number Test");
            deepEqual(modelResult.date, updatedModel.date, "To Model Date Test");
        });

        test("Custom basic", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                custom: {
        			"{root}.date":function (date) {
        				return date.valueOf();
        			}
        		}
            });

            deepEqual(viewmodel.stringProp(), model.stringProp, "From Model String Test");
            deepEqual(viewmodel.id(), model.id, "From Model Number Test");
            deepEqual(viewmodel.date, model.date.valueOf(), "From Model Date Test");

            ko.viewmodel.updateFromModel(viewmodel, updatedModel);

        	deepEqual(viewmodel.stringProp(), updatedModel.stringProp, "Update String Test");
            deepEqual(viewmodel.id(), updatedModel.id, "Update Number Test");
            deepEqual(viewmodel.date, updatedModel.date.valueOf(), "Update Date Test");

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(modelResult.stringProp, updatedModel.stringProp, "To Model String Test");
            deepEqual(modelResult.id, updatedModel.id, "To Model Number Test");
            deepEqual(modelResult.date, updatedModel.date.valueOf(), "To Model Date Test");
        });

        test("Custom map and unmap", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                custom: {
        			"{root}.date":{
        				map: function (date) {
        					return ko.observable(date.valueOf());
        				},
        				unmap: function(date){
        					return new Date(date());
        				}
        			}
                }
            });

            deepEqual(viewmodel.stringProp(), model.stringProp, "From Model String Test");
            deepEqual(viewmodel.id(), model.id, "From Model Number Test");
            deepEqual(viewmodel.date(), model.date.valueOf(), "From Model Date Test");

            ko.viewmodel.updateFromModel(viewmodel, updatedModel);

        	deepEqual(viewmodel.stringProp(), updatedModel.stringProp, "Update String Test");
            deepEqual(viewmodel.id(), updatedModel.id, "Update Number Test");
            deepEqual(viewmodel.date(), updatedModel.date.valueOf(), "Update Date Test");

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(modelResult.stringProp, updatedModel.stringProp, "To Model String Test");
            deepEqual(modelResult.id, updatedModel.id, "To Model Number Test");
            deepEqual(modelResult.date, updatedModel.date, "To Model Date Test");
        });

        test("Exclude", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                exclude: ["{root}.stringProp"]
            });

        	equal(viewmodel.hasOwnProperty("stringProp"), false, "From Model String Prop Not Exist");
            deepEqual(viewmodel.id(), model.id, "From Model Number Test");
            deepEqual(viewmodel.date(), model.date, "From Model Date Test");

            ko.viewmodel.updateFromModel(viewmodel, updatedModel);

        	equal(viewmodel.hasOwnProperty("stringProp"), false, "Update... String Prop Not Exist");
            deepEqual(viewmodel.id(), updatedModel.id, "Update Number Test");
            deepEqual(viewmodel.date(), updatedModel.date, "Update Date Test");

            modelResult = ko.viewmodel.toModel(viewmodel);

            notEqual(modelResult.stringProp, updatedModel.stringProp, "To Model String Test");
            deepEqual(modelResult.id, updatedModel.id, "To Model Number Test");
            deepEqual(modelResult.date, updatedModel.date, "To Model Date Test");
        });
   };
    
    return {run: run}
});
