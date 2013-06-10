define(["knockout", "viewmodel"], function(ko) {
    var run = function() {
        module("AMD Tests");
        test("Module Loading", function() {
            ok(ko, "ko Defined");
            ok(ko.viewmodel, "ko.viewmodel Defined");
            ok(!window.ko, "Global ko Not Defined");
        });
    };
    return {run: run};
});
