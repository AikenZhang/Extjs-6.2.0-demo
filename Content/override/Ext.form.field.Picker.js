/* ***********************************************
 * author :  ***
 * function: 解决下拉框位置偏移(导致页面布局错乱)的问题
 * history:  created by *** 2015/9/25 13:36:27 
 * ***********************************************/
Ext.override(Ext.form.field.Picker, {
    doAlign: function () {
        var me = this,
            picker = me.picker,
            aboveSfx = '-above',
            isAbove;

        // Align to the trigger wrap because the border isn't always on the input element, which
        // can cause the offset to be off
        //me.picker.alignTo(me.triggerWrap, me.pickerAlign, me.pickerOffset);
        // add the {openCls}-above class if the picker was aligned above
        // the field due to hitting the bottom of the viewport
        isAbove = picker.el.getY() < me.inputEl.getY();
        me.bodyEl[isAbove ? 'addCls' : 'removeCls'](me.openCls + aboveSfx);
        picker[isAbove ? 'addCls' : 'removeCls'](picker.baseCls + aboveSfx);

        var xy = me.triggerWrap.getXY(),
            viewPort = Ext.Element,
            isReset = false;

        xy[1] = xy[1] + me.getHeight();
        //if (picker.getX() + picker.getWidth() > viewPort.getViewportWidth()) {
        if (xy[0] + picker.getWidth() > viewPort.getViewportWidth()) {
            xy[0] = viewPort.getViewportWidth() - picker.getWidth();
        }
        if (xy[1] + picker.getHeight() > viewPort.getViewportHeight()) {
            xy[1] = xy[1] - picker.getHeight() - me.getHeight();
        }
        //isReset = true;
        //}

        //if (isReset) {
        me.picker.setXY(xy);
        //}
    }
});