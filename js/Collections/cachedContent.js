
define(['backbone', 'Models/loadedContentCache'], function (Backbone, theModel) {
    var theCollection = Backbone.Collection.extend({
        model: theModel
    });
    return theCollection;
});
