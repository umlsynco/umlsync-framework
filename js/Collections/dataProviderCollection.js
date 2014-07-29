define([ 'backbone', 'Views/framework', 'Models/dataProviderDescription'],
    function(Backbone, Framework, DataProviderDescription) {
      var DataProviderCollection = Backbone.Collection.extend({
          model: DataProviderDescription
      });
      return DataProviderCollection;
    });
