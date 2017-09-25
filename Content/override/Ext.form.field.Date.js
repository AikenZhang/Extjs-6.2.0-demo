/* ***********************************************
 * author :  ***
 * function: 
 * history:  created by *** 2015/12/11 13:21:06 
 * ***********************************************/

//解决IE下 resetall导致日期控件报错的问题
//Ext.Date.getShortMonthName = function (month) {
//    if (!month) {
//        month = 0;
//    }
//    return Ext.Date.monthNames[month].substring(0, 3);
//};

Ext.override(Ext.form.field.Date, {
    format: 'Y-m-d',
    formatText: '日期格式要求为: 年-月-日',
    invalidText: "{0} 是无效的日期 必须符合格式：年-月-日",
    valuePublishEvent: ['select', 'blur', 'updatebind'],
    validateOnChange: false,
    isRequirsResetMaxMinValue: false,
    initComponent: function () {
        var me = this;

        me.callParent();

        //重写验证机制
        var validateEvents = ['blur', 'select', 'validateforreset'];
        var validateFn = function (field, e) {
            me.validate();
        }
        Ext.Array.each(validateEvents, function (eventName) {
            me.on(eventName, validateFn);
        });
        me.on('specialkey', function (field, e) {
            if (e.getKey() == e.ENTER) {
                me.validate();
            }
        });

        //先判断change事件是否存在，如果存在，则在change事件追加事件处理
        if (!me.hasListener('change')) {
            me.on('change', me.autoFormat);
        } else {
            me.onAfter('change', me.autoFormat);
        }

        //重置最大最小值
        var resetFn = function () {
            var field = me;
            if (field.isRequirsResetMaxMinValue) {
                //var minDate = field.parseDate('1700-01-01');
                field.setMinValue(0);
                //this.dateRangeMin = minDate;

                //var maxDate = Ext.Date.add(Fm.Common.Util.getNowDate(), Ext.Date.YEAR, 100);
                field.setMaxValue(0);
                //this.dateRangeMax = maxDate;
            }
        }
        me.on('resetminmaxvalue', resetFn);
    },
    checkDate: function (date) {
        if (date instanceof Date) {
            return true;
        }
        if (date) {
            return (new Date(date).getDate() == date.toString().substring(date.length - 2));
        }
        return false;
    },
    autoFormat: function (obj, newValue) {
        var value;

        if (newValue) {
            var isAlreadyDate = this.checkDate(newValue);
            if (!isAlreadyDate) {
                dateString = newValue.toString().replace(/-/g, '');
                switch (dateString.length) {
                    case 5:
                        value = dateString.substr(0, 4) + '-' + dateString.substr(4, 1);
                        break;
                    case 6:
                        value = dateString.substr(0, 4) + '-' + dateString.substr(4, 2);
                        break;
                    case 7:
                        var value = dateString.substr(0, 4) + '-' + dateString.substr(4, 2) + '-' + dateString.substr(6, 1);
                        break;
                    case 8:
                        value = dateString.substr(0, 4) + '-' + dateString.substr(4, 2) + '-' + dateString.substr(6, 2);
                        obj.fireEvent('blur', obj);
                        break;
                    default:
                        return;
                }
                obj.setRawValue(value);
            } else {
                if (obj.rawValue.length === 10) {
                    obj.fireEvent('blur', obj);
                }
            }
        }
    }
});