define(['marionette'],
    function(Marionette) {
        var ItemView = Backbone.Marionette.ItemView.extend({
            initialize: function () {
                this.model.on("change:status", function(model, status) {
                    var tree = $("#us-tree").dynatree("getTree");
                    if (tree) {
                        var node = tree.getNodeByKey(model.cid);
                        if (node) {
                            $(node.span).removeClass("dynatree-ico-conflict dynatree-ico-new dynatree-ico-updated dynatree-ico-removed").addClass("dynatree-ico-" + status);
                        }
                    }
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

