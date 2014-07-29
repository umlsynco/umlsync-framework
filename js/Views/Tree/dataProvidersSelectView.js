define(['marionette',
        'Views/Tree/dataProviderSelectItemView'
    ],
    function (Marionette, DataProviderSelectItemView) {
        var dataProviderSelectView = Marionette.CollectionView.extend({
            childView: DataProviderSelectItemView,
            childViewEventPrefix: "switcher",
            initialize: function() {
                this.on("toolbox:click", function () {
                    alert("CLICED 1");
                });

                //this.on("switcher:toolbox:click", function () {
                //    alert("CLICED 2");
                //});
            }
        });
        return dataProviderSelectView;
    });
