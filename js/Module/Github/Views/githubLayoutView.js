define(['jquery',
        'marionette',
        'Collections/toolboxIconsCollection',
        'Views/Controls/toolboxView',
        'Views/framework',
        'Module/Github/Model/treeModel'
    ],
    function ($, Marionette, ToolboxCollection, ToolboxView, Framework, Tm) {
        var githubLayout = Marionette.LayoutView.extend({
            template: "#github-content-layout",
            regions: {
                repository: "#us-viewmanager", // Repository selection region
                branch: "#us-branch", // branch selection region
                toolbox: "#us-toolbox", // Toolbox region
                tree: "#us-treetabs" // Tree region
            },
            initialize: function() {

            },
            onRender: function (options) {
                var collection = new ToolboxCollection();
                collection.add([
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

                var toolboxView = new ToolboxView({
                    childViewEventPrefix: 'github',
                    collection: collection
                });

                toolboxView.on("github:toolbox:click", function(){
                    this.tm = new Tm({repo:"umlsynco/diagrams", branch:"master"});
                    this.tm.fetch();
                });

                this.toolbox.show(toolboxView);
            }
        });

        Framework.addInitializer(function (options) {
            this.registerDataProvider('GitHub', githubLayout);
        });

        return githubLayout;
    });

