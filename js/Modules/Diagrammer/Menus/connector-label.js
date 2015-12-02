define(['marionette'],
  function(Marionette) {
    var Framework;
    var Controller = Marionette.Controller.extend({
        initialize: function (options) {
            Framework = options.Framework;
            if (Framework) {
                Framework.vent.on("diagram:connector-label:edit", _.bind(this.onEdit, this));
                Framework.vent.on("diagram:connector-label:remove", _.bind(this.onRemove, this));
            }
        },
        onRemove: function(data) {
            if (data.context.view && data.context.diagram) {
               data.context.diagram.removeElement(data.context.view, true);
            }
        },
        onEdit: function(data) {
			if (data.context && data.context.view) {
				data.context.view.$el.children(".editablefield").trigger("click");
			}
        }
        });

        return Controller;
  }
);
