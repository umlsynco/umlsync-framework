define(['marionette',
        'Views/Dialogs/diagramMenuDialog'
    ],
    function(Marionette, dialog) {
        var Controller = Marionette.Controller.extend({

            initialize: function (options) {
                this.dialog = new dialog({});
                var that = this;
                this.dialog.on("add:accordion", function(somthing) {
					that.trigger("add:accordion", somthing);					
				});
            },
            getDialog: function() {
				return this.dialog;
			},
			show: function() {
			    $(this.dialog.$el).show();
			},
			hide: function() {
				//$(this.dialog.$el).hide();
			}
        });

        return Controller;
    }
);


