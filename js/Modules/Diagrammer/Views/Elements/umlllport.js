define(['marionette'],
    function(Marionette) {
        var View = Backbone.Marionette.ElementItemView.extend({
            template: _.template('<div id="<%=cid%>" class="us-port us-element-resizable-area grElement"></div>'),
            behaviors: {
                ElementBehavior: {
                    "resize-handles": 'n-u,s-u'
                },
                EditableBehavior: {}
            }

        });
        return View;
    });


