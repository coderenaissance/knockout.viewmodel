/// <reference path="FromTo-Mapping-qunit-tests.js" />
define(['knockout', 'viewmodel'], function (ko) {
    var run = function () {
        var model, updatedModel, modelResult;
        module("Basic Null Tests", {
            setup: function () {
                //ko.viewmodel.options.logging = true;

                model = {
                    Prop1: null,
                    Prop2: "test2",
                    Prop3: null,
                    Prop4: {},
                    Prop5: null,
                    Prop6: []
                };

                updatedModel = {
                    Prop1: "test2",
                    Prop2: null,
                    Prop3: {},
                    Prop4: null,
                    Prop5: [],
                    Prop6: null

                };

            },
            teardown: function () {
                //ko.viewmodel.options.logging = false;
                model = undefined;
                updatedModel = undefined;
                modelResult = undefined;
            }
        });


        test("Basic", function () {

            var viewmodel = ko.viewmodel.fromModel(model);

            deepEqual(viewmodel.Prop1(), model.Prop1, "Null Prop Test");//1
            deepEqual(viewmodel.Prop2(), model.Prop2, "String Prop Test");//2
            deepEqual(viewmodel.Prop4, model.Prop4, "Object Prop Test");//3
            deepEqual(viewmodel.Prop6(), model.Prop6, "Array Prop Test");//4

            ko.viewmodel.updateFromModel(viewmodel, updatedModel);

            deepEqual(viewmodel.Prop1(), updatedModel.Prop1, "Null to Value Update Test");//5
            deepEqual(viewmodel.Prop2(), updatedModel.Prop2, "Value to Null Update Test");//6
            deepEqual(viewmodel.Prop3(), updatedModel.Prop3, "Null to Object Update Test");//7
            deepEqual(viewmodel.Prop4, updatedModel.Prop4, "Object to Null Update Test");//8
            deepEqual(viewmodel.Prop5(), updatedModel.Prop5, "Null to Array Update Test");//9
            notEqual(typeof viewmodel.Prop5.push, "function", "Null to Array Update Is Not Observable Array Test");//10
            deepEqual(viewmodel.Prop6(), updatedModel.Prop6, "Array to Null Update Test");//11

            modelResult = ko.viewmodel.toModel(viewmodel);

            deepEqual(modelResult.Prop1, updatedModel.Prop1, "Null to Value Update Test");//12
            deepEqual(modelResult.Prop2, updatedModel.Prop2, "Value to Null Update Test");//13
            deepEqual(modelResult.Prop3, updatedModel.Prop3, "Null to Object Update Test");//14
            deepEqual(modelResult.Prop4, updatedModel.Prop4, "Object to Null Update Test");//15
            deepEqual(modelResult.Prop5, updatedModel.Prop5, "Null to Array Update Test");//16
            deepEqual(modelResult.Prop6, updatedModel.Prop6, "Array to Null Update Test");//17
        });
   };
    
    return {run: run}
});
