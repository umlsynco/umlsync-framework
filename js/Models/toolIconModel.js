define(['backbone'], function (Backbone) {
    var ToolIcon = Backbone.Model.extend({
        defaults: {
            title: '', // Absolute path to the content
            name: '',
            trigger: "click", // active status indicator
            isActive: true, // Prototype of object
            cssClass: "left",
            icon : '' // jQuery ui icon or css class
        }
    });
    return ToolIcon;
});
