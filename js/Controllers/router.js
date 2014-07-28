define(
    ['marionette', '../Views/contentTabbedView', 'Collections/contentCollection', 'Views/framework', 'Controllers/contentController'],
function(Marionette, CollectionView, ContentCollection, Framework) {
    var FrameworkRouter = new Marionette.AppRouter({
        appRoutes: {
        },
        controller: {}
    });
    return FrameworkRouter;
});
