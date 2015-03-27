define([
        'jquery',
        'jquery-ui',
        'underscore',
        'marionette'],
function ($, useless, _, Marionette) {
	var Framework;
   // <li id="0" class="element-selector" style="cursor:pointer;list-style-image:url('././/dm/icons/us/es/class/Class.png');"><a>Class</a></li>
   var elementView = Marionette.ItemView.extend({
	   tagName: 'li',
	   className: 'element-selector',
	   template: _.template("<a style=\"cursor:pointer;background-image:url('<%= icon %>');\"><%= title %></a>"),
       events: {
           'click': 'onSelectMenuItem'
       },
       onSelectMenuItem: function() {
		   if (Framework && Framework.vent) {
			   var opt = this.model.get("options");

			   if (opt) {
			     opt.type = this.model.get("type");
			     opt.name = this.model.get("title");
			     Framework.vent.trigger("content:past", {source: "diagram-menu", context: new Backbone.Model(opt)});
			   }
		   } else {
			   alert("FRAMEWORK IS NOT DEFINED FOR DIAGRAM MENU ITEM !!!");
		   }
	   }
   });
   // Collection of the elements icons
   var elementsCollection = Marionette.CollectionView.extend({
       tagName: 'ul',
       childView: elementView,
       		// Filter hidden items
       addChild: function(child, ChildView, index){
		   var hasIcon = child.has("icon");
		   var isHidden = child.get("hidden");
           if (child.has("icon") && child.get("hidden") != true) {
               Marionette.CollectionView.prototype.addChild.apply(this, arguments);
           }
       }
   });
   
   var connectorView = Marionette.ItemView.extend({
	   tagName: 'li',
	   className: 'connector-selector',
	   template: _.template("<span style=\"cursor:pointer;list-style-image:url('<%= icon %>');\"><a><%= title %></a>"),
   });

   // <h3 class="ui-accordion-header ui-helper-reset ui-state-default ui-state-active ui-corner-top" aux="class">
   // <span class=""></span><a tabindex="-1" href="#">class diagram</a></h3>

   var itemView = Marionette.ItemView.extend({
       tagName:"h3",
       className:"umlsync-accordion-item ui-accordion-header ui-helper-reset ui-state-default ui-state-active ui-corner-top us-inactive",
       template:_.template('<span class="ui-icon ui-icon-triangle-1-s"></span><a tabindex="-1" href="#"><%= title%></a>'),
       events: {
           'click': 'onSelectMenu'
       },
       onRender: function() {
		   // add an extra attribute
		   this.$el.attr("id", this.cid);
	   },
       onSelectMenu: function(event) {
		   // hide all accordions
           this.$el.parent().children("DIV").hide();
           // show only active one
           this.$el.parent().children("DIV.ui-item-"+ this.model.get("type")).show();
       },
       onBeforeDestroy: function() {
		   this.$el.parent().children("DIV.ui-item-"+ this.model.get("type")).remove();
	   },
	   onShow: function() {
		   this.$el.trigger("click");
	   }
       });

    var collectionView = Marionette.CollectionView.extend({
       childView: itemView,
       addMenu: function(model, data) {
		   this.collection.add(model);

           this.elements  = new elementsCollection({collection: new Backbone.Collection(data.elements)});

           this.elements.render();
           this.$el.append(this.elements.$el);
           this.elements.$el
           .wrap('<div aria-hidden="false" role="tabpanel" aria-labelledby="ui-id-3" style="display: block; min-height: 119px;" class="ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content-active ui-item-'+model.type+'"></div>');
//           .wrap('<p></p>');
	   },
	   hasMenu: function(model) {
		   var response = this.collection.where({type: model.type});
		   // Just to prevent multiple load of the same item
		   // we have to check it in the collection
		   if (response && response.length > 0) {
			   return true;
		   }
		   return false;
	   },
	   initialize: function(options) {
		   Framework = options.Framework
	   }
    });
    return collectionView;
});
