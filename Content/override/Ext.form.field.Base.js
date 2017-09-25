/* ***********************************************
 * author :  ***
 * function: 解决 bind value 验证有错误时出现各种问题的 bug
 * history:  created by *** 2015/12/18 14:35:10 
 * ***********************************************/
Ext.override(Ext.form.field.Base, {
    validateValue: function (value) {
        var me = this,
            errors = me.getErrors(value),
            isValid = Ext.isEmpty(errors);

        if (!me.preventMark) {
            if (isValid) {
                me.clearInvalid();
            } else {
                if (me.bind && me.bind.value && me.bind.value.setValue) {
                    me.bind.value.setValue(me.getValue())
                }
                me.markInvalid(errors);
            }
        }

        return isValid;
    }
});