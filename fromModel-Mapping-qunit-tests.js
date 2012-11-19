module("fromModel Mapping", {
    setup: function () {
        ko.viewmodel.logging = true;
    },
    teardown: function () {
        ko.viewmodel.logging = false;
    }
});

test("Extend full path", function () {
    var model, viewmodel, modelResult;

    model = {
        test: {
            stringProp: "test"
        }
    };

    var customMapping = {
        extend: {
            "{root}.test.stringProp": function (obj) {
                obj.repeat = ko.computed(function () {
                    return obj() + obj();
                });
                return obj;
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    deepEqual(viewmodel().test().stringProp.repeat(), viewmodel().test().stringProp() + viewmodel().test().stringProp(), "Extension Added");
});
test("Extend object property path", function () {
    var model, viewmodel, modelResult;

    model = {
        test: {
            stringProp: "test"
        }
    };

    var customMapping = {
        extend: {
            "test.stringProp": function (obj) {
                obj.repeat = ko.computed(function () {
                    return obj() + obj();
                });
                return obj;
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    deepEqual(viewmodel().test().stringProp.repeat(), viewmodel().test().stringProp() + viewmodel().test().stringProp(), "Extension Added");
});

test("Extend property path", function () {
    var model, viewmodel, modelResult;

    model = {
        stringProp: "test"
    };

    var customMapping = {
        extend: {
            "stringProp": function (obj) {
                obj.repeat = ko.computed(function () {
                    return obj() + obj();
                });
                return obj;
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    deepEqual(viewmodel().stringProp.repeat(), viewmodel().stringProp() + viewmodel().stringProp(), "Extension Added");
});


test("Extend array array-item property path", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        extend: {
            "items[i].test": function (obj) {
                obj.repeat = ko.computed(function () {
                    return obj().stringProp() + obj().stringProp();
                });
                return obj;
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    actual = viewmodel().items()[0]().test.repeat();
    expected = model.items[0].test.stringProp + model.items[0].test.stringProp;

    deepEqual(actual, expected, "Extension Added");
});

test("Extend all array items", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        extend: {
            "[i]": function (obj) {
                obj.IsNew = false;
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    actual = viewmodel().items()[0].IsNew;
    expected = false;

    deepEqual(actual, expected, "Extension Added");
});

test("Exclude full path", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        exclude: ["{root}.items[i].test"]
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);
    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel().items()[0]().test, undefined, "Item Not Mapped");
});

test("Exclude array item property path", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        exclude: ["items[i].test"]
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);
    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel().items()[0]().test, undefined, "Item Not Mapped");
});

test("Copy property", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        copy: ["items[i]"]
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    actual = viewmodel().items()[0].test.stringProp;
    expected = model.items[0].test.stringProp

    deepEqual(actual, expected, "Item Not Mapped");
});

test("Passthru array", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        passthru: ["[i]"]
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    actual = viewmodel().items()[0].test().stringProp();
    expected = model.items[0].test.stringProp

    deepEqual(actual, expected, "Item Not Mapped");
});

test("Passthru object", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        passthru: ["{root}"]
    };


    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    actual = viewmodel.items()[0]().test().stringProp();
    expected = model.items[0].test.stringProp

    deepEqual(actual, expected, "Item Not Mapped");
});

test("Passthru stringProp", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        passthru: ["stringProp"]
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    actual = viewmodel().items()[0]().test().stringProp;
    expected = model.items[0].test.stringProp

    deepEqual(actual, expected, "Item Not Mapped");
});

test("Map Success", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        map: {
            "test": function (obj) {
                return obj ? true : false;
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    deepEqual(viewmodel().items()[0]().test, true, "Item Not Mapped");
});

test("Map Fail", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        map: {
            "test": function (obj) {
                
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    deepEqual(viewmodel().items()[0]().test, undefined, "Item Not Mapped");
});

test("Map Obsevable", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        map: {
            "test": function (obj) {

            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    deepEqual(viewmodel().items()[0]().test, undefined, "Item Not Mapped");
});

