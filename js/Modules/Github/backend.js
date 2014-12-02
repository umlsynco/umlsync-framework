define(['marionette',
        'Views/framework',
        'github'
    ],
    function (Marionette, Framework, Github) {
        Framework.module('Backend', function(Backend) {
            Backend.Github = {};
            Backend.Github = new Github({username:'umlsynco', token:"bcefc8ea4d8b23ab9d1d0436b5999616cde9b040", singleton: true});
        });
        return Framework.Backend.Github;
    });
