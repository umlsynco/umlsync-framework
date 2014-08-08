define(
    ['backbone',
        'showdown',
        'Views/framework',
        'Models/contentModel'],
    function (Backbone, $Showdown, Framework, ContentModel) {

        var converter = new Showdown.converter(); //{ extensions: ['umlsync'] }

        var view = Backbone.Marionette.ItemView.extend({
			// Subscribe on model change
			// and re-render model
			initialize: function () {
				this.model.on('change:status', this.render);
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
                var mode = this.model.get("mode");
                if (mode == "edit") {
                    return "#umlsync-markdown-view-template";
                } else {
                    return "#umlsync-markdown-view-template";
                }
            },
			templateHelpers : {
			  showMarkdownViewContent: function() {
			        var contentData = this.content || 'Goodby word !';
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
