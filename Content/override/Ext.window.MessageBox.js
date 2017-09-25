/* ***********************************************
 * author :  ***
 * function: 
 * history:  created by *** 2016/1/4 11:05:17 
 * ***********************************************/
Ext.override(Ext.window.MessageBox, {
    //调整弹出框的大小
    prompt: function (title, message, fn, scope, multiline, value) {
        if (Ext.isString(title)) {
            title = {
                prompt: true,
                title: title,
                minWidth: this.minPromptWidth,
                message: message,
                buttons: this.OKCANCEL,
                callback: fn,
                scope: scope,
                multiline: multiline,
                value: value,
                width: 360,
                height:180
            };
        }
        return this.show(title);
    }
});