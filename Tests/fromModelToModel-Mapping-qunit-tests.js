/// <reference path="../Scripts/knockout.viewmodel.js" />
module("fromModel toModel Mapping", {
    setup: function () {
        //ko.viewmodel.options.logging = true;
    },
    teardown: function () {
        //ko.viewmodel.options.logging = false;
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

test("Extend name path", function () {
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


test("Extend array item property", function () {
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

    deepEqual(actual, expected);
});

test("Exclude property", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var options = {
        exclude: ["items[i].test"]
    };

    viewmodel = ko.viewmodel.fromModel(model, options);

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel().items()[0]().test, undefined, "fromModel assert");
    deepEqual(modelResult.items[0].test, undefined, "toModel assert");
});

test("Append property", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        append: ["items[i]"]
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);
    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel().items()[0].test.stringProp, model.items[0].test.stringProp, "fromModel assert");
    deepEqual(modelResult.items[0].test.stringProp, model.items[0].test.stringProp, "toModel assert");
});

