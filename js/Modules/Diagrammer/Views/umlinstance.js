define(['marionette', './umldiagram'],
    function(Marionette) {
        var View = Backbone.Marionette.ElementItemView.extend({
            template: _.template('<div id="<%=cid%>" class="us-instance us-element-resizable-area grElement">' +
                '<div style="padding:10px;border-bottom:1px solid black;"><a tabindex="1" class="editablefield">&nbsp;&nbsp;&nbsp;&nbsp;</a><b>:</b><a tabindex="1" id="name" class="editablefield" style="border-bottom:1px solid black;"><%=name%></a></div>' +
                '<div class="us-instance-spec us-element-resizable-area"><ul class="us-sortable ui-sortable"><%=getSpecification()%></ul>' +
                '</div></div>'),
            templateHelpers: function() {
                return {
                    cid: this.model.cid,
                    getSpecification: function() {return ""}
                }
            }
        });
        return View;
    });


