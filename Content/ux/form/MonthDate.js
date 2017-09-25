/* ***********************************************
 * author :  ***
 * function: 月份选择控件
 * history:  created by *** 2015/6/9 15:12:18 
 * ***********************************************/
Ext.define('Fm.ux.form.MonthDate', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.monthdatefield',
    requires: ['Ext.picker.Month'],
    alternateClassName: ['Ext.form.MonthDateField', 'Ext.form.MonthDate'],
    format: 'Y-m',
    createPicker: function () {
        var me = this,
        format = Ext.String.format,
        pickerConfig, monthPickerOptions;
        if (me.okText) {
            monthPickerOptions = monthPickerOptions || {};
            monthPickerOptions.okText = me.okText;
        }
        if (me.cancelText) {
            monthPickerOptions = monthPickerOptions || {};
            monthPickerOptions.cancelText = me.cancelText;
        }

        pickerConfig = {
            ownerCmp: me,
            floating: true,
            hidden: true,
            small: true,
            listeners: {
                scope: me,
                cancelclick: me.collapse,
                okclick: me.onMonthSelect,
                yeardblclick: me.onMonthSelect,
                monthdblclick: me.onMonthSelect
            },
            keyNavConfig: {
                esc: function () {
                    me.collapse();
                }
            }
        };
        //if (Ext.isChrome) {
        me.originalCollapse = me.collapse;
        pickerConfig.listeners.show = {
            fn: function () {
                this.picker.el.on({
                    mousedown: function () {
                        this.collapse = Ext.emptyFn;
                    },
                    mouseup: function () {
                        this.collapse = this.originalCollapse;
                    },
                    scope: this
                });
            }
        }
        //}
        if (me.pickerOptions) {
            Ext.apply(pickerConfig, me.pickerOptions, monthPickerOptions || {});
        }
        return Ext.create('Ext.picker.Month', pickerConfig);
    },
    onMonthSelect: function (picker, value) {
        var me = this;
        var me = this,
        month = value[0],
        year = value[1],
        date = new Date(year, month, 1);
        if (date.getMonth() !== month) {
            date = new Date(year, month, 1).getLastDateOfMonth();
        }
        me.setValue(date);
        me.fireEvent('select', me, date);
        me.collapse();
    }
});