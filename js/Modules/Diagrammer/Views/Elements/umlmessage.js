define(['marionette'],
    function(Marionette) {
        var View = Backbone.Marionette.ElementItemView.extend({
            template: _.template('<div id="<%=cid%>"  style="width:100%;height:100%;">\
                  <div id="Circle" class="us-interface grElement"></div></div>')
        });
        return View;
    });


