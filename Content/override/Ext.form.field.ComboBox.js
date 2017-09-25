/* ***********************************************
 * author :  ***
 * function: 添加全局清除按钮
 * history:  created by *** 2015/9/24 14:16:30 
 * ***********************************************/
Ext.override(Ext.form.field.ComboBox, {
    editable: false,
    showClearTriggers: true,
    emptyText: '全部',
    singleIsArray:false,
    applyTriggers: function (triggers) {
        var me = this,
            picker = triggers.picker,
            newTriggers = {};

        if (picker && !picker.cls) {
            picker.cls = me.triggerCls;
        }

        //if (me.showClearTriggers && me.multiSelect) {
        if (me.showClearTriggers) {
            newTriggers["clear"] = {
                cls: 'cisapp-form-field-clear',
                renderTpl: '<div id="{triggerId}" class="{baseCls} {baseCls}-{ui} {cls}"></div>',
                handler: function () {
                    if (this.clearValue) {
                        this.clearValue();
                    }
                    if (this.clearTreeChecked) {
                        this.clearTreeChecked();
                    }
                    me.fireEvent('change', me);
                },
                scope: 'this'
            };
        }
        for (var t in triggers) {
            newTriggers[t] = triggers[t];
        }
        return me.callParent([newTriggers]);
    },
    getValue: function () {
        var me = this;

        var value = me.callParent(arguments);

        if (!me.multiSelect && me.singleIsArray && value){
            return [value];
        }
        return value;
    }
});