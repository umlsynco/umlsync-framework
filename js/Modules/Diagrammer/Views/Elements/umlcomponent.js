define(['marionette', './../umldiagram'],
    function(Marionette) {
        var View = Backbone.Marionette.ElementItemView.extend({
            template: _.template('<div id="<%= cid %>" class="us-component grElement">\
                <img src="./images/component.png" style="position:absolute;top:3px;right:17px">\
                <span name="interface"><a tabindex="1" id="stereotype" class="editablefield" style="text-align:left;position:relative;top:30%"><%=getInterface()%></a></span><br>\
                <span><a tabindex="1" id="name" class="editablefield Name" style="text-align:left;position:relative;top:30%"><%=name%></a></span>\
                </div>'),
            templateHelpers: function() {
              return {
                cid: this.model.cid,
                getInterface: function() {
                   return this.interface ? "«" + this.interface + "»" : "           ";
                }
              }
            }
        });
        return View;
    });


