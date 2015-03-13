define(['marionette',
        'Views/framework'
    ],
    function(Marionette, Framework) {
        var Controller = Marionette.Controller.extend({
            initialize: function (options) {
                var that = this;
                // Listeners of content manager
                Framework.vent.on("content:search:path", function (data) {
                });
                
                Framework.vent.trigger('content:new:dialog', {title:"xxxx"});
            },
            onBeforeDestroy: function() {
                Framework.vent.off("content:search:path");
            }

        });
        return Controller;
    }
);
