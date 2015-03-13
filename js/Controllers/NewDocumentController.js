define(['marionette',
        'Views/Dialogs/newDiagramDialog'
    ],
    function(Marionette, dialog) {
        var Controller = Marionette.Controller.extend({

            initialize: function (options) {
                this.dialog = new dialog({});
                this.dialog.render();
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


