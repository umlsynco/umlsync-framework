define(['marionette'],
    function(Marionette) {
        var View = Backbone.Marionette.ElementItemView.extend({
            template: _.template('<img id="<%=cid%>"  class="us-element-resizable-area" src="images/lldel.png"></img>\
                <div aria-disabled="true" tabindex="1" class="ui-draggable" id="name"\
                style="position:absolute;z-index:99999;"><a class="editablefield "><%=name%></a></div>'),
        onRender: function() {
            this.$el.children("#name").draggable();
        },
        droppable: true,
        behaviors: {
            ElementBehavior: {
                "resize-handles": 'nw-u,sw-u,ne-u,se-u'
            },
            EditableBehavior: {}
        }
        });
        return View;
    });


