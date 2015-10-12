define(['marionette'],
    function(Marionette) {
        var View = Backbone.Marionette.ElementItemView.extend({
            className: "us-element-transparent",
            template: _.template('<div id="<%=cid%>" class="us-alt-body us-element-resizable-area grElement" style="background-color:transparent;">' +
                '<div class="us-alt-tab"><b>[<a class="editablefield">condition</a>]</b><img src="images/cornerb.png" style="position:absolute;bottom:-1px;right:-1px;"></div>\
                 </div>')
        });
        return View;
    });

