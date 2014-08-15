define(['marionette',
        'Views/framework',
        'github',
        'Module/Github/Collections/rawTree',
        'Module/Github/Model/treeItemModel'
    ],
    function (Marionette, Framework, Github, RawTree, TreeModel) {
        Framework.module('Backend', function(Backend) {
            Backend.Github = {};
            Backend.Github.github = new Github('umlsynco');

            Backend.Github.GetTreeCollection = function(treeOptions) {
                var extendedTreeCollection = TreeModel.extend(treeOptions);
                var ert = RawTree.extend(treeOptions);

                var model = new ert({
                    model: extendedTreeCollection
                });
                return model
            };

        });
        return Framework.Backend.Github;
    });
