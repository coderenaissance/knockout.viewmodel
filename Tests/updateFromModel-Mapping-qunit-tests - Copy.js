module("updateFromModel Mapping", {
    setup: function () {
        //ko.viewmodel.options.logging = true;
    },
    teardown: function () {
        //ko.viewmodel.options.logging = false;
    }
});

test("Update appended string", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        item: {
            string: "Test"
        }
    };

    updatedModel = {
        item: {
            string: "Changed"
        }
    };

    var options = {
        append: ["{root}.item.string"]
    };

    viewmodel = ko.viewmodel.fromModel(model, options);

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    modelResult = ko.viewmodel.toModel(viewmodel);

    notDeepEqual(modelResult, model, "toModel assert");
});

test("Update appended string", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        item: {
            string: "Test"
        }
    };

    updatedModel = {
        item: {
            string: "Changed"
        }
    };

    var options = {
        append: ["{root}.item.string"]
    };

    viewmodel = ko.viewmodel.fromModel(model, options);

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    modelResult = ko.viewmodel.toModel(viewmodel);

    notDeepEqual(modelResult, model, "toModel assert");
});

test("Update appended object", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        item: {
            string: "Test"
        }
    };

    updatedModel = {
        item: {
            string: "Changed"
        }
    };

    var options = {
        append: ["{root}.item"]
    };

    viewmodel = ko.viewmodel.fromModel(model, options);

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult, updatedModel, "toModel assert");
});

test("Update appended array", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            string: "Test"
        }]
    };

    updatedModel = {
        items: [{
            string: "Updated"
        }]
    };

    var options = {
        append: ["{root}.items"]
    };

    viewmodel = ko.viewmodel.fromModel(model, options);

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    modelResult = ko.viewmodel.toModel(viewmodel);

    notDeepEqual(modelResult, model, "toModel assert");
});

test("Update appended array", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            string: "Test"
        }]
    };

    updatedModel = {
        items: [{
            string: "Updated"
        }]
    };

    var options = {
        custom: {
            "{root}.items[i].string":{
                map: function (unmapped) {
                    return "a" + unmapped;
                },
                unmap: function (mapped) {
                    return mapped.substring(1);
                }
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, options);

    deepEqual(viewmodel.items()[0].string, "a" + model.items[0].string);

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    deepEqual(viewmodel.items()[0].string, "a" + updatedModel.items[0].string);

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult.items[0].string, updatedModel.items[0].string);

});

test("Extend array child object without Id", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = { items: [{ test: 5 }] };

    var customMapping = {
        extend: {
            "{root}.items[i]": function (item) {
                return ko.observable(item);
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);
    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel.items()[0]().test(), model.items[0].test);
    deepEqual(model, modelResult);
});

test("Custom array child object without Id", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = { items: [{ test: 5 }] };

    var customMapping = {
        custom: {
            "{root}.items[i]": function (item) {
                return ko.observable(item);
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);
    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel.items()[0]().test, model.items[0].test);
    deepEqual(model, modelResult);
});


test("Update extended array child object without arrayChildId", function () {
    var model, updatedmodel, viewmodel, modelResult, actual, expected;

    model = { items: [{ test: 5, Id: 3 }] };

    var customMapping = {
        extend: {
            "{root}.items[i]": function (item) {
                return ko.observable(item);
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);
    deepEqual(viewmodel.items()[0]().test(), model.items[0].test);
    var originalObject = viewmodel.items()[0]();

    updatedmodel = { items: [{ test: 7, Id: 3 }] };
    ko.viewmodel.updateFromModel(viewmodel, updatedmodel);
    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel.items()[0]().test(), updatedmodel.items[0].test);
    deepEqual(updatedmodel, modelResult);

    var updatedObject = viewmodel.items()[0]();
    ok(originalObject !== updatedObject, "Check that Array child objects are NOT the same");
});

test("Update extended array child object with arrayChildId", function () {
    var model, updatedmodel, viewmodel, modelResult, actual, expected;

    model = { items: [{ test: 5, Id:3 }] };

    var customMapping = {
        extend: {
            "{root}.items[i]": function (item) {
                return ko.observable(item);
            }
        },
        arrayChildId: {
            "{root}.items":"Id"
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);
    deepEqual(viewmodel.items()[0]().test(), model.items[0].test);
    var originalObject = viewmodel.items()[0]();

    updatedmodel = { items: [{ test: 7, Id: 3 }] };
    ko.viewmodel.updateFromModel(viewmodel, updatedmodel);
    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel.items()[0]().test(), updatedmodel.items[0].test);
    deepEqual(updatedmodel, modelResult);
    ok(originalObject === viewmodel.items()[0](), "Check that Array child objects are the same");
});

test("Update extended array child object with arrayChildId, first item removed", function () {
    var model, updatedmodel, viewmodel, modelResult, actual, expected;

    model = { items: [{ test: 5, Id: 1 }, { test: 5, Id: 3 }] };

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
    deepEqual(viewmodel.items()[0]().test(), model.items[0].test);
    var originalObject = viewmodel.items()[1]();

    updatedmodel = { items: [{ test: 7, Id: 3 }] };
    ko.viewmodel.updateFromModel(viewmodel, updatedmodel);
    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel.items()[0]().test(), updatedmodel.items[0].test);
    deepEqual(updatedmodel, modelResult);
    ok(originalObject === viewmodel.items()[0](), "Check that Array child objects are the same");
});

test("Update extended array child object with arrayChildId, last item removed", function () {
    var model, updatedmodel, viewmodel, modelResult, actual, expected;

    model = { items: [{ test: 5, Id: 3 }, { test: 5, Id: 1 }] };

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
    deepEqual(viewmodel.items()[0]().test(), model.items[0].test);
    var originalObject = viewmodel.items()[0]();

    updatedmodel = { items: [{ test: 7, Id: 3 }] };
    ko.viewmodel.updateFromModel(viewmodel, updatedmodel);
    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel.items()[0]().test(), updatedmodel.items[0].test);
    deepEqual(updatedmodel, modelResult);
    ok(originalObject === viewmodel.items()[0](), "Check that Array child objects are the same");
});

test("Update extended array child object with arrayChildId, item added", function () {
    var model, updatedmodel, viewmodel, modelResult, actual, expected;

    model = { items: [{ test: 5, Id: 3 }]};

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
    deepEqual(viewmodel.items()[0]().test(), model.items[0].test);
    var originalObject = viewmodel.items()[0]();

    updatedmodel = { items: [{ test: 5, Id: 1 }, { test: 7, Id: 3 }] };
    ko.viewmodel.updateFromModel(viewmodel, updatedmodel);
    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel.items()[0]().test(), updatedmodel.items[1].test);
    notEqual(updatedmodel, modelResult);//items are now out of order because new items are placed at the end
    ok(originalObject === viewmodel.items()[0](), "Check that Array child objects are the same");
});

test("Custom array child object without arrayChildId", function () {
    var model, updatedmodel, viewmodel, modelResult, actual, expected;

    model = { items: [{ test: 5, Id: 3 }] };

    var customMapping = {
        custom: {
            "{root}.items[i]": function (item) {
                return ko.observable(item);
            }
        },
        arrayChildId: {
            "{root}.items": "Id"
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);
    deepEqual(viewmodel.items()[0]().test, model.items[0].test);
    var originalObject = viewmodel.items()[0]();

    updatedmodel = { items: [{ test: 7, Id: 3 }] };
    ko.viewmodel.updateFromModel(viewmodel, updatedmodel);
    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel.items()[0]().test, updatedmodel.items[0].test);
    deepEqual(updatedmodel, modelResult);
    var updatedObject = viewmodel.items()[0]();
    ok(originalObject !== updatedObject, "Check that Array child objects are Not the same");
});

test("Custom array child object with arrayChildId - Id has no effect", function () {
    var model, updatedmodel, viewmodel, modelResult, actual, expected;

    model = { items: [{ test: 5, Id: 3 }] };

    var customMapping = {
        custom: {
            "{root}.items[i]": function (item) {
                return ko.observable(item);
            }
        },
        arrayChildId: {
            "{root}.items": "Id"
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);
    deepEqual(viewmodel.items()[0]().test, model.items[0].test);
    var originalObject = viewmodel.items()[0]();

    updatedmodel = { items: [{ test: 7, Id: 3 }] };
    ko.viewmodel.updateFromModel(viewmodel, updatedmodel);
    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel.items()[0]().test, updatedmodel.items[0].test);
    deepEqual(updatedmodel, modelResult);
    var updatedObject = viewmodel.items()[0]();
    ok(originalObject !== updatedObject, "Check that Array child objects are Not the same");
});
