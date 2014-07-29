define(['backbone'], function (Backbone) {
    var DataProviderModel = Backbone.Model.extend({
        defaults: {
            name: 'untitled', // Absolute path to the content
            isActive: false, // active status indicator
            object: null // Prototype of object
        }
    });
    return DataProviderModel;
});

