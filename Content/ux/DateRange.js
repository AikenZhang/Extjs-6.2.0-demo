/* ***********************************************
 * author :  ***
 * function: 日期联动控件
 * history:  created by *** 2015/6/9 15:12:18 
 * ***********************************************/
Ext.define('Fm.ux.DateRange', {
    extend: 'Ext.form.FieldContainer',
    alias: 'widget.daterange',
    requires: [
        'Ext.form.field.Date'
    ],
    fieldLabel: '日期范围',
    width: 330,
    labelWidth: 60,
    layout: 'column',
    labelAlign: 'right',
    defaults: {
        width: 120,
        labelWidth: 60,
        xtype: 'datefield',
        labelAlign: 'right'
    },

    /**
     * 日期比较部分
     */
    addTnterval: Ext.Date.MONTH,

    /**
     * 日期差值 配合 addTnterval
     */
    addValue: 1,

    /**
     * 联动模式 's-e'为开始时间联动结束时间 'e-s'为结束时间联动开始时间
     */
    addModel: ['s-e'],

    disableLD: false,

    //是否验证结束日期大于开始日期
    isValidateMoreThen: true,

    initComponent: function () {
        var me = this,
            starDate,
            endDate,
            temp = new Date().getTime();

        Ext.apply(me.items[0], {
            width: 95,
            itemId: 'startdt' + temp,
            endDateField: 'enddt' + temp,
            vtype: 'daterange',
            validateOnChange: false,
            isRequirsResetMaxMinValue: true
        });

        Ext.apply(me.items[1], {
            width: 100,
            itemId: 'enddt' + temp,
            //startDateField: 'startdt' + temp,
            vtype: 'daterange',
            fieldLabel: '-',
            errorfieldLabel: '结束日期',
            labelWidth: 5,
            labelSeparator: '',
            labelAlign: 'right',
            style: {
                //两个时间框中间'-'居中
                marginLeft: '3px;'
            },
            isRequirsResetMaxMinValue: true
        });

        me.callParent();

        starDate = me.items.items[0],
        endDate = me.items.items[1];

        //先判断change事件是否存在，如果存在，则在change事件追加事件处理
        //if (!starDate.hasListener('change')) {
        //    starDate.on('change', me.autoFormat);
        //} else {
        //    starDate.onAfter('change', me.autoFormat);
        //}

        //if (!endDate.hasListener('change')) {
        //    endDate.on('change', me.autoFormat);
        //} else {
        //    endDate.onAfter('change', me.autoFormat);
        //}

        //联动
        if (Ext.Array.contains(me.addModel, 's-e')) {
            var tempFn = function (obj) {
                if (me.disableLD) {
                    return;
                }
                var date = obj.getValue();
                if (!date || !Ext.isDate(date)) {
                    return;
                }

                var endValue = Ext.Date.add(date, me.addTnterval, me.addValue);

                //如果按月加,则需要减1天
                if (me.addTnterval === Ext.Date.MONTH) {
                    endDate.setValue(Ext.Date.add(endValue, Ext.Date.DAY, -1));
                    endDate.fireEvent('updatebind', Ext.Date.add(endValue, Ext.Date.DAY, -1));
                }
                else {
                    endDate.setValue(endValue);
                    endDate.fireEvent('updatebind', endValue);
                }
            };
            setTimeout(function () {
                starDate.on('blur', tempFn);
                starDate.on('select', tempFn);
            }, 500);
        }
        if (Ext.Array.contains(me.addModel, 'e-s')) {
            var tempFn = function (obj) {
                if (me.disableLD) {
                    return;
                }
                var date = obj.getValue();
                if (!date || !Ext.isDate(date)) {
                    return;
                }
                var startValue = Ext.Date.add(date, me.addTnterval, me.addValue * -1);
                starDate.setValue(startValue);
                starDate.fireEvent('updatebind', startValue);
            }
            setTimeout(function () {
                endDate.on('blur', tempFn);
                endDate.on('select', tempFn);
            }, 500);
        }
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
        var value
        dateRange = obj.up('daterange');

        if (newValue) {
            var isAlreadyDate = dateRange.checkDate(newValue);
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
