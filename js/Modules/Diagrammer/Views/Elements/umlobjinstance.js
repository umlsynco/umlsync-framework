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
            }
            //template: _.template('<div id="<%=cid%>" class="us-port us-element-resizable-area grElement"></div>')
        });
        return View;
    });


