define(['marionette',
        'Views/framework',
        'github',
        'Modules/Github/Collections/rawTree',
        'Modules/Github/Model/treeItemModel',
        'Modules/Github/Collections/repositories',
        'Modules/Github/Collections/branches'
    ],
    function (Marionette, Framework, Github, RawTree, TreeModel, RepoCollection, Branches) {
        Framework.module('Backend', function(Backend) {
            Backend.Github = {};
            Backend.Github.github = new Github({username:'umlsynco', token:'0528657ffgfgrfd8bbc5c783e0df'});

            Backend.Github.GetTreeCollection = function(treeOptions) {
                var extendedTreeCollection = TreeModel.extend(treeOptions);
                var ert = RawTree.extend(treeOptions);

                var model = new ert({
                    model: extendedTreeCollection
                });
                return model
            };

            Backend.Github.GetRepoCollection = function() {
                return new RepoCollection();
            };

            Backend.Github.GetBranchCollection = function() {
                return new Branches();
            };


        });
        return Framework.Backend.Github;
    });
