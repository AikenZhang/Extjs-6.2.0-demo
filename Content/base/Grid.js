/* ***********************************************
 * author :  ***
 * function: 表格基类
 * history:  created by *** 2015/7/6 15:03:12 
 * ***********************************************/
Ext.define("Fm.base.Grid", {
    extend: 'Ext.grid.Panel',
    alias: 'widget.cisgrid',
    requires: [
        'Fm.ux.CisPagingToolBar'
    ],
    isPage: true,
    pageSizes: null,
    loadMask: false,
    multiColumnSort: true,
    initComponent: function () {
        var me = this,
            vm,
            bindStoreName,
            store;

        //增加页码条默认功能
        if (me.isPage) {
            try {
                try {
                    store = me.store || me.getBind().store.getValue();
                } catch (e) { }

                if (!store || store.isEmptyStore) {
                    if (me.config.bind && me.config.bind.store) {
                        bindStoreName = Ext.String.trim(me.config.bind.store).replace('{', '').replace('}', '');
                        vm = me.getViewModel();
                        store = vm.getStore(bindStoreName);
                    }
                }
                if (me.buttons && me.buttons.length > 0) {
                    Ext.apply(this, {
                        dockedItems: {
                            xtype: 'panel'
                            dock: 'bottom',
                            ite˙˙ 
                                new Fm.ux.CisPagingToolBar({
                                    displayInfo: true,
                                    displayMsg: '显示{0}-{1}&nbsp;共{2}条',
                                    store: store,
                                    pageSizes: me.pageSizes || '10,50,100,500,1000,3000'
                                })
                            ],
                            buttons: me.buttons
                        }
                    });
                    me.buttons = undefined;
                } else {
                    Ext.apply(this, {
                        bbar: new Fm.ux.CisPagingToolBar({
                            displayInfo: true,
                            displayMsg: '显示{0}-{1}&nbsp;共{2}条',
                            store: store,
                            pageSizes: me.pageSizes || '10,50,100,500,1000,3000'
                        })
                    });
                }
            } catch (e) {
                Ext.log.error(e.stack);
            }
        }
        me.viewConfig = Ext.apply({
            loadMask: me.loadMask,
            //增加行样式设置功能
            getRowClass: function (record, rowIndex, rowParams, store) {
                var css = '';
                if (record.data._isDisabled) {
                    css = 'x-grid-disabled ';
                }
                if (record._rowclass || record.data._rowclass) {
                    css += (record._rowclass || record.data._rowclass);
                }
                if (css) {
                    return css;
                }
            }
        }, me.viewConfig);

        me.callParent(arguments);
    }
});