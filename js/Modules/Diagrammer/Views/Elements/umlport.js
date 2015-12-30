define(['marionette'],
    function(Marionette) {
        var View = Backbone.Marionette.ElementItemView.extend({
            template: _.template('<div id="<%=cid%>" class="us-port us-element-resizable-area grElement"></div>'),
           options: {
              maxHeight: 50,
              aspectRatio: true
            },
            behaviors: {
                ElementBehavior: {
                    "resize-handles": 'nw-u,sw-u,ne-u,se-u'
                },
                EditableBehavior: {}
            }
        });
        return View;
    });


