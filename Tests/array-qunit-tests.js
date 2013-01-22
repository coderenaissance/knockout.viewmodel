
var model;
module("toModel Basic", {
    setup: function () {
        //ko.viewmodel.options.logging = true;
        model = {
            array: []
        };
    },
    teardown: function () {
        //ko.viewmodel.options.logging = false;
        model = undefined;
    }
});


test("array push pop", function () {
    var viewmodel, result;

    viewmodel = ko.viewmodel.fromModel(model);
    viewmodel.array.push({ test: true });
    result = viewmodel.array.pop();

    assert(result.test(), true);

});

test("array push pop", function () {
    var viewmodel, result;

    viewmodel = ko.viewmodel.fromModel(model);
    viewmodel.array.push({ test: true }, true);
    result = viewmodel.array.pop();

    assert(result.test, true);

});


