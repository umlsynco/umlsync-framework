define(['marionette',
        'Views/Dialogs/newDiagramDialog'
    ],
    function(Marionette, dialog) {
        var Controller = Marionette.Controller.extend({

            initialize: function (options) {
                this.dialog = new dialog(options);
                this.dialog.render();
            },
            getDialog: function(options) {
                this.dialog.dataProvider = options.dataprovider;
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


