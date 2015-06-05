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
                            return that['uml' + key];
                        }
                        that['uml' + key] = new Backbone.DiagramCollection(options[key]);

                        that['uml' + key].on("update", function(context) {
							context.push({key:key, cid:that.cid});
                            that.trigger("update" , context);
                        });
                        
                        that['uml' + key].on("change", function(model, fields, something) {
							var context = new Array();
							context.push({action:"change", cid:model.cid});
                            that.trigger("update" , context);
                        });

                        that['uml' + key].on("add", function(model) {
							var context = new Array();
							 // [TODO]: Is cid enough for this action ?
							 // Use-case: some action with element change and "remove and revert" after that? 
							context.push({action:"add", cid:model.cid, key:key});
							that.trigger("update" , context);
                        });

                        that['uml' + key].on("remove", function(model) {
							var context = new Array();
							context.push({action:"remove", cid:model.cid, key:key});
                            that.trigger("update" , context);
                        });


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
                          that.umlelements.on("add", function(model) {
                              if (!model.get("id")) {
                                model.set("id", that.idCounter);
                                that.idCounter++;
                              }
                          });
                        }
                    }
                }
            }); // each option
        },
        //
        // Get JSON or SVG description
        //
        getDescription: function(indent) {
			var result = indent + "{\n";
			var that = this;

			_.each(this.attributes, function(opt, key) {
				if (key[key.length -1] == 's' && key != "multicanvas"  && key != "subdiagrams") {
					if (that["uml" + key]
					    && that["uml" + key].getDescription) {
						// Extend
					    result += indent + '"'+ key + '": ' + that["uml" + key].getDescription(indent + "    ") + ",\n";
				    }
				    else {
						alert("CCC" + key + "   LLL " + opt);
					}
				}
				else {
					result += indent + '"' + key + '":"' + opt + '",\n';
				}
			});
			result = result.substring(0, result.length-2) + '\n'; // remove ",\n" for the last items
			result += indent + "}\n";
			return result;
		}
    });

    Backbone.DiagramCollection = Backbone.Collection.extend({
        model:Backbone.DiagramModel,
        getDescription: function(indent) {
			var result = indent + "[";
			this.each(function(model, index, ctx) {
				if (model.getDescription)
				    result += indent + model.getDescription(indent + "    ") + (index != ctx.length-1 ? ",\n" : "\n");
			});
			result += indent + "]\n";
			return result;
		}
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
