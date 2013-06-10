/// <reference path="FromTo-Mapping-qunit-tests.js" />
define(['knockout', 'viewmodel'], function (ko) {
    var run = function () {
        var model, viewmodel, updatedModel, modelResult;
        module("Issue Tests", {
            setup: function () {
                //ko.viewmodel.options.logging = true;

            },
            teardown: function () {
                //ko.viewmodel.options.logging = false;
                model = undefined;
                updatedModel = undefined;
                modelResult = undefined;
                viewmodel = undefined
            }
        });


        test("Issue 19 - empty array throws an exception on update", function () {

            model = { items: [] };

            updatedModel = {
                items: [{
                    id: 5,
                    text: "test"
                }]
            };

            viewmodel = ko.viewmodel.fromModel(model);

            ko.viewmodel.updateFromModel(viewmodel, updatedModel);

            deepEqual(viewmodel.items().length, 1);

        });

        test("Issue 18 - toModel call fails to completely strip extended functions and internal properties", function () {

            model = {
                items: [{
                    id: 5,
                    text: "test"
                }],
                obj: {
                    text: "test"
                }
            };

            viewmodel = ko.viewmodel.fromModel(model, {
                id: ["{root}.items[i].id"],
                extend: {
                    "{root}.obj": function (obj) {
                        obj.getTextLength = function () {
                            return obj.text().length;
                        };

                        obj.textLength = ko.computed(function () {
                            return obj.text().length;
                        });

                    }
                }
            });

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(modelResult.items[0].hasOwnProperty("..idName"), false, "hasOwnProperty of internal idName property returns true");

            deepEqual(typeof modelResult.obj.getTextLength, "undefined", "function not removed");
            deepEqual(modelResult.obj.hasOwnProperty("getTextLength"), false, "hasOwnProperty of function extension returns true");
            
            deepEqual(typeof modelResult.obj.textLength, "undefined", "property extension not removed");
            deepEqual(modelResult.obj.hasOwnProperty("textLength"), false, "hasOwnProperty of property extension returns true");

        });


        test("Issue 17 - toModel call fails to correctly unwrap fromModel with nested observableArray of strings", function () {

            model = { items: [["a", "b", "c", "d"]] };

            viewmodel = ko.viewmodel.fromModel(model);

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(model, modelResult);

        });
   };
    
    return {run: run}
});
