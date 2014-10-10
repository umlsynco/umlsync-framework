define(['marionette', './umldiagram'],
    function(Marionette) {
        var View = Backbone.Marionette.ElementItemView.extend({
            template: _.template('<div id="<%=cid%>" style="width:100%;height:100%;">\
              <div style="width: 47px; height: 47px;" id="Circle" class="us-interface grElement"></div>\
              <div aria-disabled="true" tabindex="1" class="ui-draggable ui-draggable-disabled ui-state-disabled" id="name"\
                style="position:absolute;z-index:99999;"><%=name%></div>\
              </div>')
        });
        return View;
    });


