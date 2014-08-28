// Simple prototype of class model for the backbone

define(['backbone'], function (Backbone) {
    var Field = Backbone.Model.extend({
        defaults: {
            visibility: 'private',
            name: 'new field',
            type: 'void'
        }
    });

    var Method = Backbone.Model.extend({
        defaults: {
            visibility: 'private',
            name: 'newMethod',
            returnType: 'void',
            arguments: '' // list of arguments separated by ','
        }
    });

    var ContentModel = Backbone.Model.extend({
        defaults: {
            'nameTemplate': 'Class',
            'width': '150px',
            'height': 'auto'
        },
        auxmap: {
            "Class": "",
            "Interface": "interface",
            "Enumeration": "enum",
            "Primitive": "primitive",
            "ORM": "ORM",
            "ORMComponent": "ORMComponent"
        },
        initialize: function () {
            this.fields = new Backbone.Collection({
                model: Field
            });
            this.methods = new Backbone.Collection({
                model: Method
            });
        },
        addField: function (options) {
            // Create new field with got options
            var model = new Field(options);
            this.fields.add(model);
        },
        addMethod: function (options) {
            // Create new field with got options
            var model = new Method(options);
            this.methods.add(model);

        }
    });
    return ContentModel;
});

