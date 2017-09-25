/* ***********************************************
 * author :  ***
 * function: 
 * history:  created by *** 2015/12/11 13:14:04 
 * ***********************************************/
Ext.override(Ext.form.field.Number, {
    repeatTriggerClick: false,
    //decimalPrecision: parseInt(Fm.Server.Config.MoneyAccuracy, 10) || 2,
    decimalPrecision:  2,
    maxValue: 9999999999999,
    initComponent: function () {
        var me = this;
        me.callParent();
        me.on({
            change: function (field, value) {
                if (value === '-') {
                    return;
                }
                var _v = me.parseValue(Ext.Number.constrain(value, field.minValue, field.maxValue));
                if (_v) {
                    _v = _v.toFixed(me.decimalPrecision)
                }
                me.setValue(_v);
            }
        });
    }
});