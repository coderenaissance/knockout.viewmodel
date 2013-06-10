/// <reference path="FromTo-Mapping-qunit-tests.js" />
define(['knockout', 'viewmodel'], function (ko) {
    var run = function () {
        var model, updatedModel, modelResult;
        module("Null Mapping Tests", {
            setup: function () {
                //ko.viewmodel.options.logging = true;

                model = {
                    Prop1: null,
                    Prop2: "test2",
                    Prop3: {},
                    Prop4: null
                };

                updatedModel = {
                    Prop1: "test2",
                    Prop2: null,
                    Prop3: null,
                    Prop4: {}
                };

            },
            teardown: function () {
                //ko.viewmodel.options.logging = false;
                model = undefined;
                updatedModel = undefined;
                modelResult = undefined;
            }
        });

        test("Extend String Null", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                extend: {
                    "{root}.Prop1": function (val) {
                        val.isValid = ko.computed(function () {
                            return val() != null && val().length > 0;
                        });
                    },
                    "{root}.Prop2": function (val) {
                        val.isValid = ko.computed(function () {
                            return val() != null && val().length > 0;
                        });
                    }
                }
            });

            deepEqual(viewmodel.Prop1(), model.Prop1, "Null Prop Test");
            deepEqual(viewmodel.Prop1.isValid(), false, "Null Prop Extend Test");
            deepEqual(viewmodel.Prop2(), model.Prop2, "String Prop Test");
            deepEqual(viewmodel.Prop2.isValid(), true, "Null Prop Extend Test");

            ko.viewmodel.updateFromModel(viewmodel, updatedModel);

            deepEqual(viewmodel.Prop1(), updatedModel.Prop1, "Null Prop Test");
            deepEqual(viewmodel.Prop1.isValid(), true, "Null Prop Extend Test");
            deepEqual(viewmodel.Prop2(), updatedModel.Prop2, "String Prop Test");
            deepEqual(viewmodel.Prop2.isValid(), false, "Null Prop Extend Test");

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(modelResult, updatedModel, "Result Object Comparison");
        });

        test("Extend Object Null", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                extend: {
                    "{root}.Prop3": function (val) {
                        val.isValid = ko.computed(function () {
                            return ko.utils.unwrapObservable(val) != null;
                        });
                    }, 
                    "{root}.Prop4": function (val) {
                        val.isValid = ko.computed(function () {
                            return ko.utils.unwrapObservable(val) != null;
                        });
                    }
                }
            });

            deepEqual(typeof viewmodel.Prop3, "object", "Object Prop Test");
            deepEqual(viewmodel.Prop3.isValid(), true, "Object Prop Extend Test");
            deepEqual(viewmodel.Prop4(), null, "Null Prop Test");
            deepEqual(viewmodel.Prop4.isValid(), false, "Null Prop Extend Test");

            ko.viewmodel.updateFromModel(viewmodel, updatedModel);

            deepEqual(viewmodel.Prop3, null, "Object to Null Prop Update Test");
            deepEqual(viewmodel.Prop4(), updatedModel.Prop4, "Null to Object Update Prop Test");
            deepEqual(viewmodel.Prop4.isValid(), true, "Null to Object Update Prop Extend Test");

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(modelResult, updatedModel, "Result Object Comparison");
        });

        test("Extend Object Null", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                extend: {
                    "{root}.Prop1": function (val) {
                        if (!ko.isObservable(val)) {
                            val = ko.observable(val)
                        }
                        return val;
                    },
                    "{root}.Prop2": function (val) {
                        if (!ko.isObservable(val)) {
                            val = ko.observable(val)
                        }
                        return val;
                    },
                    "{root}.Prop3": function (val) {
                        if (!ko.isObservable(val)) {
                            val = ko.observable(val)
                        }
                        return val;
                    },
                    "{root}.Prop4": function (val) {
                        if (!ko.isObservable(val)) {
                            val = ko.observable(val)
                        }
                        return val;
                    }
                }
            });

            deepEqual(viewmodel.Prop1(), model.Prop1);
            deepEqual(viewmodel.Prop2(), model.Prop2);
            deepEqual(viewmodel.Prop3(), model.Prop3);
            deepEqual(viewmodel.Prop4(), model.Prop4);

            ko.viewmodel.updateFromModel(viewmodel, updatedModel);

            deepEqual(viewmodel.Prop1(), updatedModel.Prop1);
            deepEqual(viewmodel.Prop2(), updatedModel.Prop2);
            deepEqual(viewmodel.Prop3(), updatedModel.Prop3);
            deepEqual(viewmodel.Prop4(), updatedModel.Prop4);

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(updatedModel, modelResult);
        });

        test("Append property", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                append: ["{root}.Prop1", "{root}.Prop2"]
            });
        	
            deepEqual(viewmodel.Prop1, model.Prop1, "Null to Value Update Test");
            deepEqual(viewmodel.Prop2, model.Prop2, "Value to Null Update Test");
        	
        	ko.viewmodel.updateFromModel(viewmodel, updatedModel);
        	
        	equal(viewmodel.Prop1, updatedModel.Prop1, "Null to Value Update Test");
        	equal(viewmodel.Prop2, updatedModel.Prop2, "Value to Null Update Test");
        	
        	modelResult = ko.viewmodel.toModel(viewmodel);
        	
        	equal(modelResult.Prop1, updatedModel.Prop1, "Null to Value Update Test");
        	deepEqual(modelResult.Prop2, updatedModel.Prop2, "Value to Null Update Test");

        });

        test("Custom basic", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                custom: {
        			"{root}.Prop1":function (val) {
        			    return ko.observable(val);
        			},
        			"{root}.Prop2": function (val) {
        			    return ko.observable(val);
        			},
        			"{root}.Prop3": function (val) {
        			    return ko.observable(val);
        			},
        			"{root}.Prop4": function (val) {
        			    return ko.observable(val);
        			}
        		}
            });

            deepEqual(viewmodel.Prop1(), model.Prop1);
            deepEqual(viewmodel.Prop2(), model.Prop2);
            deepEqual(viewmodel.Prop3(), model.Prop3);
            deepEqual(viewmodel.Prop4(), model.Prop4);

            ko.viewmodel.updateFromModel(viewmodel, updatedModel);

            deepEqual(viewmodel.Prop1(), updatedModel.Prop1);
            deepEqual(viewmodel.Prop2(), updatedModel.Prop2);
            deepEqual(viewmodel.Prop3(), updatedModel.Prop3);
            deepEqual(viewmodel.Prop4(), updatedModel.Prop4);

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(updatedModel, modelResult);

        });

        test("Custom map and unmap", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                custom: {
                    "{root}.Prop1": {
                        map: function (val) {
                            return ko.observable(val);
                        },
                        unmap: function (val) {
                            return val();
                        }
                    },
                    "{root}.Prop2": {
                        map: function (val) {
                            return ko.observable(val);
                        },
                        unmap: function (val) {
                            return val();
                        }
                    },
                    "{root}.Prop3": {
                        map: function (val) {
                            return ko.observable(val);
                        },
                        unmap: function (val) {
                            return val();
                        }
                    },
                    "{root}.Prop4": {
                        map: function (val) {
                            return ko.observable(val);
                        },
                        unmap: function (val) {
                            return val();
                        }
                    }
                }
            });

            deepEqual(viewmodel.Prop1(), model.Prop1);
            deepEqual(viewmodel.Prop2(), model.Prop2);
            deepEqual(viewmodel.Prop3(), model.Prop3);
            deepEqual(viewmodel.Prop4(), model.Prop4);

            ko.viewmodel.updateFromModel(viewmodel, updatedModel);

            deepEqual(viewmodel.Prop1(), updatedModel.Prop1);
            deepEqual(viewmodel.Prop2(), updatedModel.Prop2);
            deepEqual(viewmodel.Prop3(), updatedModel.Prop3);
            deepEqual(viewmodel.Prop4(), updatedModel.Prop4);

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(updatedModel, modelResult);
        });

        test("Exclude", function () {

            var viewmodel = ko.viewmodel.fromModel(model, {
                exclude: ["{root}.Prop2"]
            });

            equal(viewmodel.hasOwnProperty("Prop2"), false, "From Model String Prop Not Exist");

            ko.viewmodel.updateFromModel(viewmodel, updatedModel);

            equal(viewmodel.hasOwnProperty("Prop2"), false, "Update... String Prop Not Exist");

            modelResult = ko.viewmodel.toModel(viewmodel);

            equal(modelResult.hasOwnProperty("Prop2"), false, "Update... String Prop Not Exist");
        });
   };
    
    return {run: run}
});
