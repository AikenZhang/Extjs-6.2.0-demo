/* ***********************************************
 * author :  ***
 * function: 
 * history:  created by *** 2015/7/3 10:04:59 
 * ***********************************************/
Ext.override(Ext.data.validator.Email, {
    config: {
        message: '该输入项必须是电子邮件地址，格式如： "user@example.com"'
    }
});

Ext.override(Ext.data.validator.Length, {
    config: {
        minOnlyMessage: '长度必须大于 {0}',
        maxOnlyMessage: '长度不能超过 {0}',
        bothMessage: '长度必须为 {0}到{1}'
    }
});

//BitLength验证 中文占两个字节
Ext.define('Ext.data.validator.ByteLength', {
    extend: 'Ext.data.validator.Bound',
    alias: 'data.validator.bytelength',

    type: 'bytelength',

    config: {
        maxOnlyMessage: '长度不能超过 {0}个字符(一个汉字算两个字符)'
    },

    getValue: function (v) {
        var _temp = String(v);
        return _temp.length + (_temp.match(/[^x00-xff]/g) || []).length;
    }
});