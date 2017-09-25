/* ***********************************************
 * author :  ***
 * function: 解决 中文排序不对的 bug
 * history:  created by *** 2015/12/18 14:35:10 
 * ***********************************************/
Ext.override(Ext.util.Sorter, {
    sortFn: function (item1, item2) {
        var me = this,
            transform = me._transform,
            root = me._root,
            property = me._property,
            lhs, rhs;

        if (root) {
            item1 = item1[root];
            item2 = item2[root];
        }

        lhs = item1[property];
        rhs = item2[property];

        if (transform) {
            lhs = transform(lhs);
            rhs = transform(rhs);
        }

        // null值
        if (lhs === null && rhs === null) {
            return 0;
        }
        if (lhs === null) {
            return -1;
        }
        if (rhs === null) {
            return 1;
        }
        //end

        if (typeof (lhs) === "string") {
            return lhs.localeCompare(rhs);
        }
        return (lhs > rhs) ? 1 : (lhs < rhs ? -1 : 0);
    }
});