define(['marionette'],
    function(Marionette) {
        var toolboxItemView = Backbone.Marionette.ItemView.extend({
            triggers: {
                "click li>span" : "toolbox:click"
            },
            tagName: 'li',
            template: function(serialized_model) {
                var title = serialized_model.title;
                var name = serialized_model.name;
                var cssClass =  serialized_model.cssClass || '';
                var icon = serialized_model.icon;

                return _.template('<span id="us-<%= args.name %>" class="us-<%= args.cssClass %>" title="<%= args.title %>"><img src="<%= args.icon %>" class="ui-icon"></span>', {
                    name : name,
                    cssClass: cssClass,
                    icon: icon,
                    title: title
                }, {variable: 'args'});
            }
        });
        return toolboxItemView;
    });
