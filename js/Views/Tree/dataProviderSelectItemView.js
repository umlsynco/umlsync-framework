define(['marionette'],
function(Marionette) {
    var SelectItemView = Backbone.Marionette.ItemView.extend({
        template: function(serialized_model) {
            var name = serialized_model.name;
            return _.template('<span id="us-<%= args.nameUpcase %>"><%= args.name %></span>', {
                name: name,
                nameUpcase: name.toUpperCase()
            }, {variable: 'args'});
        },
        triggers : {
            "click span": "toolbox:click"
        }
    });
    return SelectItemView;
});
