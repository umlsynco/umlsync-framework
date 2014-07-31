define(['jquery',
        'marionette',
        'github',
        'Collections/toolboxIconsCollection',
        'Module/Github/Collections/rawTree',
        'Views/Controls/toolboxView',
        'Views/framework',
        'Module/Github/Model/treeItemModel',
        'Views/Controls/treeView'
    ],
    function ($, Marionette, Github, ToolboxCollection, RawTree, ToolboxView, Framework, TreeModel, TreeView) {
        var githubLayout = Marionette.LayoutView.extend({
            template: "#github-content-layout",
            regions: {
                repository: "#us-viewmanager", // Repository selection region
                branch: "#us-branch", // branch selection region
                toolbox: "#us-toolbox", // Toolbox region
                tree: "#us-treetabs" // Tree region
            },
            initialize: function() {
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
                var toolboxView = new ToolboxView({
                    childViewEventPrefix: 'github',
                    collection: this.ToolboxCollection
                });

                toolboxView.on("github:toolbox:click", function(){
                    alert("Handle gihub toolbox item click !!!");
                });

                this.toolbox.show(toolboxView);

                this.activateTree({repo:"umlsynco/diagrams", branch:"master"});
            },

            // There is no reason to create tree model and view
            // without repo/branch selection
            activateTree: function(treeOptions) {
                var extendedTreeCollection = TreeModel.extend(treeOptions);
                var ert = RawTree.extend(treeOptions);

                this.TreeModel = new ert({
                    model: extendedTreeCollection
                });

                this.TreeModel.fetch();
                this.TreeModel.on("remove", function() {

                });

                this.TreeView = new TreeView({collection: this.TreeModel});
                this.tree.show(this.TreeView);

                var that = this;
                this.TreeView.on("file:open", function(data){
                    that.openContent(data);
                });
            },
            openContent: function(data) {
                //var model = this.TreeModel.get(data.key);
                //model.set({status:"removed"});
				Framework.vent.trigger("content:open", {
        title: data.title, // Content title
        absPath: '/test2', // Absolute path to the content
        isModified: false, // modified indicator
        isOwner: true, // Indicates if it is possible to modify content
        isEditable: true, // Indicates if if framework has corresponding handler
        sha: null, // Git SHA summ
        repo: 'umlsynco/umlsync', // GitHub repository name
        branch: 'master', // Branch name
        view: 'github', // view identifier - GitHub or something else
        contentType: 'sourcecode' // content type uid
    });
            }
        });

        Framework.module('Backend');
        Framework.Backend.Github = new Github('umlsynco');

        Framework.addInitializer(function (options) {
            this.registerDataProvider('GitHub', githubLayout);
        });

        return githubLayout;
    });

