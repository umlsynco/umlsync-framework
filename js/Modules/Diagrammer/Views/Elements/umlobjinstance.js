define(['marionette'],
    function(Marionette) {
        var View = Backbone.Marionette.ElementItemView.extend({
            template: _.template('<div id="<%=cid%>" class="us-element-resizable-area" style="width:100%;">\
        <div class="us-instance-line"></div>\
        <div id="<%=cid%>_NEXT" class="us-instance grElement" style="height:40px;">\
        <div><a id="name" class="editablefield Name">:<%=name%></a></div></div></div>'),
            axis: "x",
            acceptDrop: ["llport", "lldel"],
            behaviors: {
                ElementBehavior: {
                    "resize-handles": 'w-ul,e-ul,s-ul',
                    "axis": "x"
                },
                EditableBehavior: {}
            },
            dropDone: function(dev) {
                // Check if this element could be dropped on dev
                // or dev could be dropped on this
                //
                if (!dev.dropParent)
                  this._checkRelation(dev, this);

                if (dev.dropParent == this) {
					  $.log("zIndex");
					  var index_current = parseInt(this.$el.css("zIndex"), 10);
					  $.log("zIndex: " + index_current);
					  dev.$el.css("zIndex", index_current+10);
				}

            },
            //template: _.template('<div id="<%=cid%>" class="us-port us-element-resizable-area grElement"></div>')
        });
        return View;
    });


