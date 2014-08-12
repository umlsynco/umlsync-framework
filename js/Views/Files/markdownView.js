define(
    ['backbone',
        'showdown',
		'fieldselection',
        'Views/framework',
        'Models/contentModel'],
    function (Backbone, $Showdown, fs, Framework, ContentModel) {

        var converter = new Showdown.converter(); //{ extensions: ['umlsync'] }

        var view = Backbone.Marionette.ItemView.extend({
		    ui:  {
			  'editButton' : "#us-diagram-edit",
			  'textarea' : 'textarea#markdown',
			  'markdownIcon': 'span.us-toolbox-header ul li.us-toolbox-button a'
			},
			events: {
			  'click @ui.editButton': 'toggleEditMode',
			  'keyup @ui.textarea' : 'changedContent',
			  'paste @ui.textarea' : 'changedContent',
			  'click @ui.markdownIcon' : 'iconClick'
			},
			// Subscribe on model change
			// and re-render model
			initialize: function () {
				this.model.on('change:status', this.render);
			},
			
			changedContent: function() {
			  var text = this.ui.textarea.val();

			  this.model.set("modifiedContent", text);

			  if (this.model.get("content") != text) {
			    this.model.set('isModified', true);
			  }
			  else {
			    this.model.set('isModified', false);
			  }
			},
			
			toggleEditMode: function() {
			    var text = this.ui.editButton.text();
				if (text == 'Edit') {
				  this.model.set("status", "edit");
				  return;
				}
				if (this.model.get("isModified")) {
				  this.model.set("modifiedContent", this.ui.textarea.val());
				}
				this.model.set("status", "view");
			},
			
			iconClick : function(e) {
			  e.preventDefault();

              var prefix = $(e.currentTarget).attr("prefix") || "",
              postfix = $(e.currentTarget).attr("postfix") || "";

			  if (prefix == "diagram") {
                prefix = '![mime-type:application/vnd.umlsync.json] (http://umlsync.org/github/%repo%/%branch%/%path% "';
                postfix = '")';
				alert("TODO: ADD REQUEST of CACHED DIAGRAM PATH");
			  }
			  
			  this.ui.textarea.wrapSelection(prefix, postfix);
				
			},

            getTemplate: function () {
                var status = this.model.get("status");
                // use the default templates for loading and load failed use-cases
                if (status == 'loading') {
                    return "#umlsync-content-loading-template";
                } else if (status == 'error') {
                    return "#umlsync-content-failed-template";
                }

                // Check if content is in edit mode
                if (status == "edit") {
                    return "#umlsync-markdown-edit-template";
                } else {
                    return "#umlsync-markdown-view-template";
                }
            },
			templateHelpers : {
			  showContent: function() {
			        return contentData = this.modifiedContent || this.content;
			  },
			  showMarkdownViewContent: function() {
			        var contentData = this.modifiedContent || this.content || 'Goodby word !';
			        return converter.makeHtml(contentData);
			  }
			},
            render1: function () {
                var title = this.model.get('title');
                var parentSelector = this.model.get('parentSelector');
                var status = this.model.get("status");

                // Destroy the previous value
				$(parentSelector).empty();

				// trigger before render
			    this.triggerMethod('before:render', this);

				if (status == "loading") {
					$('<img id="puh" src="images/Puh.gif"/>').appendTo(parentSelector);
				}
				else if (status == "loaded") {
					
					$(parentSelector).append('');
				}
				else if (status == "error") {
					var data = this.serializeData();
					data = this.mixinTemplateHelpers(data);

					var template = "#umlsync-content-failed-template";
					var html = Marionette.Renderer.render(template, data);
					this.attachElContent(html);
				}

			    this.bindUIElements();
				// trigger render complete
                this.triggerMethod('render', this);
            }
        });

        Framework.registerContentTypeView({type: 'markdown', classPrototype: view, extensions: "MD"});

        return view;
    });

