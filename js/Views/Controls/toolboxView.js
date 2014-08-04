define(['marionette', 'Views/Controls/toolboxItemView'],
    function(Marionette, ItemView) {
        var toolboxItemView = Backbone.Marionette.CollectionView.extend({
            tagName: 'ul',
            className: 'us-github-list',
            childView: ItemView,
            resize: function(event, width, height) {
                this.$el.width(width);
                return {height: this.$el.height(), width: this.$el.width()}
            }
        });
        return toolboxItemView;
    });
