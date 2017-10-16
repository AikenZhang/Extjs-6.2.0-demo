Ext.define('webapp.view.ueditor.Ueditor', {
    extend: 'Ext.panel.Panel',
    requires:[
    'webapp.view.ueditor.UeditorController',
    'webapp.view.ueditor.UeditorModel',
    'Fm.ux.ueditor.Ueditor'
    ],
    controller: 'ueditor',
    viewModel: {
        type: 'ueditor'
    },
    items:[{
        xtype:'textfield',
        bind:{
            value:'{ueditor.value}'
        }
    },
        {
            xtype:"ueditor",
            width:600,
            height:500,
            bind:{
                value:'{ueditor.value}'
            }
        }
    ]
});