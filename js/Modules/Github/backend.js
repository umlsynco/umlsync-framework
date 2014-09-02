define(['marionette',
        'Views/framework',
        'github'
    ],
    function (Marionette, Framework, Github) {
        Framework.module('Backend', function(Backend) {
            Backend.Github = {};
            Backend.Github = new Github({username:'umlsynco', token:'6509c220ea1fa1993a618da0f5012298be0d5280', singleton: true});
        });
        return Framework.Backend.Github;
    });
