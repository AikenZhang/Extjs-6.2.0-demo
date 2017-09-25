/* ***********************************************
 * author :  ***
 * function: 解决CheckboxGroup和RadioGroup的绑定格式问题
 * history:  created by *** 2015/9/29 14:20:11 
 * ***********************************************/
Ext.override(Ext.form.CheckboxGroup, {
    twoWayBindable: ['value'],
    defaultBindProperty: 'value',
    valuePublishEvent: 'updatebindvalue',
    getValue: function () {
        var values = [],
            boxes = this.getBoxes(),
            box,
            inputValue;

        for (var b = 0; b < boxes.length; b++) {
            box = boxes[b];
            inputValue = box.inputValue;
            if (box.getValue()) {
                values.push(inputValue);
            }
        }

        return values;
    },
    checkChange: function (box, newValue) {
        this.fireEvent('updatebindvalue');
        //this.callParent(arguments);
    },
    setValue: function (value) {
        if (value === null || value === undefined || !Ext.isArray(value)) {
            return;
        }

        var me = this,
            boxes = me.getBoxes(),
            values = me.values,
            b,
            bLen = boxes.length,
            box, name,
            cbValue;

        me.batchChanges(function () {
            Ext.suspendLayouts();
            for (b = 0; b < bLen; b++) {
                box = boxes[b];
                cbValue = false;

                if (value) {
                    if (Ext.isArray(value)) {
                        cbValue = Ext.Array.contains(value, box.inputValue);
                    } else {
                        cbValue = value;
                    }
                }
                box.setValue(cbValue);
            }
            Ext.resumeLayouts(true);
        });

        return me;
    }
});

Ext.override(Ext.form.RadioGroup, {
    valuePublishEvent: 'updatebindvalue',
    checkChange: function () {
        this.fireEvent('updatebindvalue');
        //var value = this.getValue(),
        //    key = Ext.Object.getKeys(value)[0];
        //// If the value is an array we skip out here because it's during a change
        //// between multiple items, so we never want to fire a change
        //if (Ext.isArray(value[key])) {
        //    return;
        //}
        //this.callParent(arguments);
    },
    getValue: function () {
        var value = null,
            boxes = this.getBoxes(),
            box,
            inputValue;

        for (var b = 0; b < boxes.length; b++) {
            box = boxes[b];
            inputValue = box.inputValue;
            if (box.getValue() === true) {
                value = inputValue;
            }
        }

        return value;
    },
    setValue: function (value) {
        if (value === null || value === undefined) {
            return;
        }
        var me = this,
            radios = me.getBoxes(),
            radio;

        Ext.suspendLayouts();
        for (var i = 0; i < radios.length; ++i) {
            radio = radios[i];
            if (value === radio.inputValue) {
                radio.setValue(true);
            } else {
                radio.setValue(false);
            }
        }
        Ext.resumeLayouts(true);

        return me;
    }
});
