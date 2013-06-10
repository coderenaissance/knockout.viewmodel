define(['knockout', 'viewmodel'], function (ko) {
    var run = function () {
        module("toModel Basic", {
            setup: function () {
                //ko.viewmodel.options.logging = true;
            },
            teardown: function () {
                //ko.viewmodel.options.logging = false;
            }
        });


            test("Default Basic Types", function () {
                var viewmodel, modelResult;

                viewmodel = {
                    stringProp: ko.observable("test"),
                    number: ko.observable(5),
                    date: ko.observable(new Date("01/01/2001")),
                    emptyArray: ko.observableArray([])
                };

                modelResult = ko.viewmodel.toModel(viewmodel);

                deepEqual(modelResult.stringProp, viewmodel.stringProp(), "String Test");
                deepEqual(modelResult.number, viewmodel.number(), "Number Test");
                deepEqual(modelResult.date, viewmodel.date(), "Date Test");
                deepEqual(modelResult.emptyArray, viewmodel.emptyArray(), "Array Test");
            });

            test("Default Nested Object", function () {
                var viewmodel, modelResult;

                viewmodel = {
                    nestedObject: {
                        stringProp: ko.observable("test"),
                        number: ko.observable(5),
                        date: ko.observable(new Date("01/01/2001")),
                        emptyArray: ko.observable([])
                    }
                };

                modelResult = ko.viewmodel.toModel(viewmodel);

                deepEqual(modelResult.nestedObject.stringProp, viewmodel.nestedObject.stringProp(), "String Test");
                deepEqual(modelResult.nestedObject.number, viewmodel.nestedObject.number(), "Number Test");
                deepEqual(modelResult.nestedObject.date, viewmodel.nestedObject.date(), "Date Test");
                deepEqual(modelResult.nestedObject.emptyArray, viewmodel.nestedObject.emptyArray(), "Array Test");
            });

            test("Default Object Array", function () {
                var viewmodel, modelResult;

                viewmodel = {
                    objectArray: ko.observableArray([
                        {
                            stringProp: ko.observable("test"),
                            number: ko.observable(5),
                            date: ko.observable(new Date("01/01/2001")),
                            emptyArray: ko.observableArray([])
                        }
                    ])
                };

                modelResult = ko.viewmodel.toModel(viewmodel);

                deepEqual(modelResult.objectArray[0].stringProp, viewmodel.objectArray()[0].stringProp(), "String Test");
                deepEqual(modelResult.objectArray[0].number, viewmodel.objectArray()[0].number(), "Number Test");
                deepEqual(modelResult.objectArray[0].date, viewmodel.objectArray()[0].date(), "Date Test");
                deepEqual(modelResult.objectArray[0].emptyArray, viewmodel.objectArray()[0].emptyArray(), "Array Test");
            });

            test("Default Nested Array", function () {
                var viewmodel, modelResult;

                viewmodel = {
                    nestedArray: ko.observableArray([ko.observableArray([])])
                };

                modelResult = ko.viewmodel.toModel(viewmodel);

                deepEqual(modelResult.nestedArray[0], viewmodel.nestedArray()[0](), "Array Test");
            });




            test("Observable Object Basic Types", function () {
                var viewmodel, modelResult;

                viewmodel = ko.observable({
                    stringProp: ko.observable("test"),
                    number: ko.observable(5),
                    date: ko.observable(new Date("01/01/2001")),
                    emptyArray: ko.observableArray([])
                });

                modelResult = ko.viewmodel.toModel(viewmodel);

                deepEqual(modelResult.stringProp, viewmodel().stringProp(), "String Test");
                deepEqual(modelResult.number, viewmodel().number(), "Number Test");
                deepEqual(modelResult.date, viewmodel().date(), "Date Test");
                deepEqual(modelResult.emptyArray, viewmodel().emptyArray(), "Array Test");
            });

            test("Observable Object Nested Object", function () {
                var viewmodel, modelResult;

                viewmodel = ko.observable({
                    nestedObject: ko.observable({
                        stringProp: ko.observable("test"),
                        number: ko.observable(5),
                        date: ko.observable(new Date("01/01/2001")),
                        emptyArray: ko.observable([])
                    })
                });

                modelResult = ko.viewmodel.toModel(viewmodel);

                deepEqual(modelResult.nestedObject.stringProp, viewmodel().nestedObject().stringProp(), "String Test");
                deepEqual(modelResult.nestedObject.number, viewmodel().nestedObject().number(), "Number Test");
                deepEqual(modelResult.nestedObject.date, viewmodel().nestedObject().date(), "Date Test");
                deepEqual(modelResult.nestedObject.emptyArray, viewmodel().nestedObject().emptyArray(), "Array Test");
            });

            test("Observable Object Object Array", function () {
                var viewmodel, modelResult;

                viewmodel = ko.observable({
                    objectArray: ko.observableArray([
                        ko.observable({
                            stringProp: ko.observable("test"),
                            number: ko.observable(5),
                            date: ko.observable(new Date("01/01/2001")),
                            emptyArray: ko.observableArray([])
                        })
                    ])
                });

                modelResult = ko.viewmodel.toModel(viewmodel);

                deepEqual(modelResult.objectArray[0].stringProp, viewmodel().objectArray()[0]().stringProp(), "String Test");
                deepEqual(modelResult.objectArray[0].number, viewmodel().objectArray()[0]().number(), "Number Test");
                deepEqual(modelResult.objectArray[0].date, viewmodel().objectArray()[0]().date(), "Date Test");
                deepEqual(modelResult.objectArray[0].emptyArray, viewmodel().objectArray()[0]().emptyArray(), "Array Test");
            });

            test("Observable Object Nested Array", function () {
                var viewmodel, modelResult;

                viewmodel = ko.observable({
                    nestedArray: ko.observableArray([ko.observableArray([])])
                });

                modelResult = ko.viewmodel.toModel(viewmodel);  

                deepEqual(modelResult.nestedArray[0], viewmodel().nestedArray()[0](), "Array Test");
            });
   };
    
    return {run: run}
});
