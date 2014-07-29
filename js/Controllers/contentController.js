define(
    ['marionette', 'Views/Files/contentTabbedView', 'Collections/contentCollection', 'Views/framework', 'Controllers/router'],
    function(Marionette, CollectionView, ContentCollection, Framework, FrameworkRouter) {
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
                    // Render region to initiate $.tab widget
                    this.ContentView.render();
                });
            }
        };// controller

        FrameworkRouter.processAppRoutes(ContentController, {'/':'initializeFramework'});

        return ContentController.initializeFramework();
    });

