define(['marionette', './../umldiagram'],
    function(Marionette) {
        var View = Backbone.Marionette.ElementItemView.extend({
            options: {
              maxHeight: 50,
              aspectRatio: true
            },
            template: _.template('<div id="<%=cid%>" style="width:100%; height:100%; opacity: 0.2;" class="grElement us-element-resizable-area">&nbsp;</div>\
              <div aria-disabled="true" tabindex="1" class="ui-draggable" id="name"\
                style="position:absolute;z-index:99999; width:256px;"><a class="editablefield" ><%=name%></a>    </div>'),
            onRender: function() {
                var that = this;
                this.$el.children("#name")
                .draggable({stop:function(event, ui) {
                    that.model.set({nameY:ui.position.top, nameX: ui.position.left});
                }})
                .css({top:this.model.get("nameY"), left: this.model.get("nameX")});
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


