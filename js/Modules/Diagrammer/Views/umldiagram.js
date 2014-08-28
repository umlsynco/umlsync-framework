define(['marionette'],
    function(Marionette) {
        var DiagramView = Backbone.Marionette.CollectionView.extend({
            template: _.template(''),
            triggers : {
                "click span": "toolbox:click"
            }
        });
        return DiagramView;
    });

