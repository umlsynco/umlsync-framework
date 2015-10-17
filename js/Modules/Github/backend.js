define(['marionette',
        'Views/framework',
        'github'
    ],
    function (Marionette, Framework, Github) {
        Framework.module('Backend', function(Backend) {
            Backend.Github = {};
            Backend.Github = new Github({username:'umlsynco', token:"8f4fba4628958f970684b9f180b035fa1f54c45c", singleton: true});
        });
        return Framework.Backend.Github;
    });
