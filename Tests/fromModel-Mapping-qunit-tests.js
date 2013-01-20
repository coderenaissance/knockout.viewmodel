module("fromModel Mapping", {
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

    deepEqual(viewmodel.test.stringProp.repeat(), viewmodel.test.stringProp() + viewmodel.test.stringProp());
});

test("Extend full path with shared", function () {
    var model, viewmodel, modelResult;

    model = {
        test: {
            stringProp: "test"
        }
    };

    var customMapping = {
        extend: {
            "{root}.test.stringProp": "test"
        },
        shared: {
            "test": function (obj) {
                obj.repeat = ko.computed(function () {
                    return obj() + obj();
                });
                return obj;
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    deepEqual(viewmodel.test.stringProp.repeat(), viewmodel.test.stringProp() + viewmodel.test.stringProp());
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

    deepEqual(viewmodel.test.stringProp.repeat(), viewmodel.test.stringProp() + viewmodel.test.stringProp());
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

    deepEqual(viewmodel.stringProp.repeat(), viewmodel.stringProp() + viewmodel.stringProp());
});

test("Extend full path wins over object property path", function () {
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
            },
            "test.stringProp": function (obj) {
                return null;
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    deepEqual(viewmodel.test.stringProp.repeat(), viewmodel.test.stringProp() + viewmodel.test.stringProp());
});

test("Extend full path wins over property path", function () {
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
            },
            "stringProp": function (obj) {
                return null;
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    deepEqual(viewmodel.test.stringProp.repeat(), viewmodel.test.stringProp() + viewmodel.test.stringProp());
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
                    return obj.stringProp() + obj.stringProp();
                });
                return obj;
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    actual = viewmodel.items()[0].test.repeat();
    expected = model.items[0].test.stringProp + model.items[0].test.stringProp;

    deepEqual(actual, expected);
});

test("Extend array array-item property path wins over array-item property path", function () {
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
            "[i].test": function (obj) {
                return null;
            },
            "items[i].test": function (obj) {
                obj.repeat = ko.computed(function () {
                    return obj.stringProp() + obj.stringProp();
                });
                return obj;
            }            
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    actual = viewmodel.items()[0].test.repeat();
    expected = model.items[0].test.stringProp + model.items[0].test.stringProp;

    deepEqual(actual, expected);
});

test("Extend array array-item property path wins over property path", function () {
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
            "test": function (obj) {
                return null;
            },
            "items[i].test": function (obj) {
                obj.repeat = ko.computed(function () {
                    return obj.stringProp() + obj.stringProp();
                });
                return obj;
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    actual = viewmodel.items()[0].test.repeat();
    expected = model.items[0].test.stringProp + model.items[0].test.stringProp;

    deepEqual(actual, expected);
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

    actual = viewmodel.items()[0].IsNew;
    expected = false;

    deepEqual(actual, expected);
});


test("Extended Array Push with Map", function () {
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

    viewmodel.items.pushFromModel({
        test: {
            stringProp: "test"
        }
    });

    actual = viewmodel.items()[0];
    expected = viewmodel.items.pop()

    notStrictEqual(actual, expected);

    viewmodel.items.push(expected);

    actual = viewmodel.items()[0];
    expected = viewmodel.items.pop()

    notStrictEqual(actual, expected);

    actual = ko.viewmodel.toModel(actual);
    expected = ko.viewmodel.toModel(expected);

    deepEqual(actual, expected);

    expected = model.items[0];
    actual = viewmodel.items.popToModel();

    deepEqual(actual, expected);

});

test("Extended Array Push without Map", function () {
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

    viewmodel.items.push({
        test: {
            stringProp: "test"
        }
    }, {map:false});

    notEqual(viewmodel.items.pop(), viewmodel.items()[0]);
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

    deepEqual(viewmodel.items()[0].test, undefined, "Item Not Mapped");
});

test("Exclude full path wins over append object-property path", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        exclude: ["{root}.items[i].test"],
        append: ["items[i].test"]
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);
    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel.items()[0].test, undefined, "Item Not Mapped");
});

test("Exclude object-property path wins over append property path", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        exclude: ["items[i].test"],
        append: ["test"]
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);
    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel.items()[0].test, undefined, "Item Not Mapped");
});


test("Same path Last in wins", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        exclude: ["items[i].test"],
        append: ["items[i].test"]
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);
    modelResult = ko.viewmodel.toModel(viewmodel);

    notEqual(viewmodel.items()[0].test, undefined, "Item Not Mapped");
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

    deepEqual(viewmodel.items()[0].test, undefined, "Item Not Mapped");
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

    actual = viewmodel.items()[0].test.stringProp;
    expected = model.items[0].test.stringProp

    deepEqual(actual, expected, "Item Not Mapped");
});

test("Override array", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        override: ["[i]"]
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    actual = viewmodel.items()[0].test.stringProp();
    expected = model.items[0].test.stringProp

    deepEqual(actual, expected, "Item Not Mapped");
});

test("Override object", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        override: ["{root}"]
    };


    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    actual = viewmodel.items()[0].test.stringProp();
    expected = model.items[0].test.stringProp

    deepEqual(actual, expected, "Item Not Mapped");
});

test("Custom Success", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        custom: {
            "test": function (obj) {
                return obj ? true : false;
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    deepEqual(viewmodel.items()[0].test, true, "Item Not Mapped");
});

test("Custom Success with shared", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        custom: {
            "test": "test"
        },
        shared: {
            "test": function (obj) {
                return obj ? true : false;
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    deepEqual(viewmodel.items()[0].test, true, "Item Not Mapped");
});

test("Custom Fail", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        custom: {
            "test": function (obj) {
                
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    deepEqual(viewmodel.items()[0].test, undefined, "Item Not Mapped");
});

test("Custom Obsevable", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var customMapping = {
        custom: {
            "test": function (obj) {

            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    deepEqual(viewmodel.items()[0].test, undefined, "Item Not Mapped");
});

