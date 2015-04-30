define(['marionette',
        'Views/framework',
        'github'
    ],
    function (Marionette, Framework, Github) {
        Framework.module('Backend', function(Backend) {
            Backend.Github = {};
            Backend.Github = new Github({username:'umlsynco', token:"f77fc059d80d497f32ebf8fab30ae27f56a60bba", singleton: true});
        });
        return Framework.Backend.Github;
    });
