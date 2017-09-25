/* ***********************************************
 * author :  ***
 * function: 表格多选初始化默认绑定选中字段  解决分组后折叠状态下全选全不选的bug
 * history:  created by *** 2015/8/14 14:45:30 
 * ***********************************************/
(function () {
    Ext.override(Ext.selection.CheckboxModel, {
        updateHeaderState: function () {
            // 解决分组后折叠状态下全选全不选的bug override Ext.selection.Model中的selectAll deselectAll配合
            var me = this,
                store,
                storeCount,
                views = me.views,
                hdSelectStatus = false,
                selectedCount = 0,
                selected, len, i;

            store = me.store.store;
            if (!store) {
                store = me.store;
            }
            storeCount = store.getCount();

            if (!store.isBufferedStore && storeCount > 0) {
                selected = me.selected;
                hdSelectStatus = true;
                for (i = 0, len = selected.getCount() ; i < len; ++i) {
                    if (store.indexOfId(selected.getAt(i).id) === -1) {
                        break;
                    }
                    ++selectedCount;
                }
                hdSelectStatus = storeCount === selectedCount;
            }

            if (views && views.length) {
                me.toggleUiHeader(hdSelectStatus);
            }
        }
    });
})();