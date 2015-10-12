define(['marionette'],
    function(Marionette) {
        var View = Backbone.Marionette.ElementItemView.extend({
            template: _.template('<div id="<%=cid%>"  class="us-element-resizable-area" src="assets/images/lldel.png"></img>')
        });
        return View;
    });


