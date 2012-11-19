module("toModel mapping", {
    setup: function () {
        ko.viewmodel.logging = true;
    },
    teardown: function () {
        ko.viewmodel.logging = false;
    }
});

test("Extend full path", function () {
    var viewmodel, modelResult;

    viewmodel = ko.observable({
        test: ko.observable({
            objProp: ko.observable({})
        })
    });

    var customMapping = {
        extend: {
            "{root}.test.objProp": function (obj) {
                obj.Type = "test"
            }
        }
    };

    modelResult = ko.viewmodel.toModel(viewmodel, customMapping);

    deepEqual(modelResult.test.objProp.Type, "test");
});

test("Map full path", function () {
    var viewmodel, modelResult;

    viewmodel = ko.observable({
        test: ko.observable({
            dateProp: ko.observable(new Date("01/01/2000"))
        })
    });

    var customMapping = {
        map: {
            "{root}.test.dateProp": function (date) {
                return date().toDateString();
            }
        }
    };

    modelResult = ko.viewmodel.toModel(viewmodel, customMapping);

    deepEqual(modelResult.test.dateProp, "Sat Jan 01 2000");
});


test("Copy full path unwrapped", function () {
    var viewmodel, modelResult;

    viewmodel = ko.observable({
        test: {
            stringProp: "Test"
        }
    });

    var customMapping = {
        copy:["{root}.test"]
    };

    modelResult = ko.viewmodel.toModel(viewmodel, customMapping);

    deepEqual(modelResult.test.stringProp, "Test");
});

test("Unwrapped fail", function () {
    var viewmodel, modelResult;

    viewmodel = ko.observable({
        test: {
            stringProp: "Test"
        }
    });

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult.test, undefined);
});

test("Passthru Computed", function () {
    var viewmodel, modelResult;

    viewmodel = ko.observable({
        test: ko.observable({
            stringProp: ko.observable("Test"),
            
        })
    });
    viewmodel().stringSaysTest = ko.computed(function () {
        return viewmodel().test().stringProp() === "Test";
    })

    var customMapping = {
        passthru: ["{root}.stringSaysTest"]
    };

    modelResult = ko.viewmodel.toModel(viewmodel, customMapping);

    deepEqual(modelResult.stringSaysTest, true);
});

test("Computed fail", function () {
    var viewmodel, modelResult;

    viewmodel = ko.observable({
        test: ko.observable({
            stringProp: ko.observable("Test"),

        })
    });
    viewmodel().stringSaysTest = ko.computed(function () {
        return viewmodel().test().stringProp() === "Test";
    })

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult.stringSaysTest, undefined);
});



