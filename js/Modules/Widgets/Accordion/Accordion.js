define([
        'jquery',
        'jquery-ui',
        'underscore',
        'marionette'],
function ($, useless, _, Marionette) {
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
           this.$el.parent().children("DIV").hide();
           var cid = this.cid;
           var pcid = this.$el.parent().children("DIV.ui-item-"+ this.cid);
           pcid.show();
       },
       onBeforeDestroy: function() {
		   this.$el.parent().children("DIV.ui-item-"+ this.cid).remove();
	   }
       });

    var collectionView = Marionette.CollectionView.extend({
       childView: itemView,
       onAddChild: function(h3View) {
           this.onRender(this);
       },
       onRender: function(divView) {
           var items = divView.$el.children('h3.us-inactive');
           var parent = divView.$el;

           if (items.length == 0) return;

           items.each(function(idx) {
              var item = $(items[idx]);
              var cid = item.attr("id");

               if (parent.children("DIV.ui-item-" + cid).length == 0) {
                  item.removeClass("us-inactive");
                  item.after('\
                      <div aria-hidden="false" role="tabpanel" aria-labelledby="ui-id-3" style="display: block; height: 119px;" class="ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom ui-accordion-content-active ui-item-' + cid+ '">\
                         <p></p>\
                     </div>');
              }
           });
       },
       addMenu: function(model) {
		   this.collection.add(model);
	   }
    });
    return collectionView;
});
