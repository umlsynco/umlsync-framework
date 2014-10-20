define(
    ['jquery', 'marionette', 'Views/framework', 'Modules/Diagrammer/Menus/Models/MenuItems'],
    function ($, Marionette, Framework, MenuCollection) {
        var itemView = Backbone.Marionette.ItemView.extend({
            triggers: {
                "click li>span" : "selectmenu:click"
            },
            tagName: 'li',
            template: function(serialized_model) {
                var name = serialized_model.name;
                return _.template('<span id="us-<%= args.name %>"><%= args.name %>"</span>', {
                    name : name
                }, {variable: 'args'});
            }
        });


        var menu = Marionette.CollectionView.extend({
            childView: itemView
        });

        return menu;
    });

