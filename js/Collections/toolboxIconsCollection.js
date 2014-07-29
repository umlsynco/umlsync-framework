
define(['backbone', 'Models/toolIconModel'], function (Backbone, iconModel) {
    var ToolboxCollection = Backbone.Collection.extend({
        model: iconModel
    });
    return ToolboxCollection;
});

