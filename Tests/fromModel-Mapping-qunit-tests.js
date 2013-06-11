module("fromModel Mapping", {
    setup: function () {
        //ko.viewmodel.options.logging = true;
    },
    teardown: function () {
        //ko.viewmodel.options.logging = false;
    }
});

test("Extend full path", function () {
    var model, viewmodel, modelResult;

    model = {
        test: {
            stringProp: "test"
        }   
    };

    var mapping = ko.viewmodel.mappingBuilder()
            .extend("{root}.test.stringProp",function (obj) {
                obj.repeat = ko.computed(function () {
                    return obj() + obj();
                });
                return obj;
            });

    viewmodel = ko.viewmodel.fromModel(model, mapping);

    deepEqual(viewmodel.test.stringProp.repeat(), viewmodel.test.stringProp() + viewmodel.test.stringProp());
});

test("Extend full path with shared", function () {
    var model, viewmodel, modelResult;

    model = {
        test: {
            stringProp: "test"
        },
        otherTest: {
            stringProp: "test"
        }
    };

    var mapping = ko.viewmodel.mappingBuilder()
        .define("repeat", function (obj) {
            obj.repeat = ko.computed(function () {
                return obj() + obj();
            });
            return obj;
        })
        .extend("{root}.test.stringProp", "repeat")
        .extend("{root}.otherTest.stringProp", "repeat");


    viewmodel = ko.viewmodel.fromModel(model, mapping);

    deepEqual(viewmodel.test.stringProp.repeat(), viewmodel.test.stringProp() + viewmodel.test.stringProp());
    deepEqual(viewmodel.otherTest.stringProp.repeat(), viewmodel.otherTest.stringProp() + viewmodel.otherTest.stringProp());
});

test("Extend object property path", function () {
    var model, viewmodel, modelResult;

    model = {
        test: {
            stringProp: "test"
        }
    };

    var mapping = ko.viewmodel.mappingBuilder()
        .extend("test.stringProp", function (obj) {
            obj.repeat = ko.computed(function () {
                return obj() + obj();
            });
            return obj;
        });

    viewmodel = ko.viewmodel.fromModel(model, mapping);

    deepEqual(viewmodel.test.stringProp.repeat(), viewmodel.test.stringProp() + viewmodel.test.stringProp());
});

test("Extend property path", function () {
    var model, viewmodel, modelResult;

    model = {
        stringProp: "test"
    };

    var mapping = ko.viewmodel.mappingBuilder()
        .extend("stringProp", function (obj) {
            obj.repeat = ko.computed(function () {
                return obj() + obj();
            });
            return obj;
        });

    viewmodel = ko.viewmodel.fromModel(model, mapping);

    deepEqual(viewmodel.stringProp.repeat(), viewmodel.stringProp() + viewmodel.stringProp());
});

test("Extend full path wins over object property path", function () {
    var model, viewmodel, modelResult;

    model = {
        test: {
            stringProp: "test"
        }
    };

    var mapping = ko.viewmodel.mappingBuilder()
        .extend("{root}.test.stringProp", function (obj) {
            obj.repeat = ko.computed(function () {
                return obj() + obj();
            });
            return obj;
        })
        .extend("test.stringProp", function (obj) {
            return null;
        });

    viewmodel = ko.viewmodel.fromModel(model, mapping);

    deepEqual(viewmodel.test.stringProp.repeat(), viewmodel.test.stringProp() + viewmodel.test.stringProp());
});

test("Extend full path wins over property path", function () {
    var model, viewmodel, modelResult;

    model = {
        test: {
            stringProp: "test"
        }
    };

    var mapping = ko.viewmodel.mappingBuilder()
        .extend("{root}.test.stringProp", function (obj) {
            obj.repeat = ko.computed(function () {
                return obj() + obj();
            });
            return obj;
        })
        .extend("stringProp", function (obj) {
            return null;
        });


    viewmodel = ko.viewmodel.fromModel(model, mapping);

    deepEqual(viewmodel.test.stringProp.repeat(), viewmodel.test.stringProp() + viewmodel.test.stringProp());
});


test("Extend array array-item property path", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var mapping = ko.viewmodel.mappingBuilder()
        .extend("items[i].test", function (obj) {
            obj.repeat = ko.computed(function () {
                return obj.stringProp() + obj.stringProp();
            });
            return obj;
        });

    viewmodel = ko.viewmodel.fromModel(model, mapping);

    actual = viewmodel.items()[0].test.repeat();
    expected = model.items[0].test.stringProp + model.items[0].test.stringProp;

    deepEqual(actual, expected);
});

test("Extend array array-item property path wins over array-item property path", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var mapping = ko.viewmodel.mappingBuilder()
        .extend("[i].test", function (obj) {
            return null;
        })
        .extend("items[i].test", function (obj) {
            obj.repeat = ko.computed(function () {
                return obj.stringProp() + obj.stringProp();
            });
            return obj;
        });

    viewmodel = ko.viewmodel.fromModel(model, mapping);

    actual = viewmodel.items()[0].test.repeat();
    expected = model.items[0].test.stringProp + model.items[0].test.stringProp;

    deepEqual(actual, expected);
});

test("Extend array array-item property path wins over property path", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var mapping = ko.viewmodel.mappingBuilder()
        .extend("test", function (obj) {
            return null;
        }).extend("items[i].test", function (obj) {
            obj.repeat = ko.computed(function () {
                return obj.stringProp() + obj.stringProp();
            });
            return obj;
        });

    viewmodel = ko.viewmodel.fromModel(model, mapping);

    actual = viewmodel.items()[0].test.repeat();
    expected = model.items[0].test.stringProp + model.items[0].test.stringProp;

    deepEqual(actual, expected);
});

test("Extend all array items", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var mapping = ko.viewmodel.mappingBuilder()
        .extend("[i]", function (obj) {
            obj.IsNew = false;
        });

    viewmodel = ko.viewmodel.fromModel(model, mapping);

    actual = viewmodel.items()[0].IsNew;
    expected = false;

    deepEqual(actual, expected);
});


test("Extended Array Push with Map sytax 1", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            },
            id: 1259
        }]
    };

    var mapping = ko.viewmodel.mappingBuilder()
        .extend("{root}.items[i]", function (obj) {
            obj.IsNew = (obj.id() > 0) ? false : true;
            return obj;
        })
        .unmapExtend("{root}.items[i]", function (obj, vm) {
                if (vm) {//not using this param but test will fail if not available, easy way to verify that it is passe in
                    delete obj.IsNew;
                }
                return obj;
            }
        );

    viewmodel = ko.viewmodel.fromModel(model, mapping);

    deepEqual(viewmodel.items()[0].IsNew, false, "Extend logic - object with id is not new");//1

    viewmodel.items.pushFromModel({
        test: {
            stringProp: "test"
        },
        id: null
    });

    deepEqual(viewmodel.items()[1].IsNew, true, "Extend logic applied to pushFromModel - object with id OF null is not new");//2

    actual = viewmodel.items()[0];
    expected = viewmodel.items.pop()

    notStrictEqual(actual, expected, "Pop does not change object");//3

    viewmodel.items.push(expected);

    actual = viewmodel.items()[0];
    expected = viewmodel.items.pop()

    notStrictEqual(actual, expected, "Pushing and popping does not change object");//4

    expected = model.items[0];
    actual = viewmodel.items.popToModel();

    deepEqual(actual, expected, "popToModel calls unmap and removes IsNew property");//5

});

test("Extended Array Push with Map syntax 2", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            },
            id: 1259
        }]
    };

    var mapping = ko.viewmodel.mappingBuilder()
        .extend("{root}.items[i]", {
            map: function (obj) {
                obj.IsNew = (obj.id() > 0) ? false : true;
            },
            unmap: function (obj, vm) {
                if (vm) {//not using this param but test will fail if not available, easy way to verify that it is passe in
                    delete obj.IsNew;
                }
                return obj;
            }
        });

    viewmodel = ko.viewmodel.fromModel(model, mapping);

    deepEqual(viewmodel.items()[0].IsNew, false, "Extend logic - object with id is not new");//1

    viewmodel.items.pushFromModel({
        test: {
            stringProp: "test"
        },
        id: null
    });

    deepEqual(viewmodel.items()[1].IsNew, true, "Extend logic applied to pushFromModel - object with id OF null is not new");//2

    actual = viewmodel.items()[0];
    expected = viewmodel.items.pop()

    notStrictEqual(actual, expected, "Pop does not change object");//3

    viewmodel.items.push(expected);

    actual = viewmodel.items()[0];
    expected = viewmodel.items.pop()

    notStrictEqual(actual, expected, "Pushing and popping does not change object");//4

    expected = model.items[0];
    actual = viewmodel.items.popToModel();

    deepEqual(actual, expected, "popToModel calls unmap and removes IsNew property");//5

});

test("Extended Array Push without Map", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var mapping = ko.viewmodel.mappingBuilder()
        .extend("[i]", function (obj) {
            obj.IsNew = false;
        });

    viewmodel = ko.viewmodel.fromModel(model, mapping);

    viewmodel.items.push({
        test: {
            stringProp: "test"
        }
    }, {map:false});

    notEqual(viewmodel.items.pop(), viewmodel.items()[0]);
});

test("Exclude full path", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var mapping = ko.viewmodel.mappingBuilder()
        .exclude("{root}.items[i].test");

    viewmodel = ko.viewmodel.fromModel(model, mapping);
    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel.items()[0].test, undefined, "Item Not Mapped");
});

test("Exclude full path wins over append object-property path", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var mapping = ko.viewmodel.mappingBuilder()
        .exclude(["{root}.items[i].test"])
        .append("items[i].test");

    viewmodel = ko.viewmodel.fromModel(model, mapping);
    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel.items()[0].test, undefined, "Item Not Mapped");
});

test("Exclude object-property path wins over append property path", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var mapping = ko.viewmodel.mappingBuilder()
        .exclude("items[i].test")
        .append("test");

    viewmodel = ko.viewmodel.fromModel(model, mapping);
    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel.items()[0].test, undefined, "Item Not Mapped");
});


test("Same path Last in wins - Manual Syntax", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var mapping = {
        exclude: ["items[i].test"],
        append: ["items[i].test"]
    };

    viewmodel = ko.viewmodel.fromModel(model, mapping);
    modelResult = ko.viewmodel.toModel(viewmodel);

    notEqual(viewmodel.items()[0].test, undefined, "Item Not Mapped");
});

test("Same path First in wins - dot syntax", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var mapping = ko.viewmodel.mappingBuilder()
        .exclude("items[i].test").append("items[i].test")
        ;

    viewmodel = ko.viewmodel.fromModel(model, mapping); 
    modelResult = ko.viewmodel.toModel(viewmodel);

    equal(viewmodel.items()[0].hasOwnProperty("test"), false, "Item Not Mapped");
});

test("Exclude array item property path", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var mapping = {
        exclude: ["items[i].test"]
    };

    viewmodel = ko.viewmodel.fromModel(model, mapping);
    modelResult = ko.viewmodel.toModel(viewmodel);

    deepEqual(viewmodel.items()[0].test, undefined, "Item Not Mapped");
});

test("Append property", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var mapping = {
        append: ["items[i]"]
    };

    viewmodel = ko.viewmodel.fromModel(model, mapping);

    actual = viewmodel.items()[0].test.stringProp;
    expected = model.items[0].test.stringProp

    deepEqual(actual, expected, "Item Not Mapped");
});

test("Override array", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var mapping = {
        override: ["[i]"]
    };

    viewmodel = ko.viewmodel.fromModel(model, mapping);

    actual = viewmodel.items()[0].test.stringProp();
    expected = model.items[0].test.stringProp

    deepEqual(actual, expected, "Item Not Mapped");
});

test("Override object", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var mapping = {
        override: ["{root}"]
    };


    viewmodel = ko.viewmodel.fromModel(model, mapping);

    actual = viewmodel.items()[0].test.stringProp();
    expected = model.items[0].test.stringProp

    deepEqual(actual, expected, "Item Not Mapped");
});

test("Custom Success", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var mapping = {
        custom: {
            "test": function (obj) {
                return obj ? true : false;
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, mapping);

    deepEqual(viewmodel.items()[0].test, true, "Item Not Mapped");
});

test("Custom Success with shared", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var mapping = {
        custom: {
            "test": "test"
        },
        shared: {
            "test": function (obj) {
                return obj ? true : false;
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, mapping);

    deepEqual(viewmodel.items()[0].test, true, "Item Not Mapped");
});

test("Custom Fail", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var mapping = {
        custom: {
            "test": function (obj) {
                
            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, mapping);

    deepEqual(viewmodel.items()[0].test, undefined, "Item Not Mapped");
});

test("Custom Obsevable", function () {
    var model, viewmodel, modelResult, actual, expected;

    model = {
        items: [{
            test: {
                stringProp: "test"
            }
        }]
    };

    var mapping = {
        custom: {
            "test": function (obj) {

            }
        }
    };

    viewmodel = ko.viewmodel.fromModel(model, mapping);

    deepEqual(viewmodel.items()[0].test, undefined, "Item Not Mapped");
});

