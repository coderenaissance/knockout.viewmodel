ko.viewmodel.debug = true;

module("fromModel Basic");
test("Basic Types", function () {
    var model, viewmodel;

    model = {
        string: "test",
        number: 5,
        date: new Date("01/01/2001"),
        emptyArray: []
    };

    viewmodel = ko.viewmodel.fromModel(model);

    deepEqual(viewmodel().string(), model.string, "String Test");
    deepEqual(viewmodel().number(), model.number, "Number Test");
    deepEqual(viewmodel().date(), model.date, "Date Test");
    deepEqual(viewmodel().emptyArray(), model.emptyArray, "Array Test");
});

test("Nested Object", function () {
    var model, viewmodel;

    model = {
        nestedObject: {
            string: "test",
            number: 5,
            date: new Date("01/01/2001"),
            emptyArray: []
        }
    };

    viewmodel = ko.viewmodel.fromModel(model);

    deepEqual(viewmodel().nestedObject().string(), model.nestedObject.string, "String Test");
    deepEqual(viewmodel().nestedObject().number(), model.nestedObject.number, "Number Test");
    deepEqual(viewmodel().nestedObject().date(), model.nestedObject.date, "Date Test");
    deepEqual(viewmodel().nestedObject().emptyArray(), model.nestedObject.emptyArray, "Array Test");
});

test("Object Array", function () {
    var model, viewmodel;

    model = {
        objectArray: [
            {
                string: "test",
                number: 5,
                date: new Date("01/01/2001"),
                emptyArray: []
            }
        ]
    };

    viewmodel = ko.viewmodel.fromModel(model);

    deepEqual(viewmodel().objectArray()[0].string(), model.objectArray[0].string, "String Test");
    deepEqual(viewmodel().objectArray()[0].number(), model.objectArray[0].number, "Number Test");
    deepEqual(viewmodel().objectArray()[0].date(), model.objectArray[0].date, "Date Test");
    deepEqual(viewmodel().objectArray()[0].emptyArray(), model.objectArray[0].emptyArray, "Array Test");
});

test("Nested Array", function () {
    var model, viewmodel;

    model = {
        nestedArray: [[]]
    };

    viewmodel = ko.viewmodel.fromModel(model);
    
    deepEqual(viewmodel().nestedArray()[0](), model.nestedArray[0], "Array Test");
});

test("String Array", function () {
    var model, viewmodel;

    model = {
        nestedArray: ["Test", "Test"]
    };

    viewmodel = ko.viewmodel.fromModel(model);

    deepEqual(viewmodel().nestedArray()[0](), model.nestedArray[0], "String Array Test");
});

module("fromModel Custom");

test("Full path object extension", function () {
    var model, viewmodel, modelResult;

    model = {
        test: {
            string: "test"
        }
    };

    var customMapping = {
        "{root}.test.string": function (obj) {
            obj.repeat = ko.computed(function () {
                return obj() + obj();
            });
            return obj;
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel().test().string.repeat(), viewmodel().test().string() + viewmodel().test().string(), "Extension Added");
});

test("Object property extension", function () {
    var model, viewmodel, modelResult;

    model = {
        test: {
            string: "test"
        }
    };

    var customMapping = {
        "test.string": function (obj) {
            obj.repeat = ko.computed(function () {
                return obj() + obj();
            });
            return obj;
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel().test().string.repeat(), viewmodel().test().string() + viewmodel().test().string(), "Extension Added");
});

test("Name extension", function () {
    var model, viewmodel, modelResult;

    model = {
        string: "test"
    };

    var customMapping = {
        "string": function (obj) {
            obj.repeat = ko.computed(function () {
                return obj() + obj();
            });
            return obj;
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel().string.repeat(), viewmodel().string() + viewmodel().string(), "Extension Added");
});

test("Array Object property extension", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                string: "test"
            }
        }]
    };

    var customMapping = {
        "items[i].test": function (obj) {
            obj.repeat = ko.computed(function () {
                return obj().string() + obj().string();
            });
            return obj;
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, customMapping);

    modelResult = ko.viewmodel.toModel(viewmodel);

    actual = viewmodel().items()[0].test.repeat();
    expected = modelResult.items[0].test.string + modelResult.items[0].test.string;

    deepEqual(actual, expected, "Extension Added");
});

module("toModel");
test("Basic Types", function () {
    var model, viewmodel, modelResult;

    model = {
        string: "test",
        number: 5,
        date: new Date("01/01/2001"),
        emptyArray: []
    };

    viewmodel = ko.viewmodel.fromModel(model);

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult.string, model.string, "String Test");
    deepEqual(modelResult.number, model.number, "Number Test");
    deepEqual(modelResult.date, model.date, "Date Test");
    deepEqual(modelResult.emptyArray, model.emptyArray, "Array Test");
});

test("Nested Object", function () {
    var model, viewmodel, modelResult;

    model = {
        nestedObject: {
            string: "test",
            number: 5,
            date: new Date("01/01/2001"),
            emptyArray: []
        }
    };

    viewmodel = ko.viewmodel.fromModel(model);

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult.nestedObject.string, model.nestedObject.string, "String Test");
    deepEqual(modelResult.nestedObject.number, model.nestedObject.number, "Number Test");
    deepEqual(modelResult.nestedObject.date, model.nestedObject.date, "Date Test");
    deepEqual(modelResult.nestedObject.emptyArray, model.nestedObject.emptyArray, "Array Test");
});

test("Object Array", function () {
    var model, viewmodel, modelResult;

    model = {
        objectArray: [
            {
                string: "test",
                number: 5,
                date: new Date("01/01/2001"),
                emptyArray: []
            }
        ]
    };

    viewmodel = ko.viewmodel.fromModel(model);

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult.objectArray[0].string, model.objectArray[0].string, "String Test");
    deepEqual(modelResult.objectArray[0].number, model.objectArray[0].number, "Number Test");
    deepEqual(modelResult.objectArray[0].date, model.objectArray[0].date, "Date Test");
    deepEqual(modelResult.objectArray[0].emptyArray, model.objectArray[0].emptyArray, "Array Test");
});

test("Nested Array", function () {
    var model, viewmodel, modelResult;

    model = {
        nestedArray: [[]]
    };

    viewmodel = ko.viewmodel.fromModel(model);

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult.nestedArray[0], model.nestedArray[0], "Array Test");
});


