define([
        'jquery',
        'marionette'
        ],
    function ($, Marionette) {
		// Content menu item
		// <li id="0" class="diagram-selector" style="cursor:pointer;list-style-image:url('././dm/icons/us/dss/classDiagram.png');"><a>UML class diagram</a></li>
		var contentView =    Marionette.ItemView.extend({
	        tagName: 'li',
	        className: 'diagram-selector',
	        template: _.template("<span style=\"cursor:pointer;list-style-image:url('<%= icon %>');\"><a><%= title %></a>"),
	        events: {
				'click': function() {
					// Change an active element !!!
					this.model.set("isActive", true);
				}
			},
			modelEvents: {
				'change:isActive': 'toggleSelectedClass'
			},
			toggleSelectedClass: function (isActive) {
				if (this.model.get("isActive")) {
					this.$el.addClass("selected");
				}
				else {
					this.$el.removeClass("selected");
				}
			},
			initialize: function() {
		    }
        });
        // Content menu list
        var contentMenu = Marionette.CollectionView.extend({
					             tagName: 'ul',
                                 childView: contentView,
                                 onRender: function() {
									 // TODO: drop it!!!
									 this.$el.attr("id", "diagram-menu");
								 },
   							     initialize: function() {
									 this.collection.on(
									   "change:isActive",
									   function(model) {
										   // Prevent loop
										   if (!model.get("isActive")) return;

								           var activeItems = this.where({isActive:true});
  								           for (var i in activeItems) {
											if (activeItems[i] != model)
   									          activeItems[i].set({isActive:false});
								           }
							          });
							     }
                          });

        // Content select dialog
        var DialogView = Marionette.LayoutView.extend({
            template: "#umlsync-new-diagram-dialog-template",
            modal:true,
            ui: {
                createButton: "button.ui-button-create",
                cancelButton: "button.ui-button-cancel",
                closeButton: "span.ui-icon-closethick",
                checkbox: "input[type=checkbox]",
                abspath: "input[type=text]",
				statusLine: "label#us-status-line",
				datalist: "datalist#umlsync-path-datalist"
            },
            events: {
				'click @ui.closeButton' : 'onCancel',
				'click @ui.cancelButton' : 'onCancel',
				'click @ui.createButton' : 'onCreateButtonClick',
                'change @ui.checkbox': 'onNameChecked',
                'keyup @ui.abspath': 'onPathChanged'
			},
			regions: {
				ContentList : "#selectable-list"
			},
			initialize: function(options) {
				// Prevent multiple render
				this.isSingletone = true;
				this.cachedPaths = {};

                // Github tree for example
                this.dataProvider = options.dataprovider;

				// Download the content list
				var that = this;
				this.contentTypeList = new contentMenu({collection: new Backbone.Collection()});
				$.ajax({
					url: "./assets/menu/main.json",
					dataType: 'json',
					success: function(data) {
						that.contentTypeList.collection.add(data);
					},
					error: function() {
						alert("TODO: HANDLE CONTENT MENUS LIST DOWNLOAD FAILED !!!");
					}
				});
				//var collection = this.collection;
				//this.collection.on("change:isActive", function(model) {
                //   // collection.each(
				//});
			},
			onCreateButtonClick: function(button) {
				// handle dialog completion
				var active = this.contentTypeList.collection.where({isActive:true});
				if (active.length > 0) {
                    if (this.ui.checkbox.is(":checked")) {
                        // create content first and then close the dialog
                        var that = this,
							absPath = this.ui.abspath.val();
                        this.dataProvider.createContent(absPath, active[0], this.cachedPaths[absPath.substring(0, absPath.lastIndexOf("/")+1)], function () {
                            var result = $.extend({}, active[0], {absPath:absPath});
                            that.trigger("dialog:done", result);
                        });
                    }
                    else {
                        // Create a new doc without tree path and corresponding storage in the tree
                        this.trigger("dialog:done", active[0]);
                    }

                }
			},
			onCancel: function() {
				// Trigger cancel event
				this.trigger("dialog:cancel");
		    },
		    onInputChange: function() {
				// Validate path
				alert("input changed !!!");
			},
			onTypeChange: function() {
				// Check switch between types
				alert("ON type changed !!!");
			},
			onContentTypeSelected: function(model) {
				// switch the content model type
				// 1. Diagram type
				// 2. Markdown
				// 3. Snippet bubbles
			},
            onPathChanged: function() {
				var value = this.ui.abspath.val(); // get an updated value
				var abspath = value.substring(0, value.lastIndexOf("/")+1); // abspath value
				// prevent multiple requests of the same path
				if (this.contentAbsPath == abspath) {
					// TODO: Check that file is not empty and doesn't exist
					return;
				}
				this.contentAbsPath = abspath;
				if (this.cachedPaths[this.contentAbsPath]) {
					//  Update auto completion options
					return;
				}

				this.dataProvider.getPathStatus(this.contentAbsPath, _.bind(this._onPathChanged, this));
			},
			//
			// Callback method:
			// @param data {
			//    "path": "%path which is loading%",
			//    "status" : "error|ok|invalid|loading",
			//    "loadedPath" : "path which is corresponding to status report",
			//    "reason" : "The cause of error"
			//    }
			// @param subpaths - subpaths in case of status == "ok"
			//
			_onPathChanged: function(data, subpaths, files) {
				var uiStatus = true; // ui button status
                var value = this.ui.abspath.val(); // get an updated value
                var abspath = value.substring(0, value.lastIndexOf("/")+1); // abspath value

				this.lastStatus = undefined;
				// keep the current status to cache in case of path change:
				this.cachedPaths[data.path] = data;

                if (this.contentAbsPath != data.path) {
					// update status of an abandoned path
					return;
				}

                this.lastStatus = data.status;

                if (data.status == "invalid") {
                    this.ui.statusLine.text("Invalid path: " + this.contentAbsPath);
                }
                else if (data.status == "error") {
                    this.ui.statusLine.text("Network error while loading path: " + this.contentAbsPath);
                }
                else if (data.status == "file") {
                    this.ui.statusLine.text("File already exist: " + this.contentAbsPath);
                }
                if (data.status == "loading") {
                    this.ui.statusLine.text("Loading: " + this.contentAbsPath);
                }
                else if (data.status == "valid" ){
					uiStatus = false;

                    this.ui.statusLine.text("ok");
                    this.autocompletionList = subpaths;
					this.files = files;

                    // remove the previous values
                    this.ui.datalist.empty();
                    // add a new one
					var that = this;
					_.each(this.autocompletionList, function(txt) {
						that.ui.datalist.append("<option value='" + that.contentAbsPath  + txt + "'>");
					});
                }
				this.ui.createButton.prop('disabled', uiStatus);
            },
            onNameChecked: function(event) {
                this.isNameEnabled = this.ui.checkbox.is(":checked");
                this.ui.abspath.prop("disabled", this.isNameEnabled);
            },
            onShow: function() {
              $(this.$el).draggable({cancel:".ui-not-draggable"}).resizable();
              $(this.$el).parent().css('visibility', 'visible');
			},
			onRender: function() {
			  if (this.ContentList)
			      this.ContentList.show(this.contentTypeList);
			}
        });

        return DialogView;
    });
