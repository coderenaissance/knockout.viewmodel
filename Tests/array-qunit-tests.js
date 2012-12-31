
module("toModel Basic", {
    setup: function () {
        //ko.viewmodel.logging = true;
    },
    teardown: function () {
        //ko.viewmodel.logging = false;
    }
});


test("array push pop", function () {
    var viewmodel, result;

    viewmodel = {
        array: []
    };

    viewmodel = ko.viewmodel.fromModel(model);
    viewmodel.array.push({ test: true });
    result = viewmodel.array.pop();

    assert(result.test(), true);

});

test("array push pop", function () {
    var viewmodel, result;

    viewmodel = {
        array: []
    };

    viewmodel = ko.viewmodel.fromModel(model);
    viewmodel.array.push({ test: true });
    result = viewmodel.array.pop(true);

    assert(result.test, true);
});


