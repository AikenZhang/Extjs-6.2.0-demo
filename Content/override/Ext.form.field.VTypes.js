/* ***********************************************
 * author :  fei85
 * function: 
 * history:  created by fei85 2016/1/22 9:48:19 
 * ***********************************************/
Ext.override(Ext.form.field.VTypes, {
    //日期 验证范围
    daterange: function (val, field) {
        var date = field.parseDate(val);

        if (!date) {
            return false;
        }
        //if (field.startDateField && (!this.dateRangeMax || (date.getTime() != this.dateRangeMax.getTime()))) {
        //    var start = field.up('daterange').down('#' + field.startDateField) || Ext.getCmp(field.startDateField);
        //    start.setMaxValue(date);
        //    //start.validate();
        //    this.dateRangeMax = date;
        //}
        //else if (field.endDateField && (!this.dateRangeMin || (date.getTime() != this.dateRangeMin.getTime()))) {
        //    var end = field.up('daterange').down('#' + field.endDateField) || Ext.getCmp(field.endDateField);
        //    end.setMinValue(date);
        //    //end.validate();
        //    this.dateRangeMin = date;
        //}

        if (field.startDateField && (!this.dateRangeMax || (date.getTime() != this.dateRangeMax.getTime()))) {
            var start = field.up('daterange').down('#' + field.startDateField) || Ext.getCmp(field.startDateField);
            if (!(start.picker && !start.picker.setMaxValue)) {
                start.setMaxValue(date);
            }
            //start.validate();
            this.dateRangeMax = date;
        }
        else if (field.endDateField) {
            var end = field.up('daterange').down('#' + field.endDateField) || Ext.getCmp(field.endDateField);
            if (!(end.picker && !end.picker.setMinValue)) {
                end.setMinValue(date);
            }
        }

        return true;
    },
    daterangeText: '开始日期必须小于结束日期',
    numberrange: function (val, field) {
        var num = parseFloat(val);
        if (field.startNumberField) {
            var sd = field.up('fieldcontainer').down('#' + field.startNumberField) || Ext.getCmp(field.startNumberField);
            sd.maxValue = num;
        }
        else if (field.endNumberField) {
            var ed = field.up('fieldcontainer').down('#' + field.endNumberField) || Ext.getCmp(field.endNumberField);
            ed.minValue = num;
        }
        return true;
    }
});