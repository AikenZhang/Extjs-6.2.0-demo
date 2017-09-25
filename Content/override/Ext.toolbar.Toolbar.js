/* ***********************************************
 * author :  ***
 * function: 
 * history:  created by *** 2015/12/11 13:26:21 
 * ***********************************************/
Ext.override(Ext.toolbar.Toolbar, {
    //统一按钮样式
    defaultButtonUI: 'default',

    dblclickEvent: 'dblclick',
    onRender: function () {
        var me = this,
            addOndblclick,
            btn,
            btnListeners;

        me.callParent(arguments);

        // Set btn as a local variable for easy access
        me.el.on({
            dblclick: me.ondblClick,
            scope: me
        });
    },
    doPreventDefault: function (e) {
        if (e && (this.preventDefault || (this.disabled && this.getHref()))) {
            e.preventDefault();
        }
    },
    ondblClick: function (e) {
        var me = this;
        me.doPreventDefault(e);
        // Click may have destroyed the button
        if (me.fireEvent('dblclick', me, e) !== false && !me.destroyed) {
            Ext.callback(me.handler, me.scope, [me, e], 0, me);
        }
    }
});