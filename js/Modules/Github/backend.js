define(['marionette',
        'Views/framework',
        'github'
    ],
    function (Marionette, Framework, Github) {
        Framework.module('Backend', function(Backend) {
            Backend.Github = {};
            Backend.Github = new Github({username:'umlsynco', token:"e29cebb38a6860cfbeb577e2f68782fc45cbe6c5", singleton: true});
        });
        return Framework.Backend.Github;
    });
