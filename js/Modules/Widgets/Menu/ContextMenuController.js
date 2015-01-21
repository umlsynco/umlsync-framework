define(['marionette',
        'Views/framework'
    ],
    function(Marionette, Framework) {
        var Controller = Marionette.Controller.extend({
            initialize: function (options) {
				this.view = options.view;
				this.collection = options.collection;
            },
			//
			// Extend an existing menu with submenus
			//
			//
			addMenuPath: function(path, collection) {
				return this.mainMenuController.addMenuPath(path, collection);
			},
			//
			// Extend an existing menu with submenus
			//
			//
			removeMenuPath: function(path) {
				return this.mainMenuController.addMenuPath(path, collection);
			},
			//
			// Enable/disable menu by path
			//
			//
			toggleMenuPath: function(path, enable) {
				
			}
		});
		return Controller;
});
