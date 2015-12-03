define(
    ['backbone',
        'showdown-umlsync',
        'fieldselection',
        'Views/framework',
        'Models/contentModel'],
    function (Backbone, $Showdown, fs, Framework, ContentModel) {

        var converter = new Showdown.converter({ extensions: ['umlsync'] });

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
            //
            // Ctrl-Z
            //
            handleUndoOperation: function() {
                // Should be handled by default textarea component
            },

            //
            // Ctrl-Y
            //
            handleRedoOperation: function() {
                // Should be handled by default textarea component
            },
            onRender: function() {
                if (this.model.get("status") == "edit") {
                    // disable all embedded content show
                    // parentCid - as search option
                    Framework.vent.trigger("content:embedded:off", {embeddedParentCid: this.model.cid});
                    return;
                }

                var view = this;
                this.$el.find(".umlsync-embedded-diagram").each(function(index) {
                    // Showdown-umlsync extension reinterpret diagram description
                    // sequence to the hidden placeholders for the diagrams
                    //
                    // 1. Extract and check data from placeholder
                    // 2. Recalculate paths and create valid model for content collection
                    // 3. Push model to the collection
                    //    It is up to content controller how to load path
                    //    And it is up to diagram view, how to show content status
                    //    (invalid description, wrong path, load error and success)
                    var title = $(this).attr("title"),
                    path = $(this).attr("path"),
                    psel = view.model.cid + "-embedded-" + index;
                    $(this).attr({id:psel});
                    var model = view._getEmbeddedModel(view.model, title, path, "#"+psel);
                    // push model directly to collection
                    // and it works!
                    Framework.vent.trigger("content:embedded:on", model);
                });
            },
            _getEmbeddedModel: function(model, title, path, parentSelector) {
                var absPath = this._getEmbeddedContentPath(model.get("absPath"), path);
                var attr = _.pick(model.attributes, ["view", "repo", "branch", "isOwner"]);
                return $.extend({}, attr,
                  {
                    embeddedParentCid: this.model.cid,
                    absPath:absPath,
                    contentType:'diagram',
                    isActive: true,
                    isEditable:false,
                    isModified:false,
                    isEmbedded: true,
                    parentSelector:parentSelector,
                    status: 'loading',
                    title: title
                  });
            },
            //
            // Convert a relative path to the absolute path
            // ----
            //
            _getEmbeddedContentPath: function(parentAbsPath, relPath) {
                // Actually it is an absolute path
                if (relPath == undefined)
                    return "";

                if(relPath[0] == "/") {
                    return relPath;
                }
                // Load an embedded diagrams
                var count = 0,
                liof = parentAbsPath.lastIndexOf("/"), // if slash not found than it is root
                parentPath = (liof == -1) ? "/" : parentAbsPath.substring(0, liof+1);

                var full_path = parentPath + relPath;
                // Relative path doesn't contain dotted links
                if (full_path.indexOf("./") == -1) {
                    return full_path;
                }
                var sfp = full_path.split("/"),
                        valid_path_array = new Array();
                for (var t in sfp) {
                    if (sfp[t] == "." || sfp[t] == "") { // Stay on the same position
                        continue;
                    }
                    else if (sfp[t] == "..") { // Folder up
                        var isEmpty = valid_path_array.pop();
                        if (isEmpty == undefined) {
                            alert("Wrong path: " + full_path);
                        }
                    }
                    else { // next folder/item
                        valid_path_array.push(sfp[t]);
                    }
                }
                return "/" + valid_path_array.join("/");
            },
        });

        Framework.registerContentTypeView({type: 'markdown', classPrototype: view, extensions: "MD"});

        return view;
    });

