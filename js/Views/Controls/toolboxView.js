define(['marionette', 'Views/Controls/toolboxItemView'],
    function(Marionette, ItemView) {
        var toolboxItemView = Backbone.Marionette.CollectionView.extend({
            tagName: 'ul',
            className: 'us-github-list',
            childView: ItemView
        });
        return toolboxItemView;
    });
