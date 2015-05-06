define(
    ['jquery',
     'marionette',
     'Views/framework'],
    function ($, Marionette, Framework) {
     // Context menu
     //<ul style="width: 121px; top: 266px; left: 637px; z-index: 1;" class="context-menu-list context-menu-root"><li class="context-menu-item icon icon-edit"><span>Edit</span></li><li class="context-menu-item icon icon-cut"><span>Cut</span></li><li class="context-menu-item icon icon-copy"><span>Copy</span></li><li class="context-menu-item icon icon-paste"><span>Paste</span></li><li class="context-menu-item icon icon-delete"><span>Delete</span></li><li class="context-menu-item context-menu-separator not-selectable"></li><li class="context-menu-item icon icon-quit"><span>Quit</span></li></ul>
     var contextMenuItemView = Marionette.CollectionView.extend({
	 });

     var contextMenuCollectionView = Marionette.CollectionView.extend({
            collectionEvents: {
              'change:isModified': 'isModified',
              'change:isActive': 'isActive'
              
            },
            events: {
               "click .ui-icon-close" : 'triggerClose'
            },

            // tab prefix + content Id
            tabPrefix: 'diag-',
            //
            // Initialize tabs and subscribe on collection's callbacks
            //
            initialize : function () {
            }
        });

        return mainMenuCollectionView;
	});
