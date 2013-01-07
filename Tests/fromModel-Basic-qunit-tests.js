/// <reference path="FromTo-Mapping-qunit-tests.js" />
module("fromModel Basic", {
    setup: function () {
        //ko.viewmodel.logging = true;
    },
    teardown: function () {
        //ko.viewmodel.logging = false;
	ko.viewmodel.mappingCompatability = false;
    }
});


    test("Default simple types", function () {
        var model, viewmodel;

        model = {
            stringProp: "test",
            number: 5,
            date: new Date("01/01/2001"),
            emptyArray: []
        };

        viewmodel = ko.viewmodel.fromModel(model);

        deepEqual(viewmodel.stringProp(), model.stringProp, "String Test");
        deepEqual(viewmodel.number(), model.number, "Number Test");
        deepEqual(viewmodel.date(), model.date, "Date Test");
        deepEqual(viewmodel.emptyArray(), model.emptyArray, "Array Test");
    });


    test("Default nested object", function () {
        var model, viewmodel;

        model = {
            nestedObject: {
                stringProp: "test",
                number: 5,
                date: new Date("01/01/2001"),
                emptyArray: []
            }
        };

        viewmodel = ko.viewmodel.fromModel(model);

        deepEqual(viewmodel.nestedObject.stringProp(), model.nestedObject.stringProp, "String Test");
        deepEqual(viewmodel.nestedObject.number(), model.nestedObject.number, "Number Test");
        deepEqual(viewmodel.nestedObject.date(), model.nestedObject.date, "Date Test");
        deepEqual(viewmodel.nestedObject.emptyArray(), model.nestedObject.emptyArray, "Array Test");
    });


    test("Default object array", function () {
        var model, viewmodel;

        model = {
            objectArray: [
                {}
            ]
        };

        viewmodel = ko.viewmodel.fromModel(model);

        deepEqual(viewmodel.objectArray()[0], model.objectArray[0], "Object Test");
    });


    test("Default object array simple types", function () {
        var model, viewmodel;

        model = {
            objectArray: [
                {
                    stringProp: "test",
                    number: 5,
                    date: new Date("01/01/2001"),
                    emptyArray: []
                }
            ]
        };

        viewmodel = ko.viewmodel.fromModel(model);

        deepEqual(viewmodel.objectArray()[0].stringProp(), model.objectArray[0].stringProp, "String Test");
        deepEqual(viewmodel.objectArray()[0].number(), model.objectArray[0].number, "Number Test");
        deepEqual(viewmodel.objectArray()[0].date(), model.objectArray[0].date, "Date Test");
        deepEqual(viewmodel.objectArray()[0].emptyArray(), model.objectArray[0].emptyArray, "Array Test");
    });


    test("Compatability Mode Default nested array", function () {
        var model, viewmodel;

        model = {
            nestedArray: [[]]
        };
	    
	    ko.viewmodel.mappingCompatability = true;
        viewmodel = ko.viewmodel.fromModel(model);
    
        deepEqual(viewmodel.nestedArray()[0], model.nestedArray[0], "Array Test");
    });

    test("Compatability Mode Default double nested array", function () {
        var model, viewmodel;

        model = {
            nestedArray: [[[]]]
        };

	ko.viewmodel.mappingCompatability = true;
        viewmodel = ko.viewmodel.fromModel(model);

        deepEqual(viewmodel.nestedArray()[0][0], model.nestedArray[0][0], "Array Test");
    });

    test("No Compatability Mode Default nested array", function () {
        var model, viewmodel;

        model = {
            nestedArray: [[]]
        };

        viewmodel = ko.viewmodel.fromModel(model);

        deepEqual(viewmodel.nestedArray()[0](), model.nestedArray[0], "Array Test");
    });

    test("No Compatability Mode Default double nested array", function () {
        var model, viewmodel;

        model = {
            nestedArray: [[[]]]
        };

        viewmodel = ko.viewmodel.fromModel(model);

        deepEqual(viewmodel.nestedArray()[0]()[0](), model.nestedArray[0][0], "Array Test");
    });


    test("Default string array", function () {
        var model, viewmodel;

        model = {
            stringArray: ["Test", "Test"]
        };

        viewmodel = ko.viewmodel.fromModel(model);

        deepEqual(viewmodel.stringArray()[0], model.stringArray[0], "String Array Test");
    });


