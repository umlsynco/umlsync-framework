define(['jquery',
        'jquery-ui',
        'marionette',
        'Views/framework',
        'Views/Tree/dataProvidersSelectView',
    ], // Registered data providers (GitHub/Eclipse/PySvn etc)
    function ($, useless, Marionette, Framework, DataProviderSelectView) {
        var dataProviderSwitcher = Marionette.LayoutView.extend({
            template: "#content-left-layout",
            dataProvidersViews: {},
            regions: {
                viewSelection: "#switcher #us-viewmanager",
                views: "#switcher #us-views"
            },

            events : {
                "switcher:toolbox:click" : "activateProvider"
            },

            resize: function(event, w, h) {
                var width = w,
                height = h;
                // Update the height of current element
                this.$el.height(h).children("DIV").height(h);

                var res = this.dataProviderSelectView.resize(event, width, height);
                if (res.height) {
                    height -= res.height;
                }

                if (this.views.currentView) {
                    this.views.currentView.resize(event, width, height);
                }
                return {width: this.$el.width()};
            },

            onRender: function (options) {
                //
                // Selection list should be updated in runtime in case of
                // runtime load of some handlers
                //
                this.dataProviderSelectView = new DataProviderSelectView({
                    collection: Framework.getDataProviderCollection()
                });

                this.viewSelection.show(this.dataProviderSelectView);

                this.viewElement = $("#us-views");

                var view = this;
                this.dataProviderSelectView.on("switcher:toolbox:click", function(e, ui) {
                    var val = e.$el;
                    if (val) {
                        var element = $(val).children("SPAN");
                        var provider = element.html();
                        view.activateDataProvider(provider);
                    }
                });
            },

            activateDataProvider: function (name) {
                if (this.dataProvidersViews[name]) {
                    this.views.attachView(this.dataProvidersViews[name]);
                }
                else {
                    var dpv = Framework.getDataProvider(name);
                    if (dpv) {
                        this.dataProvidersViews[name] = new dpv();
                        this.views.show(this.dataProvidersViews[name]);
                    }
                    else {
                        alert("Unregistered data provider view: " + name);
                    }
                }
				Framework.vent.trigger('app:resize', null);
            }
        });
        return dataProviderSwitcher;
    });
