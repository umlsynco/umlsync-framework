define(['marionette',
        'Views/framework'
    ],
    function(Marionette, Framework) {
        var Controller = Marionette.Controller.extend({
            initialize: function (options) {

            },
            // Main menu API
            ////////////////////////////////////////////////////////////
            //
            // Create main menu collection view
            // @return mainMenuCollectionView element
            //
            createMainMenu: function(options, collection) {
				// 1. Create main menu collection view
				// 2. provide it to the controller
				
				this.mainMenuCollectionView = new MainMenuCollectionView(collection);
				this.mainMenuController = new MainMenuController($.extend({}, options, {collection: collection, view: this.mainMenuCollectionView});
				
				return this.mainMenuCollectionView;
			},
			//
			// Get the main menu controller
			// @return the main menu controlle
			//
			getMainMenuController: function() {
				return this.mainMenuController;
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
				return this.mainMenuController.removeMenuPath(path);
			},

            // Context menu API
            ////////////////////////////////////////////////////////////
            //
            // Create and register the context menu
            //
            createContextMenu: function(uniqueName, options, collection) {
				// 1. if (uniqueName doesn't exist
				// 2. 
			},
			//
			// Get context menu controller by name
			//
			getContextMenuController(uniqueName) {
			},
			
			//
			// Remove the context menu
			//
			removeContextMenu: function(uniqueName) {
			}
        });
        return Controller;
    }
);

