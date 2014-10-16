// Simplest diagram collection

define(['backbone', 'underscore'], function (Backbone, _) {
    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    }

    // Extend backbone model
    Backbone.DiagramModel = Backbone.Model.extend({
        initialize: function (options) {
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
                    }
                }
            });
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
