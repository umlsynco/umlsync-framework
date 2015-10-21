define(['marionette'],
    function(Marionette) {
        var View = Backbone.Marionette.ElementItemView.extend({
            template: _.template('<div id="<%=cid%>" class="us-port us-element-resizable-area grElement"></div>'),
            axis: "y",
            behaviors: {
                ElementBehavior: {
                    "resize-handles": 'n-ul,s-ul',
                    "axis": "y"
                },
                EditableBehavior: {}
            }

        });
        return View;
    });


