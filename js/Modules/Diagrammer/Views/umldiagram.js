define(['marionette'],
    function(Marionette) {
        var ElementsView = Backbone.Marionette.CollectionView.extend({
        });

        var ConnectorsView = Backbone.Marionette.CollectionView.extend({
        });

        var DiagramView = Backbone.Marionette.ItemView.extend({
            template: _.template('<div class="us-canvas-bg" style="width:100%;height:100%;"></div>'),
            initialize: function(options, attr) {

            },
            onRender: function() {
                var that = this;
                $("#" + this.euid + ".us-diagram").scroll(function() {that.drawConnectors();});
            },
            drawConnectors: function() {

            }
        });
        return DiagramView;
    });

