define(['marionette',
        'Views/framework'
    ],
    function (Marionette, Framework) {
        var DropController = Marionette.Controller.extend({
            initialize: function (options) {
                this.view = options.view.elementsView;
                this.model = options.model;
                this.view.on("element:drag:stop", _.bind(this.onDragStop, this));
                this.view.on("element:resize:stop", _.bind(this.onResizeStop, this));
            },
            onDragStop: function(itemView) {
                if (itemView.droppable) {
                    var inner = {left:itemView.model.get("left"), top:itemView.model.get("top"), width:itemView.model.get("width"), height:itemView.model.get("height")};

                    this.view.children.each(function(element) {
                        if (element == itemView) {
                            return;
                        }
                        var elem = element.model;
                        var outer = {left:elem.get("left"), top:elem.get("top"), width:elem.get("width"), height:elem.get("height")};

                        if (outer.top < inner.top && inner.top + inner.height < outer.top + outer.height
                            && outer.left < inner.left && outer.left + outer.width > inner.left + inner.width) {
                            itemView.$el.addClass('dropped-' + element.cid);
                        }
                    });
                }
            },
            onResizeStop: function(itemView) {
                alert("Stop resize controller");
            }
        });
        return DropController;
    }
);