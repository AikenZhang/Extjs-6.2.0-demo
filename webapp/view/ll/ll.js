/**
 * This example demonstrates the treelist widget.
 */
Ext.define('webapp.view.ll.ll', {
    extend: 'Ext.container.Container',
    requires:[
        "webapp.view.ll.llController",
        "webapp.view.ll.llModel"
    ],
    controller:'llController',

    viewModel: {
        type: 'llModel'
    },
    items:[{
         xtype:"displayfield",
         value:'欢迎使用Extjs'
    }
       
    ]
});