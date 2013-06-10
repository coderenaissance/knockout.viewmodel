/// <reference path="FromTo-Mapping-qunit-tests.js" />
define(['knockout', 'viewmodel'], function (ko) {
    var run = function () {
        module("fromModel Basic", {
            setup: function () {
                //ko.viewmodel.options.logging = true;
                if(ko.viewmodel.options.hasOwnProperty("makeChildArraysObservable")){
                    ko.viewmodel.options.makeChildArraysObservable = true;
                }
            },
            teardown: function () {
                //ko.viewmodel.options.logging = false;
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


            test("makeChildArraysObservable is false Mode Default nested array", function () {
                var model, viewmodel;

                model = {
                    nestedArray: [[]]
                };
        	    
                ko.viewmodel.options.makeChildArraysObservable = false;
                viewmodel = ko.viewmodel.fromModel(model);
            
                deepEqual(ko.viewmodel.options.makeChildArraysObservable, false);
                deepEqual(viewmodel.nestedArray()[0], model.nestedArray[0], "Array Test");
            });

            test("makeChildArraysObservable is false double nested array", function () {
                var model, viewmodel;

                model = {
                    nestedArray: [[[]]]
                };

                ko.viewmodel.options.makeChildArraysObservable = false;
                viewmodel = ko.viewmodel.fromModel(model);

                deepEqual(ko.viewmodel.options.makeChildArraysObservable, false);
                deepEqual(viewmodel.nestedArray()[0][0], model.nestedArray[0][0], "Array Test");
            });

            //if undefined then we are using facade around ko.mapping
            //used to exclude tests that are incompatable with ko.mapping
            if (ko.viewmodel.options.makeChildArraysObservable !== undefined) {
                test("makeChildArraysObservable is true Default nested array", function () {
                    var model, viewmodel;

                    model = {
                        nestedArray: [[]]
                    };

                    viewmodel = ko.viewmodel.fromModel(model);

                    deepEqual(ko.viewmodel.options.makeChildArraysObservable, true);
                    deepEqual(viewmodel.nestedArray()[0](), model.nestedArray[0], "Array Test");
                });

                test("makeChildArraysObservable is true double nested array", function () {
                    var model, viewmodel;

                    model = {
                        nestedArray: [[[]]]
                    };

                    viewmodel = ko.viewmodel.fromModel(model);

                    deepEqual(ko.viewmodel.options.makeChildArraysObservable, true);
                    deepEqual(viewmodel.nestedArray()[0]()[0](), model.nestedArray[0][0], "Array Test");
                });
            }


            test("Default string array", function () {
                var model, viewmodel;

                model = {
                    stringArray: ["Test", "Test"]
                };

                viewmodel = ko.viewmodel.fromModel(model);

                deepEqual(viewmodel.stringArray()[0], model.stringArray[0], "String Array Test");
            });
   };
    
    return {run: run}
});
