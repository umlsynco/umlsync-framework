define(['marionette',
        'Views/framework'
    ],
    function(Marionette, Framework) {
        var ApplicationManager = Marionette.Controller.extend({
            initialize: function (options) {
				var manager = this;
				this.diagram = options.diagram; // Reference on diagram
				this.diagram.on("change", function() {
					manager.onChange(arguments);
				});

				// Operation manager specific

				// Cached removed models
				this.removedElements = new Array();
				this.removedConnectors = new Array();

				// Stack of operations
				this.oprationsStack = new Array();
				// Current position in stack
				this.position = 0;
            },
            onChange: function(data) {
				this.trigger("modified", true);
			},
			// Ctrl-Z
			undo: function() {
			},
			// Ctrl-Y
			redo: function() {
			}
        });
        return ApplicationManager;
    }
);




