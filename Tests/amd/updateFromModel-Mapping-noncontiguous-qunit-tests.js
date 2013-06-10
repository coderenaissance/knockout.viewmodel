define(['knockout', 'viewmodel'], function (ko) {
    var run = function () {
            var model, updatedmodel, viewmodel, customMapping, originalChildObject, modelResult, actual, newChildObject;

            module("updateFromModel Noncontiguous Object Updates", {
                setup: function () {

                },
                teardown: function () {

                }
            });


            model = { items: [{ test: 5, Id: 3 }] };

            var customMapping = {
                extend: {
                    "{root}.items[i]": function (item) {
                        return ko.observable(item);
                    }
                },
                arrayChildId: {
                    "{root}.items": "Id"
                }
            };

            viewmodel = ko.viewmodel.fromModel(model, customMapping);

            originalChildObject = viewmodel.items()[0]();


            updatedmodel = { items: [{ test: 7, Id: 3 }] };

            ko.viewmodel.updateFromModel(viewmodel, updatedmodel, true).onComplete(function () {
                asyncTest("Noncontiguous Test", function () {
                    expect(4);
                    newChildObject = viewmodel.items()[0]();
                    modelResult = ko.viewmodel.toModel(viewmodel);

                    deepEqual(viewmodel.items()[0]().test(), updatedmodel.items[0].test, "Test value has been updated in viewmodel");
                    deepEqual(viewmodel.items()[0]().test(), 7, "Test value is what was expected");
                    deepEqual(updatedmodel, modelResult, "Updated model and toModel have same values");
                    ok(originalChildObject == newChildObject, "Original child object was updated and not replaced.");
                    start();
                });
            });
   };
    
    return {run: run}
});
