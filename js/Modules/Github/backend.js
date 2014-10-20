define(['marionette',
        'Views/framework',
        'github'
    ],
    function (Marionette, Framework, Github) {
        Framework.module('Backend', function(Backend) {
            Backend.Github = {};
            Backend.Github = new Github({username:'umlsynco', token:'dd1e16fc2d796f9dbb4cf7a628b2028a4194e821', singleton: true});
        });
        return Framework.Backend.Github;
    });
