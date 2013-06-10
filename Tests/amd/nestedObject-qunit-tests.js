/// <reference path="FromTo-Mapping-qunit-tests.js" />
define(['knockout', 'viewmodel'], function (ko) {
    var run = function () {
        var model, updatedModel, modelResult;
        module("Nested Object Types", {
            setup: function () {
                //ko.viewmodel.options.logging = true;

                model = {
                    data: {
                        stringProp: "test",
                        id: 5,
                        date: new Date("01/01/2001")
                    }
                };

                updatedModel = {
                    data: {
                        stringProp: "test2",
                        id: 6,
                        date: new Date("02/01/2002")
                    }
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

            deepEqual(viewmodel.data.stringProp(), model.data.stringProp, "From Model String Test");
            deepEqual(viewmodel.data.id(), model.data.id, "From Model Number Test");
            deepEqual(viewmodel.data.date(), model.data.date, "From Model Date Test");

            ko.viewmodel.updateFromModel(viewmodel, updatedModel);

            deepEqual(viewmodel.data.stringProp(), updatedModel.data.stringProp, "Update String Test");
            deepEqual(viewmodel.data.id(), updatedModel.data.id, "Update Number Test");
            deepEqual(viewmodel.data.date(), updatedModel.data.date, "Update Date Test");

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(modelResult, updatedModel, "Result Object Comparison");
        });

        test("Extend", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                extend: {
                    "{root}": function(root){
                        root.isValid = ko.computed(function () {
                            return root.data.stringProp.isValid() && root.data.id.isValid() && root.data.date.isValid();
                        });
                    },
                    "{root}.data.stringProp": function (stringProp) {
                        stringProp.isValid = ko.computed(function () {
                            return stringProp() && stringProp().length;
                        });
                    },
                    "{root}.data.id": function (id) {
                        id.isValid = ko.computed(function () {
                            return id() && id() > 0;
                        });
                    },
                    "{root}.data.date": function (date) {
                        date.isValid = ko.computed(function () {
                            return date() && date() < new Date();
                        });
                    }
                }
            });

            deepEqual(viewmodel.data.stringProp(), model.data.stringProp, "From Model String Test");
            deepEqual(viewmodel.data.id(), model.data.id, "From Model Number Test");
            deepEqual(viewmodel.data.date(), model.data.date, "From Model Date Test");
            deepEqual(viewmodel.isValid(), true, "Extension check");

            ko.viewmodel.updateFromModel(viewmodel, updatedModel);

            deepEqual(viewmodel.data.stringProp(), updatedModel.data.stringProp, "Update String Test");
            deepEqual(viewmodel.data.id(), updatedModel.data.id, "Update Number Test");
            deepEqual(viewmodel.data.date(), updatedModel.data.date, "Update Date Test");
            deepEqual(viewmodel.isValid(), true, "Extension check");

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(viewmodel.isValid(), true, "Extension check");
        });

        test("Append object", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                append: ["{root}.data"]
            });
        	
            deepEqual(viewmodel, model, "From Model Test");
        	
        	ko.viewmodel.updateFromModel(viewmodel, updatedModel);
        	
        	notEqual(viewmodel, updatedModel, "Update Fail Test");
        	
        	modelResult = ko.viewmodel.toModel(viewmodel);
        	
        	deepEqual(modelResult, model, "Result");
        });

        test("Append object property", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                append: ["{root}.data.stringProp"]
            });
        	
            deepEqual(viewmodel.data.stringProp, model.data.stringProp, "From Model String Test");
            deepEqual(viewmodel.data.id(), model.data.id, "From Model Number Test");
            deepEqual(viewmodel.data.date(), model.data.date, "From Model Date Test");
        	
        	ko.viewmodel.updateFromModel(viewmodel, updatedModel);
        	
        	deepEqual(viewmodel.data.stringProp, updatedModel.data.stringProp, "From Model String Test Fail");
        	deepEqual(viewmodel.data.id(), updatedModel.data.id, "Update Number Test");
        	deepEqual(viewmodel.data.date(), updatedModel.data.date, "Update Date Test");
        	
        	modelResult = ko.viewmodel.toModel(viewmodel);
        	
        	deepEqual(modelResult.data.stringProp, updatedModel.data.stringProp, "To Model String Test");
        	deepEqual(modelResult.data.id, updatedModel.data.id, "To Model Number Test");
        	deepEqual(modelResult.data.date, updatedModel.data.date, "To Model Date Test");
        });

        test("Custom basic", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                custom: {
                    "{root}.data.date": function (date) {
        				return date.valueOf();
        			}
        		}
            });

            deepEqual(viewmodel.data.stringProp(), model.data.stringProp, "From Model String Test");
            deepEqual(viewmodel.data.id(), model.data.id, "From Model Number Test");
            deepEqual(viewmodel.data.date, model.data.date.valueOf(), "From Model Date Test");

            ko.viewmodel.updateFromModel(viewmodel, updatedModel);

            deepEqual(viewmodel.data.stringProp(), updatedModel.data.stringProp, "Update String Test");
            deepEqual(viewmodel.data.id(), updatedModel.data.id, "Update Number Test");
            deepEqual(viewmodel.data.date, updatedModel.data.date.valueOf(), "Update Date Test");

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(modelResult.data.stringProp, updatedModel.data.stringProp, "To Model String Test");
            deepEqual(modelResult.data.id, updatedModel.data.id, "To Model Number Test");
            deepEqual(modelResult.data.date, updatedModel.data.date.valueOf(), "To Model Date Test");
        });

        test("Custom basic", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                custom: {
                    "{root}.data.date": function (date) {
        				return date.valueOf();
        			}
        		}
            });

            deepEqual(viewmodel.data.stringProp(), model.data.stringProp, "From Model String Test");
            deepEqual(viewmodel.data.id(), model.data.id, "From Model Number Test");
            deepEqual(viewmodel.data.date, model.data.date.valueOf(), "From Model Date Test");

            ko.viewmodel.updateFromModel(viewmodel, updatedModel);

            deepEqual(viewmodel.data.stringProp(), updatedModel.data.stringProp, "Update String Test");
            deepEqual(viewmodel.data.id(), updatedModel.data.id, "Update Number Test");
            deepEqual(viewmodel.data.date, updatedModel.data.date.valueOf(), "Update Date Test");

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(modelResult.data.stringProp, updatedModel.data.stringProp, "To Model String Test");
            deepEqual(modelResult.data.id, updatedModel.data.id, "To Model Number Test");
            deepEqual(modelResult.data.date, updatedModel.data.date.valueOf(), "To Model Date Test");
        });

        test("Custom map and unmap", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                custom: {
                    "{root}.data.date": {
        				map: function (date) {
        					return ko.observable(date.valueOf());
        				},
        				unmap: function(date){
        					return new Date(date());
        				}
        			}
                }
            });

            deepEqual(viewmodel.data.stringProp(), model.data.stringProp, "From Model String Test");
            deepEqual(viewmodel.data.id(), model.data.id, "From Model Number Test");
            deepEqual(viewmodel.data.date(), model.data.date.valueOf(), "From Model Date Test");

            ko.viewmodel.updateFromModel(viewmodel, updatedModel);

            deepEqual(viewmodel.data.stringProp(), updatedModel.data.stringProp, "Update String Test");
            deepEqual(viewmodel.data.id(), updatedModel.data.id, "Update Number Test");
            deepEqual(viewmodel.data.date(), updatedModel.data.date.valueOf(), "Update Date Test");

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(modelResult.data.stringProp, updatedModel.data.stringProp, "To Model String Test");
            deepEqual(modelResult.data.id, updatedModel.data.id, "To Model Number Test");
            deepEqual(modelResult.data.date, updatedModel.data.date, "To Model Date Test");
        });

        test("Exclude", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                exclude: ["{root}.data.stringProp"]
            });

            equal(viewmodel.data.hasOwnProperty("stringProp"), false, "From Model String Prop Not Exist");
            deepEqual(viewmodel.data.id(), model.data.id, "From Model Number Test");
            deepEqual(viewmodel.data.date(), model.data.date, "From Model Date Test");

            ko.viewmodel.updateFromModel(viewmodel, updatedModel);

            equal(viewmodel.data.hasOwnProperty("stringProp"), false, "Update... String Prop Not Exist");
            deepEqual(viewmodel.data.id(), updatedModel.data.id, "Update Number Test");
            deepEqual(viewmodel.data.date(), updatedModel.data.date, "Update Date Test");

            modelResult = ko.viewmodel.toModel(viewmodel);

            notEqual(modelResult.data.stringProp, updatedModel.data.stringProp, "To Model String Test");
            deepEqual(modelResult.data.id, updatedModel.data.id, "To Model Number Test");
            deepEqual(modelResult.data.date, updatedModel.data.date, "To Model Date Test");
        });
   };
    
    return {run: run}
});
