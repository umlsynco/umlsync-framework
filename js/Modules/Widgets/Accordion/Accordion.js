define([
        'jquery',
        'jquery-ui',
        'underscore',
        'marionette'],
function ($, useless, _, Marionette) {
   // <li id="0" class="element-selector" style="cursor:pointer;list-style-image:url('././/dm/icons/us/es/class/Class.png');"><a>Class</a></li>
   var elementView = Marionette.ItemView.extend({
	   tagName: 'li',
	   className: 'element-selector',
	   template: _.template("<span style=\"cursor:pointer;list-style-image:url('<%= icon %>');\"><a><%= title %></a>")
   });
   var elementsCollection = Marionette.CollectionView.extend({
					             tagName: 'ul',
                                 childView: elementView});
   
   var connectorView = Marionette.ItemView.extend({
	   tagName: 'li',
	   className: 'connector-selector',
	   template: _.template("<span style=\"cursor:pointer;list-style-image:url('/dm/icons/us/es/<%= type %>/<%= title %>.png');\"><a><%= title %></a>")
   });

   var itemView = Marionette.ItemView.extend({
       tagName:"h3",
       className:"umlsync-accordion-item ui-state-default ui-accordion-header-active ui-state-active ui-corner-top ui-accordion-icons us-inactive",
       template:_.template('<span class="ui-accordion-header-icon ui-icon ui-icon-triangle-1-s"></span><%= title%>'),
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
           .wrap('<div aria-hidden="false" role="tabpanel" aria-labelledby="ui-id-3" style="display: block; height: 119px;" class="ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content-active ui-item-'+model.type+'"></div>')
           .wrap('<p></p>');
	   }
    });
    return collectionView;
});
