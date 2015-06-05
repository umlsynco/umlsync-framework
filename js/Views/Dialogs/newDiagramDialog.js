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
                abspath: "input[type=text]"
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
				var active = this.contentTypeList.collection.where({isActive:true})
				if (active.length > 0)
				  this.trigger("dialog:done", active[0]);
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
                this.contentAbsPath = this.ui.abspath.val();
                var status = this.dataProvider.getPathStatus(this.contentAbsPath, _.bind(this.onPathChanged, this));

                this.ui.createButton.prop('disabled', true);
                if (status == "invalid") {
                    this.ui.statusLine.value("Invalid path: " + this.contentAbsPath);
                }
                else if (status == "error") {
                    this.ui.statusLine.value("Network error while loading path: " + this.contentAbsPath);
                }
                else if (status == "file") {
                    this.ui.statusLine.value("File already exist: " + this.contentAbsPath);
                }
                if (status == "loading") {
                    this.ui.statusLine.value("Loading: " + this.contentAbsPath);
                }
                else if (status == "valid" ){
                    this.ui.statusLine.value("");
                    this.autocompletionList = this.dataProvider.getPathAutocompletion(this.contentAbsPath);
                    this.ui.createButton.prop('disabled', false);
                }
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
