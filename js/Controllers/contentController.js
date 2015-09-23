define(['marionette',
        'Views/Files/contentTabbedView',
        'Views/Tree/dataProviderSwitcherView',
        'Collections/contentCollection',
        'Views/framework',
        'Controllers/router',
	'Controllers/snippetsController'],
    function(Marionette, CollectionView, DataProviderView, ContentCollection, Framework, FrameworkRouter, SnippetsController) {
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
					
					this.vent.on('content:before:close', function(options) {
						controller.onContentBeforeClose(options);
					});

					this.vent.on('content:close', function(options) {
					  controller.onContentClose(options);
					});

					this.vent.on('content:save', function(options) {
					  controller.onContentSave(options);
					});

					this.vent.on('content:syncall', function(options) {
					  controller.onContentSyncAll(options);
					});

                    // Attach an existing view, because it has own div#tabs
                    this.RightRegion.attachView(this.ContentView);

                    // The data provider selection is on the left region
                    this.DataProviderSwitcher = new DataProviderView();
                    this.LeftRegion.show(this.DataProviderSwitcher);

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
				// key is content model cid which is unique for all system
                var models = Framework.ContentCollection.where({key:data.key});

                // Unexpected us-case
                if (models.length == 0) {
                    alert("Probably content tab was closed before load completed! : key = " + data.key);
                }
                else if (models.length > 1) {
                    alert("Found more than 1 content with key: " + data.key);
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
				   // Extract the cotent type if not available
				   if (!data.contentType) {
                     var ext = data.title.split('.').pop().toUpperCase();
                     data.contentType = Framework.getContentType(ext);
				   }

                   // Add data if we know how to handle it only
                   if (data.contentType) {
                       data.status = data.content ? 'loaded' : 'loading'; // Do nothing if content was loaded before !!!


					   if (data.contentType != "snippets") {
						   // Add file to collection with "loading" status
						   // as a result loading view will be added to the
						   // area
						   Framework.ContentCollection.add(data);

						   // Trigger file load from data provider
						   Framework.vent.trigger(data.view + ":file:load", data);
					   }
					   else {
						   if (!this.snippetsController) {
							   this.snippetsController = new SnippetsController({region: Framework.DialogRegion, contentController:this});
						   }
						   this.snippetsController.request(data);
					   }
                   }
			   }
			},
			//
			// content:before:close 
			//
			onContentBeforeClose: function(options) {
			  if (options.model.get("isModified")) {

                  if (!options.model.get("absPath")) {
                      require(['Views/Dialogs/saveAsDialog'], function(saveAsDialog) {
                          var dialog = saveAsDialog.extend({
                              onButtonYes: function () {
                                  // Get path and save it !!!
                                  Framework.vent.trigger('content:save', options);

                                  if (options.action == "close")
                                      Framework.vent.trigger('content:close', this.model);
                              },
                              onButtonNo: function() {
                                  if (options.action == "close")
                                      Framework.vent.trigger('content:close', this.model);
                              },
                              onButtonCancel: function() {

                              }
                          });
                          Framework.DialogRegion.show(new dialog({model:options.model}))
                      });
                      return;
                  }

				require(['Views/Dialogs/saveOnCloseDialog'], function(saveOnCloseDialog) {
				  var dialog = saveOnCloseDialog.extend({
					onButtonYes: function() {
					  Framework.vent.trigger('content:save', options);

					  if (options.action == "close")
						Framework.vent.trigger('content:close', this.model);
			  		  if (options.search) {
					    Framework.vent.trigger('content:syncall', options.search);
					  }
					},
					onButtonNo: function() {
					  if (options.action == "close")
						Framework.vent.trigger('content:close', this.model);

  					  this.model.set({isProcessed: true});

					  if (options.search) {
					    Framework.vent.trigger('content:syncall', options.search);
					  }
					},
					onButtonCancel: function() {
                        if (options.search) {
                            Framework.vent.trigger('content:syncall:cancel', options.search);
                        }
					}
				  });
				  Framework.DialogRegion.show(new dialog({model:options.model}));
				});
			  }
			  else {
				if (options.action == "close")
				  Framework.vent.trigger('content:close', options.model);

			    if (options.search) {
				  Framework.vent.trigger('content:syncall', options.search);
			    }
			  }
			},

            // Close content			
			onContentClose: function(model) {
			  Framework.ContentCollection.remove(model);
		      // TODO: trigger to the content cache to resume reference count
			},
			
            // Close content			
			onContentSave: function(options) {
			  if (options.model.get("isModified")) {
			    var mc = options.model.get("modifiedContent")
			    Framework.vent.trigger(options.model.get("view") + ":file:save", $.extend({},options.model.attributes, {modifiedContent: mc}));
				if (options.action != "close") {
					// change modified staus
					options.model.set("isModified", false);
					// update the content data
					options.model.set("content", mc);
					// update modified content data
					options.model.set("modifiedContent", null);
				}
			  }
			},
			//
			// Content sync all before repo change or commit
			//
			onContentSyncAll: function(options) {
			  // clone options on first eneter
			  var searchOptions = options.isModified ? options : $.extend({}, options, {isModified: true, isProcessed: false});
			  var models = Framework.ContentCollection.where(searchOptions);
			  if (models.length > 0) {
			    Framework.vent.trigger("content:before:close", {search: searchOptions, model: models[0]});
			  }
			  else {
			    // reset flag
				_.each(Framework.ContentCollection.where({isProcessed:true}), function(model) {
				  model.set({isProcessed:false});
				});
				Framework.vent.trigger('content:syncall:complete', searchOptions);			  
			  }
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
			},

			setSnippetsMode: function(flag) {
				Framework.ContentCollection.each(function(model) {
					if (flag) {
						model.set({mode: "snippets"});
					}else {
						model.set({mode: "view"});
					}
				});
			}
        };// controller

        FrameworkRouter.processAppRoutes(ContentController, {'/':'initializeFramework'});

        return ContentController.initializeFramework();
    });

