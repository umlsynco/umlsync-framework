define(['marionette',
        'Views/Files/contentTabbedView',
        'Views/Tree/dataProviderSwitcherView',
        'Collections/contentCollection',
        'Views/framework',
        'Controllers/router'],
    function(Marionette, CollectionView, DataProviderView, ContentCollection, Framework, FrameworkRouter) {
        var ContentController = {
            'initializeFramework': function () {
                Framework.addInitializer(function (options) {
                    this.ContentCollection = new ContentCollection();
                    this.ContentView = new CollectionView({
                        el : $("#tabs"),
                        collection: this.ContentCollection
                    });

                    // Attach an existing view, because it has own div#tabs
                    this.RightRegion.attachView(this.ContentView);

                    // The data provider selection is on the left region
                    this.DataProviderSwitcher = new DataProviderView();
                    this.LeftRegion.show(this.DataProviderSwitcher);
                    this.DataProviderSwitcher.on("toolbox:click", function() {alert("clicled")});
                    this.DataProviderSwitcher.on("switcher:toolbox:click", function() {alert("clicled")});
                });
            }
        };// controller

        FrameworkRouter.processAppRoutes(ContentController, {'/':'initializeFramework'});

        return ContentController.initializeFramework();
    });

