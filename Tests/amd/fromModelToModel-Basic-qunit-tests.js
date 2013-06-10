define(['knockout', 'viewmodel'], function (ko) {
    var run = function () {
        module("fromModel toModel Basic", {
            setup: function () {
                //ko.viewmodel.options.logging = true;
            },
            teardown: function () {
                //ko.viewmodel.options.logging = false;
            }
        });

        test("Default Basic Types", function () {
            var model, viewmodel, modelResult;

            model = {
                stringProp: "test",
                number: 5,
                date: new Date("01/01/2001"),
                emptyArray: []
            };

            viewmodel = ko.viewmodel.fromModel(model);

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(modelResult.stringProp, model.stringProp, "String Test");
            deepEqual(modelResult.number, model.number, "Number Test");
            deepEqual(modelResult.date, model.date, "Date Test");
            deepEqual(modelResult.emptyArray, model.emptyArray, "Array Test");
        });

        test("Default Nested Object", function () {
            var model, viewmodel, modelResult;

            model = {
                nestedObject: {
                    stringProp: "test",
                    number: 5,
                    date: new Date("01/01/2001"),
                    emptyArray: []
                }
            };

            viewmodel = ko.viewmodel.fromModel(model);

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(modelResult.nestedObject.stringProp, model.nestedObject.stringProp, "String Test");
            deepEqual(modelResult.nestedObject.number, model.nestedObject.number, "Number Test");
            deepEqual(modelResult.nestedObject.date, model.nestedObject.date, "Date Test");
            deepEqual(modelResult.nestedObject.emptyArray, model.nestedObject.emptyArray, "Array Test");
        });

        test("Default Object Array", function () {
            var model, viewmodel, modelResult;

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

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(modelResult.objectArray[0].stringProp, model.objectArray[0].stringProp, "String Test");
            deepEqual(modelResult.objectArray[0].number, model.objectArray[0].number, "Number Test");
            deepEqual(modelResult.objectArray[0].date, model.objectArray[0].date, "Date Test");
            deepEqual(modelResult.objectArray[0].emptyArray, model.objectArray[0].emptyArray, "Array Test");
        });

        test("Default Nested Array", function () {
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
