define(['marionette'],
    function(Marionette) {
        var ItemView = Backbone.Marionette.ItemView.extend({
            initialize: function () {
                this.model.on("change:status", function(model, status) {
                    $("#us-tree").dynatree("getTree").getNodeByKey(dny.parentCid).addClass(status);
                });
            },
            render: function(model, options) {
                var node;
                var dny = this.model.getDynatreeData();
                if (dny.parentCid) {
                    node = $("#us-tree").dynatree("getTree").getNodeByKey(dny.parentCid);
                }
                else {
                    node = $("#us-tree").dynatree("getRoot");
                }
                node.addChild(dny);
            }
        });
        return ItemView;
    });

