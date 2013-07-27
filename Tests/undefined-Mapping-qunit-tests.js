/// <reference path="FromTo-Mapping-qunit-tests.js" />
var model, updatedModel, modelResult;
module("Undefined Mapping Tests", {
    setup: function () {
        //ko.viewmodel.options.logging = true;

        model = {
            Prop1: undefined,
            Prop2: "test2",
            Prop3: {},
            Prop4: undefined,
            Prop5: undefined
        };

        updatedModel = {
            Prop1: "test2",
            Prop2: undefined,
            Prop3: undefined,
            Prop4: {},
            Prop5: {
                Test:"New Data"
            }
        };

    },
    teardown: function () {
        //ko.viewmodel.options.logging = false;
        model = undefined;
        updatedModel = undefined;
        modelResult = undefined;
    }
});

test("Extend String Undefined", function () {

    var viewmodel = ko.viewmodel.fromModel(model, {
        extend: {
            "{root}.Prop1": function (val) {
                val.isValid = ko.computed(function () {
                    return val() !== undefined && val().length > 0;
                });
            },
            "{root}.Prop2": function (val) {
                val.isValid = ko.computed(function () {
                    return val() !== undefined && val().length > 0;
                });
            }
        }
    });

    deepEqual(viewmodel.Prop1(), model.Prop1, "Undefined Prop Test");
    deepEqual(viewmodel.Prop1.isValid(), false, "Undefined Prop Extend Test");
    deepEqual(viewmodel.Prop2(), model.Prop2, "String Prop Test");
    deepEqual(viewmodel.Prop2.isValid(), true, "Undefined Prop Extend Test");

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    deepEqual(viewmodel.Prop1(), updatedModel.Prop1, "Undefined Prop Test");
    deepEqual(viewmodel.Prop1.isValid(), true, "Undefined Prop Extend Test");
    deepEqual(viewmodel.Prop2(), updatedModel.Prop2, "String Prop Test");
    deepEqual(viewmodel.Prop2.isValid(), false, "Undefined Prop Extend Test");

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult, updatedModel, "Result Object Comparison");
});

test("Extend Object Undefined", function () {

    var mapping = ko.viewmodel.mappingBuilder()
        .extend("{root}.Prop3", function (val) {
            val.isValid = ko.computed(function () {
                return ko.utils.unwrapObservable(val) !== undefined;
            });
        })
        .extend("{root}.Prop4", function (val) {
            val.isValid = ko.computed(function () {
                return ko.utils.unwrapObservable(val) !== undefined;
            });
        });

    var viewmodel = ko.viewmodel.fromModel(model, mapping);

    deepEqual(typeof viewmodel.Prop3, "object", "Object Prop Test");
    deepEqual(viewmodel.Prop3.isValid(), true, "Object Prop Extend Test");
    deepEqual(viewmodel.Prop4(), undefined, "Undefined Prop Test");
    deepEqual(viewmodel.Prop4.isValid(), false, "Undefined Prop Extend Test");

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    deepEqual(viewmodel.Prop3, undefined, "Object to Undefined Prop Update Test");
    deepEqual(viewmodel.Prop4(), updatedModel.Prop4, "Undefined to Object Update Prop Test");
    deepEqual(viewmodel.Prop4.isValid(), true, "Undefined to Object Update Prop Extend Test");

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult, updatedModel, "Result Object Comparison");
});

test("Extend Object Undefined", function () {

    var viewmodel = ko.viewmodel.fromModel(model, ko.viewmodel.mappingBuilder()//Not a prefered syntax, just experimenting
        .extend("{root}.Prop1", function (val) {
            if (!ko.isObservable(val)) {
                val = ko.observable(val);
            }
            return val;
        })
        .extend("{root}.Prop2", function (val) {
            if (!ko.isObservable(val)) {
                val = ko.observable(val);
            }
            return val;
        })
        .extend("{root}.Prop3", function (val) {
            if (!ko.isObservable(val)) {
                val = ko.observable(val);
            }
            return val;
        })
        .extend("{root}.Prop4", function (val) {
            if (!ko.isObservable(val)) {
                val = ko.observable(val);
            }
            return val;
        }));

    deepEqual(viewmodel.Prop1(), model.Prop1);
    deepEqual(viewmodel.Prop2(), model.Prop2);
    deepEqual(viewmodel.Prop3(), model.Prop3);
    deepEqual(viewmodel.Prop4(), model.Prop4);

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    deepEqual(viewmodel.Prop1(), updatedModel.Prop1);
    deepEqual(viewmodel.Prop2(), updatedModel.Prop2);
    deepEqual(viewmodel.Prop3(), updatedModel.Prop3);
    deepEqual(viewmodel.Prop4(), updatedModel.Prop4);

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(updatedModel, modelResult);
});

test("Append property", function () {

    var viewmodel = ko.viewmodel.fromModel(model, ko.viewmodel.mappingBuilder()
        .append(["{root}.Prop1", "{root}.Prop2"])
    );

    deepEqual(viewmodel.Prop1, model.Prop1, "Undefined to Value Update Test");
    deepEqual(viewmodel.Prop2, model.Prop2, "Value to Undefined Update Test");

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    deepEqual(viewmodel.Prop1, updatedModel.Prop1, "Undefined to Value Update Test");
    deepEqual(viewmodel.Prop2, updatedModel.Prop2, "Value to Undefined Update Test");

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult.Prop1, updatedModel.Prop1, "Undefined to Value Update Test");
    deepEqual(modelResult.Prop2, updatedModel.Prop2, "Value to Undefined Update Test");

});

test("Custom basic", function () {

    var viewmodel = ko.viewmodel.fromModel(model, ko.viewmodel.mappingBuilder()
        .custom("{root}.Prop1", function (val) {
            return ko.observable(val);
        })
        .custom("{root}.Prop2", function (val) {
            return ko.observable(val);
        })
        .custom("{root}.Prop3", function (val) {
            return ko.observable(val);
        })
        .custom("{root}.Prop4", function (val) {
            return ko.observable(val);
        })
    );

    deepEqual(viewmodel.Prop1(), model.Prop1);
    deepEqual(viewmodel.Prop2(), model.Prop2);
    deepEqual(viewmodel.Prop3(), model.Prop3);
    deepEqual(viewmodel.Prop4(), model.Prop4);

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    deepEqual(viewmodel.Prop1(), updatedModel.Prop1);
    deepEqual(viewmodel.Prop2(), updatedModel.Prop2);
    deepEqual(viewmodel.Prop3(), updatedModel.Prop3);
    deepEqual(viewmodel.Prop4(), updatedModel.Prop4);

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(updatedModel, modelResult);

});

test("Custom map and unmap", function () {

    var viewmodel = ko.viewmodel.fromModel(model, ko.viewmodel.mappingBuilder()
            .custom("{root}.Prop1", {
                map: function (val) {
                    return ko.observable(val);
                },
                unmap: function (val) {
                    return val();
                }
            })
            .custom("{root}.Prop2", {
                map: function (val) {
                    return ko.observable(val);
                },
                unmap: function (val) {
                    return val();
                }
            })
            .custom("{root}.Prop3", {
                map: function (val) {
                    return ko.observable(val);
                },
                unmap: function (val) {
                    return val();
                }
            })
            .custom("{root}.Prop4", {
                map: function (val) {
                    return ko.observable(val);
                },
                unmap: function (val) {
                    return val();
                }
            })
        );

    deepEqual(viewmodel.Prop1(), model.Prop1);
    deepEqual(viewmodel.Prop2(), model.Prop2);
    deepEqual(viewmodel.Prop3(), model.Prop3);
    deepEqual(viewmodel.Prop4(), model.Prop4);

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    deepEqual(viewmodel.Prop1(), updatedModel.Prop1);
    deepEqual(viewmodel.Prop2(), updatedModel.Prop2);
    deepEqual(viewmodel.Prop3(), updatedModel.Prop3);
    deepEqual(viewmodel.Prop4(), updatedModel.Prop4);

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(updatedModel, modelResult);
});

test("Exclude", function () {

    var viewmodel = ko.viewmodel.fromModel(model, ko.viewmodel.mappingBuilder()
        .exclude("{root}.Prop2")
    );

    equal(viewmodel.hasOwnProperty("Prop2"), false, "From Model String Prop Not Exist");

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    equal(viewmodel.hasOwnProperty("Prop2"), false, "Update... String Prop Not Exist");

    modelResult = ko.viewmodel.toModel(viewmodel);

    equal(modelResult.hasOwnProperty("Prop2"), false, "Update... String Prop Not Exist");
});


test("FlagAsNullable and transform object", function () {
    var mappingOptions = ko.viewmodel.mappingBuilder()
        .flagAsNullable(["{root}.Prop5"])
        .transform("{root}.Prop5.Test", {
            map: function (item) {
                if (item !== undefined) {
                    return item + item;
                }
                return item;
            },
            unmap: function extendUnmapTest(item) {
                return "Unmapped";
            }
        }
        );

    model = { Prop5: model.Prop5 };
    updatedModel = { Prop5: updatedModel.Prop5 };

    var viewmodel = ko.viewmodel.fromModel(model, mappingOptions);

    deepEqual(viewmodel.Prop5(), model.Prop5);

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    deepEqual(viewmodel.Prop5().Test(), updatedModel.Prop5.Test + updatedModel.Prop5.Test);

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    deepEqual(viewmodel.Prop5().Test(), updatedModel.Prop5.Test + updatedModel.Prop5.Test);

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult.Prop5.Test, "Unmapped");
});

test("FlagAsNullable and custom map object", function () {
    var mappingOptions = ko.viewmodel.mappingBuilder()
        .flagAsNullable(["{root}.Prop5"])
        .custom("{root}.Prop5.Test", {
            map: function customMapTest(item) {
                if (item !== undefined) {
                    item = item + item;
                }
                return ko.observable(item);
            },
            unmap: function customUnmapTest(item) {
                return "Unmapped";
            }
        });

    model = { Prop5: model.Prop5 };
    updatedModel = { Prop5: updatedModel.Prop5 };

    var viewmodel = ko.viewmodel.fromModel(model, mappingOptions);

    deepEqual(viewmodel.Prop5(), model.Prop5);

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    deepEqual(viewmodel.Prop5().Test(), updatedModel.Prop5.Test + updatedModel.Prop5.Test);

    ko.viewmodel.updateFromModel(viewmodel, updatedModel);

    deepEqual(viewmodel.Prop5().Test(), updatedModel.Prop5.Test + updatedModel.Prop5.Test);

    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(modelResult.Prop5.Test, "Unmapped");

});