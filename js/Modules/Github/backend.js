define(['marionette',
        'Views/framework',
        'github'
    ],
    function (Marionette, Framework, Github) {
        Framework.module('Backend', function(Backend) {
            Backend.Github = {};
            Backend.Github = new Github({username:'umlsynco', token:'6a39a76bce378a154f751221711c67a4ccefe8f2', singleton: true});
        });
        return Framework.Backend.Github;
    });
