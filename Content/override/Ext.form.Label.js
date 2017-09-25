/* ***********************************************
 * author :  ***
 * function: 增加click事件
 * history:  created by *** 2015/11/23 16:01:22 
 * ***********************************************/
Ext.override(Ext.form.Label, {
    clickEvent: 'click',
    onRender: function () {
        var me = this,
            addOnclick,
            btn,
            btnListeners;

        me.callParent(arguments);

        // Set btn as a local variable for easy access
        me.el.on({
            click: me.onClick,
            scope: me
        });
    },
    doPreventDefault: function (e) {
        if (e && (this.preventDefault || (this.disabled && this.getHref()))) {
            e.preventDefault();
        }
    },
    onClick: function (e) {
        var me = this;
        me.doPreventDefault(e);
        // Click may have destroyed the button
        if (me.fireEvent('click', me, e) !== false && !me.destroyed) {
            Ext.callback(me.handler, me.scope, [me, e], 0, me);
        }
    }
});