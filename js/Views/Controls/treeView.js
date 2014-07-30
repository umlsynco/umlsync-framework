define(['marionette', 'dynatree', 'Views/Controls/treeItemView'],
    function (Marionette, dt, ItemView) {
        var TreeView = Backbone.Marionette.CollectionView.extend({
            childView : ItemView,
            initialize: function () {
                this.$el.attr('id', 'us-tree');
                this.collection.on('sync', this.render, this);

                var that = this;
                this.$el.dynatree({
                    persist: false,
                    children: [],

                    onCreate: function (node, span) {
                        // trigger context menu show
                    },
                    onLazyRead: function (node) {
                        if (node.data.isFolder) {
                            that.collection.lazyLoad(node.data);
                        }
                    },
                    onFocus: function (node) {
                    },
                    onActivate: function (node) {
                        // Nothing to load for folder
                        if (node.data.isFolder) {
                            return;
                        }
                        that.trigger("file:open", node.data);
                    }
                });

            },
            render: function(callection, x1, c2) {
            }
        });
        return TreeView;
    });
