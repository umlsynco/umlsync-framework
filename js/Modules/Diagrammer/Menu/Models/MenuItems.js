
define(['backbone'], function (Backbone) {
    var MainMenu = Backbone.Collection.extend({
        model: Backbone.Model,
        url: 'assets/diagrammer/menu/class_with_menu.json',
        parse: function(data) {
            return data.elements;
        }
    });
    return MainMenu;
});
