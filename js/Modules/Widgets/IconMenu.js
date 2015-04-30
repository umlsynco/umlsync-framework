define(['marionette'],
function(Marionette, diagram) {
        var itemView = Backbone.Marionette.ItemView.extend({
            tagName: 'img',
            template: _.template(""),
            onRender: function() {
                this.$el.attr("src", this.model.get("image")).attr("title", this.model.get("connector"));
            }
        });

        var IconView = Backbone.Marionette.CollectionView.extend({
            childView : itemView,
            className: 'elmenu-us-class-menu',
            template: _.template(""),
            initialize: function(options) {
				this.dataProvider = options.diagramMenu;
			},
            onShow: function() {
			  var helperModel = new Backbone.Model({left:0, top:0, type:"helper", temporary:true, id:0});
			  var that = this;
              $("#tabs .elmenu-us-class-menu img").draggable({
                'appendTo': "#tabs",
                'helper': function(event) {
                   // Use the double wrapper because of element's structrure
                   return $("<div id='"+ helperModel.cid +"_Border' style='border:solid black;border-width:1px;' class='us-icon-menu-connection-helper'>" + 
                            "<div id='"+ helperModel.cid +"' style='border:solid yellow;border-width:1px;'> [ x ]</div></div>");
                 },
                 'start': function(event) {
					 helperModel.set({left:event.pageX,top:event.pageY});
                                         // [TODO] Looks really stuipid to request framework here !!!
					 var Framework = require('Views/framework');

					 Framework.vent.trigger("content:past", 
                                             {source:"diagram-icon-menu",
                                              context: {
                                                  connectorType: this.title || "aggregation",
                                                  model:helperModel},
                                              initialContext: that.dataProvider? that.dataProvider.IconMenuData : null});
                 },
                 'drag': function(event, ui) {
					 if (that.dataProvider && that.dataProvider.IconMenuData) {
						 that.dataProvider.IconMenuData.trigger("drag");
					 }
                 },
                 'stop': function(event, ui) {
					 var Framework = require('Views/framework');
					 Framework.vent.trigger("content:past", { source:"diagram-icon-menu",
						                                      context: {connectorType: this.title || "aggregation", left: ui.position.left, top: ui.position.top},
						                                      initialContext: that.dataProvider? that.dataProvider.IconMenuData : null});
				     // TODO: Force connectors re-draw, but looks really ugly
                     if (that.dataProvider && that.dataProvider.IconMenuData) {
						 that.dataProvider.IconMenuData.trigger("drag");
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
