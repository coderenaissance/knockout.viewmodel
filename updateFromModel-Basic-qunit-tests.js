/*
Processing rules:
All object properties are replaced with new values if changed.
An object is assumed to be the same object unless it has an id.
An observable object with a non matching id gets replaced.
An observable array whose items do not have ids has it's array replaced.
Non observable objects are never updated (what would be the point)
Children of non observables are not checked for changes unless there is an override.
Append will still work even though it's probably useless except in edge cases.
new array items are pushed to the end o
Exclude excludes a path from being updated.
map allows you to update a branch manually
extend allows you to extend the default processing
*/

module("updateFromModel Basic", {
    setup: function () {
        ko.viewmodel.logging = true;
    },
    teardown: function () {
        ko.viewmodel.logging = false;
    }
});


test("Default simple types", function () {
    var model, updatedModel, viewmodel;

    model = {
        stringProp: "test",
        number: 5,
        date: new Date("01/01/2001")
    };

    updatedModel = {
        stringProp: "test2",
        number: 6,
        date: new Date("12/04/2001")
    };

    viewmodel = ko.viewmodel.fromModel(model);
    ko.viewmodel.updateFromModel(updatedModel, viewmodel);

    deepEqual(viewmodel().stringProp(), updatedModel.stringProp, "String Test");
    deepEqual(viewmodel().number(), updatedModel.number, "Number Test");
    deepEqual(viewmodel().date(), updatedModel.date, "Date Test");
});

test("nested object simple types", function () {
    var model, updatedModel, viewmodel;

    model = { 
        test:{
            stringProp: "test",
            number: 5,
            date: new Date("01/01/2001")
        }
    };

    updatedModel = {
        test: {
            stringProp: "test2",
            number: 6,
            date: new Date("12/04/2001")
        }
    };

    viewmodel = ko.viewmodel.fromModel(model);
    ko.viewmodel.updateFromModel(updatedModel, viewmodel);

    deepEqual(viewmodel().test().stringProp(), updatedModel.test.stringProp, "String Test");
    deepEqual(viewmodel().test().number(), updatedModel.test.number, "Number Test");
    deepEqual(viewmodel().test().date(), updatedModel.test.date, "Date Test");
});

test("nested object override success simple types", function () {
    var model, updatedModel, viewmodel, options;

    options = {
        override:["{root}.test"]
    };

    model = {
        test: {
            stringProp: "test",
            number: 5,
            date: new Date("01/01/2001")
        }
    };

    updatedModel = {
        test: {
            stringProp: "test2",
            number: 6,
            date: new Date("12/04/2001")
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, options);
    deepEqual(viewmodel().test.stringProp(), model.test.stringProp, "Viewmodel String Test");
    deepEqual(viewmodel().test.number(), model.test.number, "Viewmodel Number Test");
    deepEqual(viewmodel().test.date(), model.test.date, "Viewmodel Date Test");

    ko.viewmodel.updateFromModel(updatedModel, viewmodel);

    deepEqual(viewmodel().test.stringProp(), updatedModel.test.stringProp, "UpdatedModel String Test");
    deepEqual(viewmodel().test.number(), updatedModel.test.number, "UpdatedModel Number Test");
    deepEqual(viewmodel().test.date(), updatedModel.test.date, "UpdatedModel Date Test");
});

test("ID option match array object simple types", function () {
    var model, updatedModel, viewmodel, options;

    model = {
        items: [
            {
                id: 5,
                stringProp: "test",
                number: 3,
                date: new Date("2/04/2001")
            }
        ]
    };

    updatedModel = {
        items:[
            {
                id:5,
                stringProp: "test2",
                number: 6,
                date: new Date("12/04/2001")
            },
            {
                id: 6,
                stringProp: "test",
                number: 3,
                date: new Date("2/04/2001")
            }
        ]
    };

    options = {
        id: ["{root}.items[i].id"]
    }

    viewmodel = ko.viewmodel.fromModel(model, options);
    ko.viewmodel.updateFromModel(updatedModel, viewmodel);

    deepEqual(viewmodel().items()[0]().id(), updatedModel.items[0].id, "String Test");
    deepEqual(viewmodel().items()[0]().stringProp(), updatedModel.items[0].stringProp, "String Test");
    deepEqual(viewmodel().items()[0]().number(), updatedModel.items[0].number, "String Test");
    deepEqual(viewmodel().items()[0]().date(), updatedModel.items[0].date, "String Test");
});

test("ID option swapped array item item", function () {
    var model, updatedModel, viewmodel, options;

    model = {
        items: [
            {
                id: 4,
                stringProp: "test",
                number: 3,
                date: new Date("2/04/2001")
            }
        ]
    };

    updatedModel = {
        items: [
            {
                id: 5,
                stringProp: "test2",
                number: 6,
                date: new Date("12/04/2001")
            }
        ]
    };

    options = {
        id: ["{root}.items[i].id"]
    }

    viewmodel = ko.viewmodel.fromModel(model, options);
    ko.viewmodel.updateFromModel(updatedModel, viewmodel);

    deepEqual(viewmodel().items().length, updatedModel.items.length, "Array Length Test");
    deepEqual(viewmodel().items()[0]().id(), updatedModel.items[0].id, "Array Item id Test");
    deepEqual(viewmodel().items()[0]().stringProp(), updatedModel.items[0].stringProp, "String Test");
    deepEqual(viewmodel().items()[0]().number(), updatedModel.items[0].number, "String Test");
    deepEqual(viewmodel().items()[0]().date(), updatedModel.items[0].date, "String Test");
});
test("array item item", function () {
    var model, updatedModel, viewmodel, options;

    model = {
        items: [
            {
                stringProp: "test",
                number: 3,
                date: new Date("2/04/2001")
            }
        ]
    };

    updatedModel = {
        items: [
            {
                stringProp: "test2",
                number: 6,
                date: new Date("12/04/2001")
            }
        ]
    };

    viewmodel = ko.viewmodel.fromModel(model);
    ko.viewmodel.updateFromModel(updatedModel, viewmodel);

    deepEqual(viewmodel().items().length, updatedModel.items.length, "Array Length Test");
    deepEqual(viewmodel().items()[0]().stringProp(), updatedModel.items[0].stringProp, "String Test");
    deepEqual(viewmodel().items()[0]().number(), updatedModel.items[0].number, "String Test");
    deepEqual(viewmodel().items()[0]().date(), updatedModel.items[0].date, "String Test");
});