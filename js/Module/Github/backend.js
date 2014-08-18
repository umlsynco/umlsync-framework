define(['marionette',
        'Views/framework',
        'github',
        'Module/Github/Collections/rawTree',
        'Module/Github/Model/treeItemModel',
        'Module/Github/Collections/repositories',
        'Module/Github/Collections/branches'
    ],
    function (Marionette, Framework, Github, RawTree, TreeModel, RepoCollection, Branches) {
        Framework.module('Backend', function(Backend) {
            Backend.Github = {};
            Backend.Github.github = new Github({username:'umlsynco', token:'bb57c9b48005118aad87461d4bfa420253a8e831'});

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
