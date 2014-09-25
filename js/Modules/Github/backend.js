define(['marionette',
        'Views/framework',
        'github'
    ],
    function (Marionette, Framework, Github) {
        Framework.module('Backend', function(Backend) {
            Backend.Github = {};
            Backend.Github = new Github({username:'umlsynco', token:'bd53c60438dbc9f65ce7aae16f67247bda00fab8', singleton: true});
        });
        return Framework.Backend.Github;
    });
