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

                    this.vent.on('content:focus', function(data) {
                        controller.focusContent(data);
                    });

                    this.vent.on('content:loaded', function(data) {
                        controller.loadedContent(data);
                    });
					
					this.vent.on('content:before:close', function(model) {
					  if (model.get("isModified")) {
					    Framework.vent.trigger('content:save', model);
					  }
					  else {
					    Framework.vent.trigger('content:close', model);
					  }
					});

					this.vent.on('content:save', function(model) {
					  if (model.get("isModified")) {
					    require(['Views/Dialogs/saveOnCloseDialog'], function(saveOnCloseDialog) {
						  var dialog = new saveOnCloseDialog({model:model});
						  Framework.DialogRegion.show(dialog);
						});
					  }
					});

					this.vent.on('content:close', function(model) {
					  Framework.ContentCollection.remove(model);
					  // TODO: trigger to the content cache to resume reference count
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


            // content:loaded
            loadedContent: function(data) {
                var models = Framework.ContentCollection.where({key:data.key});

                // Unexpected us-case
                if (models.length != 1) {
                    alert("Probably content tab was closed before load completed!");
                }
                // Activate tab if it was loaded before
                else {
                    data.status = 'loaded'; // Open data view
                    data.isActive = true;  // Activate tab if it was changed after load
                    models[0].set(data); // Update data
                }
            },
			// content:focus
            focusContent: function(data) {
			   var models = Framework.ContentCollection.where(data);

               // Unexpected us-case
			   if (models.length > 1) {
			     alert("Multiple instances of content was opened somehow!");
			   }
               // Activate tab if it was loaded before
			   else if (models.length == 1) {
			     models[0].set("isActive", true); // Or trigger click ???
			   }
			   else {
                   var ext = data.title.split('.').pop().toUpperCase();
                   data.contentType = Framework.getContentType(ext);

                   // Add data if we know how to handle it only
                   if (data.contentType) {
                       data.status = 'loading';
                       // Add file to collection with "loading" status
                       // as a result loading view will be added to the
                       // area
                       Framework.ContentCollection.add(data);

                       // Trigger file load from data provider
                       Framework.vent.trigger(data.view + ":file:load", data);
                   }
			   }
			   // 1. Check if data was loaded yet
			   // 2.1
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

