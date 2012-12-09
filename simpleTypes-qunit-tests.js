/// <reference path="FromTo-Mapping-qunit-tests.js" />
var testData = {};
module("Simple Types", {
    setup: function () {
        ko.viewmodel.logging = true;

        testData.model = {
            stringProp: "test",
            number: 5,
            date: new Date("01/01/2001"),
            emptyArray: []
        };

    },
    teardown: function () {
        ko.viewmodel.logging = false;
        delete testData.model;
    }
});


test("Create Viewmodel", function () {
        
    var model, viewmodel;
    model = testData.model,
    viewmodel = ko.viewmodel.fromModel(model);

    deepEqual(viewmodel().stringProp(), model.stringProp, "String Test");
    deepEqual(viewmodel().number(), model.number, "Number Test");
    deepEqual(viewmodel().date(), model.date, "Date Test");
    deepEqual(viewmodel().emptyArray(), model.emptyArray, "Array Test");
});

test("", function () {

    var model, viewmodel;
    model = testData.model,
    viewmodel = ko.viewmodel.fromModel(model);

    deepEqual(null, null, "");
});
