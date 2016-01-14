define(['marionette'],
    function(Marionette) {
        var View = Backbone.Marionette.ElementItemView.extend({
            template: _.template('<div id="<%=cid%>" class="grElement" style="width:100%;">\
        <div class="us-instance-line"></div>\
        <div class="us-instance-line2"></div>\
        <div id="<%=cid%>_NEXT" class="us-instance grElement" style="height:40px;">\
        <div>:<a id="name" class="editablefield Name"><%=name%></a></div></div></div>'),
            axis: "x",
            acceptDrop: ["llport", "lldel"],
            behaviors: {
                ElementBehavior: {
                    "resize-handles": 'w-ul,e-ul,s-ul',
                    "axis": "x"
                },
                EditableBehavior: {}
            },
            _checkRelation: function(e1, e2) {
                // e1 could be dropped on e2
                if (e1.droppable && _.contains(e2.acceptDrop, e1.model.get("type"))) {
                    var inner = {
                        left: e1.model.get("left"),
                        top: e1.model.get("top"),
                        width: e1.model.get("width"),
                        height: e1.model.get("height")
                        },
                    outer = {
                        left: e2.model.get("left"),
                        top: e2.model.get("top"),
                        width: e2.model.get("width"),
                        height: e2.model.get("height")
                    };
                    if (outer.left < inner.left && outer.left + outer.width > inner.left + inner.width) {
                        e2.$el.addClass('dropped-' + e1.cid);
                        if (!_.contains(e2.droppedElements, e1)) {
$.log("2- ELEMENT " + e2.model.cid + " PUSH dropped " + e1.model.cid);
                            e2.droppedElements.push(e1);
                        }
                        if (outer.top < inner.top && inner.top + inner.height > outer.top + outer.height) {
                            this.$el.css("height", inner.top + inner.height);
                            this.model.set({height: inner.top + inner.height});
		        }
                        return true;
                    }
                    else {
                        e2.droppedElements = _.without(e2.droppedElements, e1);
                        e2.$el.removeClass('dropped-' + e1.cid);
                    }
                }
                return false;
            },
            dropDone: function(dev) {
                // Check if this element could be dropped on dev
                // or dev could be dropped on this
                //
                $.log("dropDone: " + this.model.get("type") + ": "+ this.model.cid);
                if (!dev.dropParent)
                  if (this._checkRelation(dev, this))
                      dev.dropParent = this;

                if (dev.dropParent == this) {
					  $.log("zIndex");
					  var index_current = parseInt(this.$el.css("zIndex"), 10);
					  this.model.set("zIndex", index_current);

					  $.log("zIndex: " + index_current);

					  dev.$el.css("zIndex", index_current+10);
					  dev.model.set("zIndex", index_current+10);

					  this._updateDroppedPositions();
				}
            },
            _updateDroppedPositions: function() {
				var that = this,
				pos = this.$el.position(),
				left = pos.left + this.$el.width()/2 - 5;
				_.each(this.droppedElements, function(delem) {
					delem.$el.css({left: left});
					delem.model.set({left: left});
			    });
			}
            //template: _.template('<div id="<%=cid%>" class="us-port us-element-resizable-area grElement"></div>')
        });
        return View;
    });


