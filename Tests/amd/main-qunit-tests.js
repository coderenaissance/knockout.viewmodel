require.config({
    paths: {
        knockout: "http://cdnjs.cloudflare.com/ajax/libs/knockout/2.2.0/knockout-min",
        qunit: "http://code.jquery.com/qunit/qunit-1.10.0",
        viewmodel: "../../knockout.viewmodel"
    },
    shim: {
        qunit: {
            exports: "QUnit",
            init: function() {
                QUnit.config.autoload = false;
                QUnit.config.autostart = false;
            }
        }
    }
});

require(["qunit", "amd-qunit-tests", "undefined-Basic-qunit-tests",
         "undefined-Mapping-qunit-tests", "null-Basic-qunit-tests",
         "null-Mapping-qunit-tests", "simpleTypes-qunit-tests",
         "nestedObject-qunit-tests", "fromModel-Basic-qunit-tests",
         "fromModel-Mapping-qunit-tests", "toModel-Basic-qunit-tests",
         "fromModelToModel-Basic-qunit-tests", "updateFromModel-Basic-qunit-tests",
         "issues-qunit-tests", "updateFromModel-Mapping-contiguous-qunit-tests",
         "updateFromModel-Mapping-noncontiguous-qunit-tests"],
function(QUnit, amd, undefinedBasic, undefinedMapping, nullBasic, nullMapping,
         simpleTypes, nestedObjects, fromModelBasic, fromModelMapping, toModelBasic,
         fromModelToModelBasic, updateFromModelBasic, issues,
         updateFromModelMappingContiguous, updateFromModelMappingNoncontiguous) {
    QUnit.load();
    QUnit.start();

    amd.run();
    undefinedBasic.run();
    undefinedMapping.run();
    nullBasic.run();
    nullMapping.run();
    simpleTypes.run();
    nestedObjects.run();
    fromModelBasic.run();
    fromModelMapping.run();
    toModelBasic.run();
    fromModelToModelBasic.run();
    updateFromModelBasic.run();
    issues.run();
    updateFromModelMappingContiguous.run();
    updateFromModelMappingNoncontiguous.run();
});
