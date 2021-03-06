define(['marionette'],
function(Marionette, diagram) {
        var itemView = Backbone.Marionette.ItemView.extend({
            tagName: 'img',
            template: _.template(""),
            onRender: function() {
                this.$el.attr("src", this.model.get("icon")).attr("title", this.model.get("type"))
                    .attr("itemid", this.model.get("itemId"))
                    .attr("menuid", this.model.get("menuId"));
            }
        });

        var IconView = Backbone.Marionette.CollectionView.extend({
            childView : itemView,
            className: 'elmenu-us-class-menu',
            template: _.template(""),
            initialize: function(options) {
                this.dataProvider = options.diagramMenu;
                this.description = options.description;
            },
            onShow: function() {
              var helperModel = new Backbone.Model({left:0, top:0, type:"helper", temporary:true, id:0});
              var that = this;
var diff;
              $("#tabs .elmenu-us-class-menu img").draggable({
                'appendTo': "#tabs",
                'containment': "#tabs",
                'helper': function(event) {
                   // Use the double wrapper because of element's structrure
                   return $("<div id='"+ helperModel.cid +"_Border' style='border:solid black;border-width:1px;position:absolute;top:-50;' class='us-icon-menu-connection-helper'>" + 
                            "<div id='"+ helperModel.cid +"' style='border:solid yellow;border-width:1px;'> [ x ]</div></div>");
                 },
                 'start': function(event, ui) {
                     $(ui.helper).css({left:ui.position.left,top:ui.position.top-50});
                     helperModel.set({left:ui.position.left,top:ui.position.top});
                     // [TODO] Looks really stuipid to request framework here !!!
                     var Framework = require('Views/framework');
// TODO: if connector type is SELF-connector => return false
//       and stop propagation => create element directly
 var pos = ui.helper.position();
 diff = {top: pos.top - ui.position.top, left: pos.left - ui.position.left};
$.log("UI : " + diff.top + " : " + diff.left);
                     Framework.vent.trigger("content:past", 
                                             {source:"diagram-icon-menu",
                                              context: {
                                                  connectorType: this.title || "aggregation",
                                                  model:helperModel},
                                              initialContext: that.dataProvider? that.dataProvider.IconMenuData : null});
                 },
                 'drag': function(event, ui) {

ui.position.top += diff.top; 
ui.position.left += diff.left;

//                      $(ui.helper).css({left:event.pageX,top:event.pageY});
                     if (that.dataProvider && that.dataProvider.IconMenuData) {
                         that.dataProvider.IconMenuData.trigger("drag:do");
                     }
                 },
                 'stop': function(event, ui) {
ui.position.top += diff.top;
ui.position.left += diff.left;


                     var itemId = $(this).attr("itemid");
                     var menuId = $(this).attr("menuid");
                     var element = that.description[menuId].items[itemId].element;
                     var Framework = require('Views/framework');
                     Framework.vent.trigger("content:past", { source:"diagram-icon-menu",
                                                              context: {connectorType: this.title || "aggregation", left: ui.position.left, top: ui.position.top},
                                                                 element: element,
                                                              initialContext: that.dataProvider? that.dataProvider.IconMenuData : null});
                     // TODO: Force connectors re-draw, but looks really ugly
                     if (that.dataProvider && that.dataProvider.IconMenuData) {
                         that.dataProvider.IconMenuData.trigger("drag:stop");
                     }
                 } // stop
             }) // draggale
            .parent()
            .mouseenter(function() {
                // Framework.IconMenuRegion
                $(this).parent().stop().animate({opacity:"1"});
            })
            .mouseleave(
               // Framework.IconMenuRegion
               function() {$(this).parent().stop().animate({opacity:"0"});});
          } // onRender
        });
        
        return IconView;
});    
