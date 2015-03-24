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
            onShow: function() {
			  var helperModel = new Backbone.Model({left:0, top:0});
              $("#tabs .elmenu-us-class-menu img").draggable({
                'appendTo': "#tabs",
                'helper': function(event) {
                   // Use the double wrapper because of element's structrure
                   return $("<div id='ConnectionHelper_Border' style='border:solid black;border-width:1px;'>" + 
                            "<div id='ConnectionHelper' style='border:solid yellow;border-width:1px;'> [ x ]</div></div>");
                 },
                 'start': function(event) {
					 helperModel.set({left:event.pageX,top:event.pageY});
					 var Framework = require('Views/framework');
					 Framework.vent.trigger("content:past", {source:"diagram-icon-menu", context: {connectorType: "aggregation", model:helperModel}});
                 },
                 'drag': function(event, ui) {
					 helperModel.set({left:event.pageX,top:event.pageY});
                 },
                 'stop': function(event, ui) {
					 //Framework.vent.trigger("content:past", {source:"diagram-icon-menu", context: {connectorType: "aggregation", model:{, remove:helperModel}});
                 } // stop
             }) // draggale
            .parent()
            .mouseenter(function() {
                $(this).stop().animate({opacity:"1"});
            })
            .mouseleave(
               function() {$(this).stop().animate({opacity:"0"});});
          } // onRender
        });
        
        return IconView;
});    
