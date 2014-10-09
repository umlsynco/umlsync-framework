define(['marionette', './classview'],
    function(Marionette, ClassView) {
        var ElementsView = Backbone.Marionette.CollectionView.extend({
        });

        var ConnectorsView = Backbone.Marionette.CollectionView.extend({
        });

        var DiagramView = Backbone.Marionette.ItemView.extend({
            template: _.template('<div class="us-canvas-bg" style="width:100%;height:100%;"></div>'),
            initialize: function(options, attr) {
                if (attr && attr.singleCanvas) {
                    // TODO: handle embedded content
                }
            },
            onRender: function() {
                // Draw all elements
                this.cv = new Marionette.CollectionView({
                    childView: ClassView,
                    collection:this.model.umlelements
                });
                this.cv.render();
                this.$el.append(this.cv.$el);
                var that = this;
                $("#" + this.euid + ".us-diagram").scroll(function() {that.drawConnectors();});

            },
            //
            // Re-draw connectors
            //
            drawConnectors: function() {

            }
        });
        return DiagramView;
    });

