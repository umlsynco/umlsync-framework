define(['marionette',
        'Views/Files/contentTabbedView',
        'Views/Tree/dataProviderSwitcherView',
        'Collections/contentCollection',
        'Views/framework',
        'Controllers/router'],
    function(Marionette, CollectionView, DataProviderView, ContentCollection, Framework, FrameworkRouter) {
        var ContentController = {
            'initializeFramework': function () {
			    var controller = this;
                Framework.addInitializer(function (options) {
                    this.ContentCollection = new ContentCollection();
                    this.ContentView = new CollectionView({
                        el : $("#tabs"),
                        collection: this.ContentCollection
                    });
				
 				    this.vent.on('content:open', function(data) {
				        controller.openContent(data);
				    });

                    // Attach an existing view, because it has own div#tabs
                    this.RightRegion.attachView(this.ContentView);

                    // The data provider selection is on the left region
                    this.DataProviderSwitcher = new DataProviderView();
                    this.LeftRegion.show(this.DataProviderSwitcher);

                    this.DataProviderSwitcher.on("toolbox:click", function() {alert("clicled")});

                    this.DataProviderSwitcher.on("switcher:toolbox:click", function() {alert("clicled")});

                    this.vent.on('app:resize', function(e,u) {
                        controller.handleWidowResize(e,u);
                    });
					// trigger resize on first load
					controller.handleWidowResize(null);
                });
            },

            handleWidowResize: function(e, u) {
                var height = $(window).height();
                var width = $(window).width();
                //$("#body").width(width).height(height);

                $("#content-header").width(width);
                // Resize header and bottom first
                var head = Framework.HeaderRegion.resize(e, width, height);
                var bottom = Framework.BottomRegion.resize(e, width, height);

                // Re-calculate the resize line position

                // Update left and right regions
                height = height - head.height - bottom.height;
                Framework.LeftRegion.$el.height(height);
                var widthLeft = Framework.LeftRegion.$el.width();

                Framework.LeftRegion.resize(e, widthLeft, height);

                width = width - widthLeft - $("#content-left-right-resize").width() - 2;

                // Content controller resize element
                $("#content-left-right-resize").height(height);
                Framework.RightRegion.$el.height(height).width(width);
                Framework.RightRegion.resize(e, width, height);
            },

			// content:open
			openContent: function(data) {
			   var models = Framework.ContentCollection.where(data);
			   if (models.length > 1) {
			     alert("skipping multiple content opening");
			   }
			   else if (models.length == 1) {
			     models[0].set("isActive", true); // Or trigger click ???
			   }
			   else {
			     Framework.ContentCollection.add(data);
			   }
			   // 1. Check if data was loaded yet
			   // 2.1 activate tab if it was loaded before
			   // 2.2 add loading view while loading
			   // 3. trigger (github:loadcontent)
			   // 4.1 trigger content:changed
			},
			// content:revert
			revertContent: function(data) {
			  // steps on revert
			},
			// content:remove
			removeContent: function(data) {
			},
			// content:tabclose
			closeTab : function(data) {
			  // 1. check for modification
			  // 2. close dialog
			  // 3. github:save
			  // 4. github:freereference
			},
			// tree:reload
			reloadTree: function() {
			},
			// tree:commit
			commitChanges: function() {
			   // get all modified tabs for view
			   // save all dialogs
			   // commit dialog
			},
			// tree:changed
			changedBranchOrRepo: function() {
			  // Ask to save changes
			  // call -> commit changes
			  // change repo confirm github:changetree
			}
        };// controller

        FrameworkRouter.processAppRoutes(ContentController, {'/':'initializeFramework'});

        return ContentController.initializeFramework();
    });

