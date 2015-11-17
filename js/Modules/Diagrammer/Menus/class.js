define(['marionette'],
    function(Marionette) {
        var Framework;
        var Controller = Marionette.Controller.extend({
            initialize: function (options) {
                Framework = options.Framework;
                if (Framework) {
                    Framework.vent.on("diagram:class:addfield", _.bind(this.addfield, this));
                    Framework.vent.on("diagram:class:addmethod", _.bind(this.addmethod, this));
                    Framework.vent.on("diagram:common:remove", _.bind(this.onRemove, this));
                    
				}
            },
            onRemove: function(data) {
				if (data.context.view && data.context.diagram) {
					// Remove element via diagram's method
					// It should support operation manager (Ctrl-Z/Y)
					data.context.diagram.removeElement(data.context.view);
				}
			},
            addfield: function(data) {
				var model = data.context.view.model;
				if (model && model.getUmlAttributes) {
				   var attrs = model.getUmlAttributes();
				   attrs.add({name:"new field"});
			    }
			},
			addmethod: function(data) {
				var model = data.context.view.model;
				if (model && model.getUmlOperations) {
				   var ops = model.getUmlOperations();
				   ops.add({name:"newMethod()"});
			    }
			}
        });

        return Controller;
    }
);
