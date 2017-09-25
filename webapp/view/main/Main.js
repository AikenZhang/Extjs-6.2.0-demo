/* ***********************************************
 * author :  ***
 * function: 主框架
 * history:  created by *** 2015/7/1 14:12:21 
 * ***********************************************/

Ext.define('webapp.view.main.Top', {
    extend: 'Ext.toolbar.Toolbar',
    requires: [
       // 'FmApp.view.sys.suspend.Suspend'
    ],
    xtype: 'webapp-top',
    border: false,
    frame: false,
    height: 48,
    padding: 0,
    style:{
        "background":"#f2f2f2"
    },
    items:[
         '->', {
            //帮助按钮
            iconCls: 'fa fa-question',
            tooltip: '帮助'
        },{
            xtype:'label',
            text:ServerData.UserName
        },
        {
            xtype:"image",
            src:"lib/img/user.jpeg",
            height:32,
            width:32,
            border:1
        }
    ]
});

Ext.define('webapp.view.main.Left', {
    extend: 'Ext.panel.Panel',
    xtype: 'webapp-mainleft',
    requires: [
        'Fm.ux.button.ImageButton'
    ],
    width:AppConfig.Design.Menu.MaxWidth,
    padding: 0,
    border: false,
    scrollable: 'y',
    collapsible: false,
    layout: {
            type: 'hbox',
            //是否支持动画效果
            //用于支持菜单栏折叠/展开动画效果
            animate: true,
            animatePolicy: {
                x: true,
                width: true
            }
    },
    dockedItems:[{
        xtype:'toolbar',
        padding:0,
        margin:0,
        height:40,
        style:{
            "background":"#e4e4e4"
        },
        items:[
            {
                xtype:'label',
                name:'labelWidth',
                width:160,
                margin:0,
                padding:0
            },
            {
                height:40,
                width:40,
                iconCls:'fa fa-caret-square-o-left',
                border:0,
                //fmargin:'0 0 0 164',
                style:{
                    'background':'#fff',
                    "font-size":'18px',
                },
                handler:"toggleMenu"
            }
        ]
    }
        
    ],
    items: [
        {
            xtype: "treelist",
            width:AppConfig.Design.Menu.MaxWidth,
            padding:0,
            store: Ext.create('Ext.data.TreeStore', {
                root: {
                    expanded: true,
                    children: ServerData.MenuList
                }
            }),
            singleExpand: true,
            expanderOnly: false,
            selected: true,
            selectedParent: true,
            listeners: {
                itemclick: "leftMenuItemClick"
            }
        }
    ]
});

Ext.define("webapp.view.main.Tab", {
    extend: 'Ext.tab.Panel',
    requires: [
        'Fm.ux.TabCloseMenu'
    ],
    xtype: 'webapp-maintab',
    id: "ViewPortCoreTab",
    activeTab: 0,
    enableTabScroll: true,
    autoScroll: false,
    //分辨率不能低于1024
    minWidth: 800,
    //tabPosition: "left",
    cls: 'webapp-maintab',
    //ui: "cis",
    items: [
    {
        id: 'main_tab_0',
        menuId: 0,
        title: "",
        xtype: 'container',
        border: false,
        frame: false,
        hidden: true
    }],
    plugins: [
        Ext.create('Fm.ux.TabCloseMenu', {
            closeTabText: '关闭面板',
            closeOthersTabsText: '关闭其他面板',
            closeAllTabsText: '关闭所有面板'
        })
    ],
    listeners: {
        tabchange: 'tabChange'
    }
});

Ext.define('webapp.view.main.Bottom', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'webapp-mainbottom',
    border: 0,
    frame: false,
    items: [{
        xtype: 'container', msgarea: 'msgarea', items: []
    }, "->", {
        xtype: 'label',
        text: '版权所有:XXXXXXXXX 版本:' + AppConfig.appVersion
    }]
});

Ext.define('webapp.view.main.Main', {
    extend: 'Ext.container.Container',
    requires: [
        "webapp.view.main.MainController",
        "webapp.view.main.MainModel"
    ],
    xtype: 'webapp-main',
    controller: 'main',
    viewModel: {
        type: 'main'
    },
    layout: {
        type: 'border'
    },
    listeners: {
        afterRender: 'mainRender',
        resize: 'mainResize'
    },
    items: [
        {
            xtype: 'webapp-top',
            region: 'north',
            split: false
        }, {
            xtype: 'webapp-mainleft',
            region: 'west',
            split: false
        }, {
            xtype: 'webapp-maintab',
            region: "center",
            padding: '0 8 8'
        }, {
            xtype: 'webapp-mainbottom',
            region: 'south',
            border: 1
        }
    ]
});
