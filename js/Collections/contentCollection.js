define([ 'backbone', 'Views/framework', 'Models/contentModel'], function(Backbone, Framework, ContentModel) {
    var ContentCollection = Backbone.Collection.extend({
      model: ContentModel,
      triggerTabShow: function(id) {
          var activeItems = this.where({isActive:true});
          for (var i in activeItems) {
              activeItems[i].set({isActive:false});
          }
          var modelItem  = this.get(id);
          if (modelItem)
            modelItem.set({isActive:true});
      }
    });
    return ContentCollection;
});