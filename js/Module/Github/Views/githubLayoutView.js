define(['jquery',
        'marionette',
        'github',
        'Collections/toolboxIconsCollection',
        'Views/Controls/toolboxView',
        'Views/framework',
        'Views/Controls/treeView',
        '../Collections/contentCacheCollection',
        'Views/Menus/dropDownMenu',
        'Module/Github/backend'
    ],
    function ($, Marionette, Github, ToolboxCollection, ToolboxView, Framework, TreeView, CacheCollection, DropdownView, GHB) {
        var githubLayout = Marionette.LayoutView.extend({
            template: "#github-content-layout",
            regions: {
                repository: "#us-viewmanager", // Repository selection region
                branch: "#us-branch", // branch selection region
                toolbox: "#us-toolbox", // Toolbox region
                reposelect: "#us-repo-select", // Repo select drop down menu
                tree: "#us-treetabs" // Tree region
            },
            initialize: function () {
                this.ToolboxCollection = new ToolboxCollection();
                this.ToolboxCollection.add([
                    {   name: 'github-new',
                        title: 'New content',
                        icon: 'images/newdoc.png',
                        cssClass: 'left'},
                    {   name: 'github-revertdoc',
                        title: 'Revert changes',
                        icon: 'images/revertdoc.png',
                        cssClass: 'left'},
                    {   name: 'github-removedoc',
                        title: 'Remove content',
                        icon: 'images/removedoc.png',
                        cssClass: 'left'},
                    {   name: 'github-commit',
                        title: 'Commit changes',
                        icon: 'images/commit.png',
                        cssClass: 'right'},
                    {   name: 'github-reload',
                        title: 'Reload tree',
                        icon: 'images/reload.png',
                        cssClass: 'right'}
                ]);
            },
            // Layered view was rendered
            onRender: function (options) {
                var that = this;

                // Initialize toolbox view
                this.ToolboxView = new ToolboxView({
                    childViewEventPrefix: 'github',
                    collection: this.ToolboxCollection
                });

                this.ToolboxView.on("github:toolbox:click", function () {
                    Framework.vent.trigger('content:syncall', {view:'github', branch: 'master'});
                });

                this.toolbox.show(this.ToolboxView);

                this.activateTree({repo: "umlsynco/diagrams", branch: "master"});
                this.activateContentCache({cacheLimit: 20});


                var modelsc = new  (Backbone.Collection.extend({
                        setGroupFilter: function(filter) {
                            _.each(this.models, function(model){
                               var visibility = true;
                               if (model.get("group") != filter) {
                                   visibility = "none";
                               }
                               model.set("visibility", visibility);
                            });
                        }
                    }))(
                        [{title:"umlsynco/diagrams", group: "Owner"},
                         {title:"umlsynco/umlsync", group: "Owner"},
                         {title:"Starred/diagrams", group: "Starred"},
                         {title:"Starred/umlsync", group: "Starred"},
                         {title:"Forked/umlsync", group: "Forked"},
                         {title:"Forked/diagrams", group: "Forked"}
                        ]),
                    groups = [{title:"Owner", isDefault:true}, {title:"Starred"}, {title:"Forked"}];
                var repoView = new (DropdownView.extend({
                             groups:groups,
                             title:"Repository",
                             uid: "repo"
                }))({collection:modelsc});

                this.reposelect.show(repoView);
                //this.reposelect.show(this.branchView);
            },

            resize: function(event, width, height) {
                var res;
                if (this.toolbox.currentView) {
                    res = this.toolbox.currentView.resize(event, width, height);
                }

                if (this.tree.currentView) {
                    this.tree.currentView.resize(event, width, height - res.height);
                }
            },

            // There is no reason to create tree model and view
            // without repo/branch selection
            activateTree: function (treeOptions) {

                this.TreeModel = Framework.Backend.Github.GetTreeCollection(treeOptions);
                this.TreeModel.fetch();
                this.TreeModel.on("remove", function () {
                    // Handle remove item use-case
                });

                this.TreeView = new TreeView({collection: this.TreeModel});
                this.tree.show(this.TreeView);

                var that = this;
                this.TreeView.on("file:focus", function (data) {
                    that.contentInFocus(data);
                });
            },

            activateContentCache: function(options) {
                var that = this;
                this.contentCache = new CacheCollection();

                Framework.vent.on("github:file:load", function(data) {
                    that.loadContent(data);
                });
				Framework.vent.on("github:file:save", function(data) {
				  that.saveContent(data);
				});
            },
            //
            // Send event to mediator to ask if we could open this content
            //
            contentInFocus: function (data) {
                var clone = $.extend({}, data, {
                    isOwner: true, // Indicates if user could modify this file
                    repo: 'umlsynco/diagrams',
                    branch: 'master', // Branch name
                    view: 'github' // view identifier - GitHub or something else
                });

                Framework.vent.trigger("content:focus", clone);
            },
            //
            // Save content
            //
            saveContent: function(data) {
                if (!data.key)
                    return;

                var model = this.contentCache.where({key:data.key});
                //
                // Expected only one instance of content
                //
                if (model.length > 1) {
                    alert("content was loaded twice !");
                }
                //
                // if content was cached
                //
                else if (model.length == 1) {
				  // Saved content
				  model[0].set("modifiedContent", data.modifiedContent);
				}
				else {
				  alert("model was not found in cache");
				}
			},
            //
            // Respond from mediator to load content
            //
            loadContent: function(data) {
                if (!data.key)
                    return;

                var model = this.contentCache.where({key:data.key});
                //
                // Expected only one instance of content
                //
                if (model.length > 1) {
                    alert("content was loaded twice !");
                }
                //
                // if content was cached
                //
                else if (model.length == 1) {
                    Framework.vent.trigger("content:loaded", _.clone(model[0].attributes) );
                }
                //
                // get content from github
                //
                else {
                    this.contentCache.fetch({
                        add: true,
                        remove:false,
                        merge: false,
                        data: data
                    });

                    // trigger loaded
                    this.contentCache.on("add", function(model) {
                        Framework.vent.trigger("content:loaded", _.clone(model.attributes));
                    });

                    // trigger failed to load
                    this.contentCache.on("error", function(model) {
                        Framework.vent.trigger("content:loaded", _.clone(model.attributes));
                    });
                }
            }
        });

        Framework.addInitializer(function (options) {
            this.registerDataProvider('GitHub', githubLayout);
        });

        return githubLayout;
    });

