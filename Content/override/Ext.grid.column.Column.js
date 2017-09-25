/* ***********************************************
 * author :  fei85
 * function: 
 * history:  created by fei85 2016/9/21 9:45:54 
 * ***********************************************/
Ext.override(Ext.grid.column.Column, {
    //禁用列动态隐藏功能
    hideable: false,
    menuDisabled: true,
    initComponent: function () {
        var me = this;
        //增加tooltip提示配置  showTip
        if (me.showTip) {
            if (me.renderer) {
                var oRenderer = me.renderer;
                me.renderer = function (v, metadata, record, rowIndex, collIndex, store, view) {
                    var _v = oRenderer(v, metadata, record, rowIndex, collIndex, store, view);
                    if (_v !== null && _v !== undefined && metadata !== null) {
                        if (!metadata.tdAttr) {
                            metadata.tdAttr = 'data-qtip="' + _v + '"';
                        }
                    }
                    return _v;
                }
            } else {
                me.renderer = function (v, metadata) {
                    if (v !== null && v !== undefined && metadata !== null) {
                        metadata.tdAttr = 'data-qtip="' + v + '"';
                    }
                    return v;
                }
            }
        }

        me.callParent();
    },
    //排序增加到3种状态 升序-降序-取消
    sort: function (direction) {
        var me = this,
            grid = me.up('tablepanel'),
            store = grid.store,
            sorters = store.getSorters();

        // Maintain backward compatibility. 
        // If the grid is NOT configured with multi column sorting, then specify "replace". 
        // Only if we are doing multi column sorting do we insert it as one of a multi set. 
        // Suspend layouts in case multiple views depend upon this grid's store (eg lockable assemblies) 
        Ext.suspendLayouts();
        me.sorting = true;
        if (me.sortState === '') {
            me.sortState = 'ASC';
        }
        if (me.sortState === 'DESC') {
            sorters.remove(me.getSortParam());
            me.sortState = '';
            if (sorters.length === 0) {
                var _s = Ext.create('Ext.util.Sorter', {
                    sorterFn: function (record1, record2) {
                        return record1.internalId > record2.internalId ? 1 : -1;
                    }
                });
                store.sort(_s);
            } else {
                store.setSorters(sorters.items);
            }
        } else {
            store.sort(me.getSortParam(), direction, grid.multiColumnSort ? 'multi' : 'replace');
        }
        delete me.sorting;
        Ext.resumeLayouts(true);
    }
});