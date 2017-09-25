/* ***********************************************
 * author :  fei85
 * function: 非空验证 增加空格 空行验证
 * history:  created by fei85 2016/1/21 10:01:25 
 * ***********************************************/
Ext.override(Ext.data.validator.Presence, {
    config: {
        message: '必填'
    },
    validate: function (value) {
        var valid = !(value === undefined || value === null || value.toString().trim() === '');
        if (valid && !this.getAllowEmpty()) {
            valid = !(value === '');
        }
        return valid ? true : this.getMessage();
    }
});