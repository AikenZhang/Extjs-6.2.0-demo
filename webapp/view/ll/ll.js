/**
 * This example demonstrates the treelist widget.
 */
Ext.define('webapp.view.ll.ll', {
    extend: 'Ext.panel.Panel',
    requires:[
        "webapp.view.ll.llController",
        "webapp.view.ll.llModel"
    ],
    xtype: 'tree-list',
    width: 500,
    height: 450,
    title: 'TreeList',
    controller: 'tree-list',

    iconCls: 'fa fa-gears',
    layout: 'border',

    viewModel: {
        type: 'tree-list'
    },

    header: {
        items: [{
            xtype: 'button',
            text: 'Options',
            menu: [{
                text: 'Expander Only',
                checked: true,
                handler: 'onToggleConfig',
                config: 'expanderOnly'
            }, {
                text: 'Single Expand',
                checked: false,
                handler: 'onToggleConfig',
                config: 'singleExpand'
            }]
        },{
            xtype: 'button',
            text: 'Nav',
            enableToggle: true,
            reference: 'navBtn',
            toggleHandler: 'onToggleNav'
        },{
            xtype: 'button',
            text: 'Micro',
            enableToggle: true,
            toggleHandler: 'onToggleMicro'
        }]
    },

    items: [{
        region: 'west',
        width: 250,
        split: true,
        reference: 'treelistContainer',
        layout: {
            type: 'vbox',
            align: 'stretch'
        },
        border: false,
        scrollable: 'y',
        items: [{
            xtype: 'treelist',
            singleExpand: true,
            expanderOnly: false,
            selected: true,
            selectedParent: true,
            micro: true,
            reference: 'treelist',
            bind: '{navItems}'
        }]
    }, {
        region: 'center',
        bodyPadding: 10,
        bind: {
            html: '{selectionText}'
        },
        items:[{
          xtype:"button",
        
        text:"打开",
        handler:function(){
            Ext.create("webapp.view.index.index").show()
        }  
    }
        ]
        
    }]
});