define(['jquery',
        'marionette',
        'github',
        'Views/framework'
    ],
    function ($, Marionette, Github, Framework) {
        var layout = Marionette.LayoutView.extend({
            template: "#localhost-content-layout",
            regions: {
//                repository: "#us-viewmanager", // Repository selection region
//                branch: "#us-branch", // branch selection region
                toolbox: "#us-toolbox", // Toolbox region
//                reposelect: "#us-repo-select", // Repo select drop down menu
//                branchselect: "#us-branch-select", // Repo select drop down menu
                tree: "#us-treetabs" // Tree region
            },
            // Layered view was rendered
            onRender: function (options) {
                // create facade of operations on first creation
//                if (!this.Facade) this.Facade = new Facade({regions:this});
            },

            //
            // TODO: handle resize in a right way
            //
            resize: function(event, width, height) {
                var res;
                if (this.toolbox.currentView) {
                    res = this.toolbox.currentView.resize(event, width, height);
                }

                if (this.tree.currentView) {
                    this.tree.currentView.resize(event, width, height - res.height);
                }
            },
        });


        Framework.addInitializer(function (options) {
            this.registerDataProvider('Local', layout);
        });

        return layout;
    });

