define(['marionette'],
  function(Marionette) {
    var Framework;
    var Controller = Marionette.Controller.extend({
        initialize: function (options) {
            Framework = options.Framework;
            if (Framework) {
                Framework.vent.on("diagram:connector:addlabel", _.bind(this.addLabel, this));
                Framework.vent.on("diagram:connector:remove", _.bind(this.onRemove, this));
            }
        },
        onRemove: function(data) {
            if (data.context.view && data.context.diagram) {
                // Remove element via diagram's method
                // It should support operation manager (Ctrl-Z/Y)
               data.context.diagram.removeElement(data.context.view, true);
            }
        },
        addLabel: function(data) {
            var model = data.context.view.model;
            var event = data.coordinates;
            if (model && model.getUmlLabels) {
                var ls = model.getUmlLabels();
                ls.add({name:"new text", x: event.x, y:event.y});
            }
        }
        });

        return Controller;
  }
);
