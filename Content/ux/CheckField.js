/* ***********************************************
 * author :  wskicfuu
 * function: 选择输入框
 * history:  created by wskicfuu 2016/5/4 13:18:44 
 * ***********************************************/

Ext.define('Fm.ux.CheckField', {
    extend: 'Ext.container.Container',
    alias: 'widget.checkfield',
    items: [],
    viewModel: {
        data: {
            Checked: false
        }
    },
    layout: {
        type: 'hbox',
        align: 'right'
    },
    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            items: [{
                xtype: 'checkbox',
                labelAlign: 'right',
                fieldLabel: me.fieldLabel,
                colspan: 1,
                width: 205,
                labelWidth: 180,
                bind: {
                    value: '{Checked}'
                }
            }, {
                xtype: 'textfield',
                margin: '0 60 0 0',
                colspan: 1,
                width: 150,
                value: me.value,
                bind: {
                    disabled: '{!Checked}'
                }
            }]
        })
        me.callParent();
    }
})