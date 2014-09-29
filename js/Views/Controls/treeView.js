define(['marionette', 'dynatree', 'Views/Controls/treeItemView'],
    function (Marionette, dt, ItemView) {
        var TreeView = Backbone.Marionette.CollectionView.extend({
            childView : ItemView,
            initialize: function () {
                this.$el.attr('id', 'us-tree');
                //this.collection.on('sync', this.render, this);
                this.collection.on('reset', this.onReset, this);

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
                        var clone = $.extend({}, node.data, {absPath:node.getAbsolutePath()});
                        // trigger file in focus event
                        that.trigger("file:focus", clone);
                    }
                });

            },
            render: function(callection, x1, c2) {
            },
            resize: function(event, width, height) {
                this.$el.parent().width(width).height(height-20);
                this.$el.width(width).height(height-20);
                return {height: this.$el.height(), width: this.$el.width()}
            },
            onReset: function() {
              this.$el.dynatree("getTree").reload();
            }
        });
        return TreeView;
    });
