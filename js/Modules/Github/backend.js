define(['marionette',
        'Views/framework',
        'github'
    ],
    function (Marionette, Framework, Github) {
        Framework.module('Backend', function(Backend) {
            Backend.Github = {};
            Backend.Github = new Github({username:'umlsynco', token:"f7b6588dbb5b2d70c3c1c9101ef00451b71200cd", singleton: true});
        });
        return Framework.Backend.Github;
    });
