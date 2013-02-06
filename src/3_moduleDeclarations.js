
    //Module declarations. For increased compression with simple settings on the closure compiler,
    //the ko functions are stored in variables. These variable names will be shortened by the compiler, 
    //whereas references to ko would not be. There is also a performance savings from this.
    var unwrap = ko.utils.unwrapObservable,
        isObservable = ko.isObservable,
        makeObservable = ko.observable,
        makeObservableArray = ko.observableArray,
        rootContext = { name: "{root}", parent: "{root}", full: "{root}" },
        fnLog, makeChildArraysObservable,
        badResult = function fnBadResult() { };