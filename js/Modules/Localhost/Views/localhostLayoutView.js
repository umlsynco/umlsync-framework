define([
        'marionette',
        'Views/framework',
        'Modules/Localhost/Controllers/LocalhostControllersFacade'
    ],
    function (// Basic
              Marionette, Framework, Facade
) {
        var layout = Marionette.LayoutView.extend({
            template: "#localhost-content-layout",
            regions: {
                toolbox: "#us-toolbox", // Toolbox region
                tree: "#us-treetabs" // Tree region
            },
            // Layered view was rendered
            onRender: function (options) {
                // create facade of operations on first creation
                if (!this.Facade) this.Facade = new Facade({regions:this});
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

