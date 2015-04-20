// Simplest diagram collection

define(['backbone', 'underscore'], function (Backbone, _) {
    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }

    // Extend backbone model
    Backbone.DiagramModel = Backbone.Model.extend({
        initialize: function (options) {
            this.idCounter = 1; // 0 - was reserved for the icon menu
            var that = this;
            _.each(options, function(opt, key) {
                if (key[key.length -1] == 's') {
                    if (key != "multicanvas") {
                        that["getUml" + key.capitalize()] = function() {
                            return this['uml' + key];
                        }
                        that['uml' + key] = new Backbone.DiagramCollection(options[key]);
                        // TODO: sync up on change
                        // that['uml' + key].on("change", )

                        // [TODO]: Specific handler of the custom object type.
                        // May be it is better to move it in a separate handler
                        //
                        // if Backbone["Umlsync" + key + "Collection"] has collection type else USE the default collection class
                        // It should allow us to handle droppable, sub-elements etc... in a separate methods/classes
                        if (key == "elements") {
                          var hasWrongItems = false;
                          that.umlelements.each(function(model) {
                              var localId = model.get("id");
                              // if the local id was not defined for some reason
                              // then we will have some mess in the future
                              // it is better to update such elements after getting of the max counter 
                              if (!localId) {
                                hasWrongItems = true;
                              }
                              else {
                                if (that.idCounter <= localId) {
                                    that.idCounter = localId + 1; // idCounter should be bigger than max id
                                }
                              }
                          }); // each model
                          // handle items without id !!!
                          if (hasWrongItems) {
                              that.umlelements.each(function(model) {
                                  var localId = model.get("id");
                                  if (!localId) {
                                      model.set("id", that.idCounter);
                                      that.idCounter++;
                                  }
                              });
                          }
                        }
                    }
                }
            }); // each option
        }
    });

    Backbone.DiagramCollection = Backbone.Collection.extend({
        model:Backbone.DiagramModel
    });

    var Diagram = Backbone.DiagramModel.extend({
        removeElement: function() {
        },
        addElement: function() {
        },
        revertOperation: function() {
        },
        repeatOperation: function() {

        }
    });
    return Diagram;
});
