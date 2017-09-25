/* ***********************************************
 * author :  ***
 * function: 修正table布局 hideMode === 'visibility' 不起作用的Bug
 * history:  created by *** 2015/7/3 10:03:11 
 * ***********************************************/
(function () {
    Ext.override(Ext.layout.container.Table, {
        config: { columns: null },
        getLayoutItems: function () {
            var me = this,
                owner = me.owner,
                result = [],
                allitems = owner && owner.items,
                items = (allitems && allitems.items) || [],
                item,
                len = items.length, i;

            for (i = 0; i < len; i++) {
                item = items[i];
                if (!item.hidden || item.hideMode === 'visibility') {
                    result.push(item);
                }
            }
            return result;
        }
    });
})();