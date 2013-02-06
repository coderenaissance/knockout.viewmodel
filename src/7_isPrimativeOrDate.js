
    //while dates aren't part of the JSON spec it doesn't hurt to support them as it's not unreasonable to think they might be added to the model manually.
    //undefined is also not part of the spec, but it's currently be supported to be more in line with ko.mapping and probably doesn't hurt.
    function isPrimativeOrDate(obj) {
        return obj === null || obj === undefined || obj.constructor === String || obj.constructor === Number || obj.constructor === Boolean || obj instanceof Date;
    }