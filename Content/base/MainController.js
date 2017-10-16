/* ***********************************************
 * author :  ***
 * function: 主框架
 * history:  created by *** 2015/7/31 13:54:07 
 * ***********************************************/
Ext.define('Fm.base.MainController', {
    extend: 'Ext.app.ViewController',

    requires: [
        'Ext.window.MessageBox'
    ],

    /**
     * main render后执行
     */
    mainRender: function () {
        var me = this;

        Ext.History.init();
        Ext.History.on('change', function (code,view) {
            var mid = code;
            if (!mid) {
                mid = 0;
            }
            me.openNewTab(mid);
        });
        //
        var code = Ext.History.getToken();
        if (!code || code.toString() === '0') {
            code = AppConfig.defaultMenuId;
        }

        if (code) {
            var exp = setInterval(function () {
                if (application) {
                    clearInterval(exp);
                    me.openNewTab(code);
                }
            }, 30);
        }
    },
    deSelectMenuById: function (record) {
        var me = this,
            treelist = me.getView().down('treelist');

        if (record) {
            treelist.getItem(record).updateSelected(false);
        }
    },
    selectMenuById: function (mid) {
        var me = this,
            treelist = me.getView().down('treelist'),
            treelistStore = treelist.getStore(),
            record;

        record = treelistStore.getAt(treelistStore.findBy(function (record) {
            return record.get('Id') == mid;
        }));

        if (record) {
            treelist.getItem(record).updateSelected(true);
            me.lastSelectedRecord = record;
        }
    },
    getMenuName:function(code,Id){
        var me=this;
        for(var a=0;a<code.length;a++){
            var children=code[a].children;
            if(children){
               return me.getMenuName(children,Id);
            }
            else{
                if(code[a].Id===Id){
                    return code[a];
                }
                
            }
        }
        
    },
    /**
     * 标签切换
     */
    tabChange: function (v, tab) {
        var me = this,
            view = me.getView(),
            msgarea;

        if (tab.menuId !== null && tab.menuId !== undefined) {
            var code = tab.menuId;
            Ext.History.add(code);
            return false;
        }
    },

    /**
     * 左菜单样式切换
     */
    toggleMenu: function (btn) {
        var me = this,
            treelist = me.getView().down('treelist'),
            label=me.getView().down('label[name=labelWidth]'),
            ct = treelist.ownerCt;

        if (me.pressed === undefined) {
            me.pressed = AppConfig.Design.Menu.Pressed;
        }

        Ext.suspendLayouts();
        treelist.setMicro(!me.pressed);
        if (me.pressed) {
            ct.setWidth(AppConfig.Design.Menu.MaxWidth);
            treelist.setWidth(AppConfig.Design.Menu.MaxWidth);
            label.setWidth(AppConfig.Design.Menu.MaxWidth-AppConfig.Design.Menu.MinWidth);
            btn.setIconCls('fa fa-caret-square-o-left');
        } else {
            ct.setWidth(AppConfig.Design.Menu.MinWidth);
            treelist.setWidth(AppConfig.Design.Menu.MinWidth);
            label.setWidth(0);
            btn.setIconCls('fa fa-caret-square-o-right');
        }
        //Cookie.set(AppConfig.cookieStartWith + "main-left-panel-micro", !me.pressed, 365);

        me.pressed = !me.pressed;
        if (Ext.isIE8) {
            this.repaintList(treelist, !me.pressed);
        }
        //触发多分辨率兼容更新
        //Ext.GlobalEvents.fireEvent('resize');
        Ext.resumeLayouts(true);
    },

    /**
     * 主框架大小调整事件
     */
    mainResize: function () {
        Ext.util.CSS.removeStyleSheet('x-treelist-item-floated-height');
        Ext.util.CSS.createStyleSheet(
            '.x-treelist-nav .x-treelist-item-floated .x-treelist-container{max-height:' + (this.getView().getHeight() - 36) + 'px;overflow-y:auto;}',
            'x-treelist-item-floated-height');
        return true;
    },
    /**
     * 根据菜单编号打开一个标签
     */
    openNewTab: function (menuId, data) {
        var me = this,
            view = me.getView(),
            menuData,
            main = view.down(me.xtypeStartWith + "-maintab"),
            treelist = view.down(me.xtypeStartWith + '-mainleft').down('treelist'),
            store = treelist.getStore(),
            record;

        me.deSelectMenuById(me.lastSelectedRecord);

        if (menuId.toString() === '0') {
            main.setActiveTab(Ext.getCmp('main_tab_0'));
            return false;
        }
        menuData=me.getMenuName(ServerData.MenuList,menuId);
        // menuData = Ext.Array.findBy(ServerData.MenuList, function (item) {
        //     return item.Id.toString() === menuId.toString();
        // });

        // if (!menuData) {
        //     //Fm.msg.error('没有权限查看此页面。');
        //     return false;
        // }

        if (menuData.ParentId !== 0) {
            record = store.getAt(store.findBy(function (record) {
                return record.get('Id') == menuData.ParentId;
            }));

            if (record) {
                treelist.getItem(record).expand();
            }
        }

        me.selectMenuById(menuId);

        var id = 'main_tab_' + menuData.Id;
        var panel = Ext.getCmp(id);
        try {
            if (!panel) {
                setTimeout(function () {
                    try {
                        panel = Ext.create(menuData.MenuView, {
                            id: id,
                            menuId: menuId,
                            closable: true,
                            iconCls: menuData.iconCls,
                            closeAction: 'destroy',
                            autoDestroy: true,
                            title: menuData.text,
                            cls: 'cis-panel-default',
                            frame: false,
                            border: false,
                            listeners: {
                                afterrender: function (v) {
                                    if (data && panel[data.event]) {
                                        panel[data.event].call(panel, data.params)
                                    }
                                }
                            }
                        });
                    } catch (e) {
                        Ext.log.error(e.stack);
                    }

                    if (panel) {
                        main.add(panel);
                        main.setActiveTab(panel);
                    }
                }, 10);
            } else {
                main.setActiveTab(panel);
                if (data && panel[data.event]) {
                    panel[data.event].call(panel, data.params)
                }
            }
        } catch (e) {
            Ext.log.error(e.stack);
        }
    },

    /**
     * 左菜单重新渲染
     */
    repaintList: function (treelist, microMode) {
        treelist.getStore().getRoot().cascadeBy(function (node) {
            var item, toolElement;

            item = treelist.getItem(node);

            if (item && item.isTreeListItem) {
                if (microMode) {
                    toolElement = item.getToolElement();

                    if (toolElement && toolElement.isVisible(true)) {
                        toolElement.syncRepaint();
                    }
                }
                else {
                    if (item.element.isVisible(true)) {
                        item.iconElement.syncRepaint();
                        item.expanderElement.syncRepaint();
                    }
                }
            }
        });
    },
    addTabForTest: function (viewName) {
        var me = this,
            view = me.getView(),
            main = view.down(me.xtypeStartWith + "-maintab");

        var id = 'main_tab_' + viewName;

        var panel = Ext.getCmp(id);
        try {
            if (!panel) {
                application.globalMask.show();
                setTimeout(function () {
                    try {
                        panel = Ext.create(viewName, {
                            id: id,
                            closable: true,
                            closeAction: 'destroy',
                            autoDestroy: true,
                            title: viewName,
                            cls: 'cis-panel-default',
                            frame: false,
                            border: false
                        });
                    } catch (e) {
                        Ext.log.error(e.stack);
                    }

                    if (panel) {
                        main.add(panel);
                        main.setActiveTab(panel);
                    }
                }, 10);
                application.globalMask.hide();
            } else {
                main.setActiveTab(panel);
            }
        } catch (e) {
            Ext.log.error(e.stack);
        }
    }
});