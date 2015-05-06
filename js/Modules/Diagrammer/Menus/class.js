define(['marionette'],
    function(Marionette) {
        var Framework;
        var Controller = Marionette.Controller.extend({
            initialize: function (options) {
                Framework = options.Framework;
                if (Framework) {
                    Framework.vent.on("diagram:class:addfield", _.bind(this.addfield, this));
                    Framework.vent.on("diagram:class:addmethod", _.bind(this.addmethod, this));
				}
            },
            addfield: function(data) {
				var model = data.context.view.model;
				if (model && model.getAttributes) {
				   var attrs = model.getAttributes();
				   attrs.add({name:"new field"});
			    }
			},
			addmethod: function(data) {
				var model = data.context.view.model;
				if (model && model.getOperations) {
				   var ops = model.getOperations();
				   ops.add({name:"newMethod()"});
			    }
			}
        });

        return Controller;
    }
);
