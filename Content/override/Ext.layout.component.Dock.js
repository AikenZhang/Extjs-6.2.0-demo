/* ***********************************************
 * author :  ***
 * function: 去除form panel 等组件的默认边框
 * history:  created by *** 2015/7/3 10:03:11 
 * ***********************************************/
(function () {
    Ext.override(Ext.layout.component.Dock, {
        handleItemBorders: function () {
            var me = this,
                owner = me.owner;
            if (owner.border !== true) {
                owner.border = false;
            }
            me.callParent(arguments);
        }
    });
})();