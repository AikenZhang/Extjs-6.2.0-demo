/* ***********************************************
 * author :  ***
 * function: 
 * history:  created by *** 2015/12/21 13:22:38 
 * ***********************************************/
Ext.override(Ext.data.field.Date, {
    convert: function (v) {
        if (!v) {
            return null;
        }

        if (v instanceof Date) {
            return v;
        }

        if (Ext.isString(v)) {
            return new Date([v.replace(/-/g, '/').replace(/T|Z/g, ' ')]);
        }

        return this.callParent(arguments);
    }
});