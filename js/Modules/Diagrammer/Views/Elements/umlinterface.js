define(['marionette', './../umldiagram'],
    function(Marionette) {
        var View = Backbone.Marionette.ElementItemView.extend({
            template: _.template('<div id="<%=cid%>" style="width:47px;height: 47px;" class="us-interface grElement"></div>\
              <div aria-disabled="true" tabindex="1" class="ui-draggable" id="name"\
                style="position:absolute;z-index:99999;"><a class="editablefield "><%=name%></a>    </div>'),
            onRender: function() {
                this.$el.children("#name").draggable();
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


