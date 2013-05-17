(function () {
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

    updatedmodel = { items: [{ test: 9, Id: 3 }] };
    test("Contiguous Test Fail", function () {

        newChildObject = viewmodel.items()[0]();
        modelResult = ko.viewmodel.toModel(viewmodel);

        notEqual(viewmodel.items()[0]().test(), updatedmodel.items[0].test, "Test value has been updated in viewmodel");
    });

    
    test("Contiguous Test Pass", function () {
        ko.viewmodel.updateFromModel(viewmodel, updatedmodel);
        newChildObject = viewmodel.items()[0]();
        modelResult = ko.viewmodel.toModel(viewmodel);

        deepEqual(viewmodel.items()[0]().test(), updatedmodel.items[0].test, "Test value has been updated in viewmodel");
        deepEqual(updatedmodel, modelResult, "Updated model and toModel have same values");
        ok(originalChildObject == newChildObject, "Original child object was updated and not replaced.");
    });

}());

(function () {
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


    (function () {
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
    }());

}());



