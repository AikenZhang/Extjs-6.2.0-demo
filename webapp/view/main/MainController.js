/* ***********************************************
 * author :  ***
 * function: 主框架
 * history:  created by *** 2015/7/31 13:54:07 
 * ***********************************************/
Ext.define('webapp.view.main.MainController', {
    extend: 'Fm.base.MainController',

    alias: 'controller.main',
    xtypeStartWith: 'webapp',
    /**
     * 左菜单点击
     */
    leftMenuItemClick: function (view, record) {
        var me = this,
            treelist = view,
            record = record.get ? record : record.item.getNode();

        var _isLeaf = record.get('leaf') || false;
        if (_isLeaf) {
            if (record.get('Handler') === 'openNewTab') {
                Ext.History.add(record.get('Id'));
            }
        }
    }
});