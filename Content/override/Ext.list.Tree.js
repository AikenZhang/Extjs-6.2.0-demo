/* ***********************************************
 * author :  ***
 * function: 
 * history:  created by *** 2015/12/11 13:24:04 
 * ***********************************************/
Ext.override(Ext.list.Tree, {
    floatItem: function (item, byHover) {
        var me = this;

        me.callParent(arguments);

        //修正IE下不影藏浮动菜单的问题
        item.element.on('mouseout', me.checkForMouseLeave, me);
    }
});

//Ext.list.Tree添加itemclick事件
Ext.override(Ext.list.TreeItem, {
    isSelectionEvent: function (e) {
        var me = this,
            owner = this.getOwner();

        owner.fireEvent('itemclick', owner, me.getNode());
        return false;
    }
});