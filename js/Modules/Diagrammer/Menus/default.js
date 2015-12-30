define(['marionette'],
    function(Marionette) {
        var Framework;
        var Controller = Marionette.Controller.extend({
            initialize: function (options) {
                Framework = options.Framework;
                if (Framework) {
                    Framework.vent.on("diagram:common:edit", _.bind(this.onEdit, this));
                    Framework.vent.on("diagram:common:remove", _.bind(this.onRemove, this));
				}
            },
            onEdit: function(data) {
				if (data.context.element) {
					data.context.element.$el.find("#name").trigger("click");
				}
			},
            onRemove: function(data) {
				if (data.context.element && data.context.diagram) {
					data.context.diagram.removeElement(data.context.element);
				}
			},
        });

        return Controller;
    }
);
