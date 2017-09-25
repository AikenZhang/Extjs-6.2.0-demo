/* ***********************************************
 * author :  ***
 * function: 
 * history:  created by *** 2015/12/11 13:26:21 
 * ***********************************************/
Ext.override(Ext.panel.Title, {
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
        if (me.up('tabpanel')
            && me.up('tabpanel').fireEvent('tabbardblclick', me, e) !== false
            && !me.destroyed) {
            Ext.callback(me.handler, me.scope, [me, e], 0, me);
        }
    }
});