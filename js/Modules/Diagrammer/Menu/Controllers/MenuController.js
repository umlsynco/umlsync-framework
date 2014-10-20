
define(['backbone'], function (Backbone) {
    var theCollection = Backbone.Collection.extend({
        model: theModel
    });
    return theCollection;
});
