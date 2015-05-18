define(['marionette',
        'Views/framework',
        'github'
    ],
    function (Marionette, Framework, Github) {
        Framework.module('Backend', function(Backend) {
            Backend.Github = {};
            Backend.Github = new Github({username:'umlsynco', token:"3aa9cedb2c6b32ef3bb1b3b54029b00bba6a132d", singleton: true});
        });
        return Framework.Backend.Github;
    });
