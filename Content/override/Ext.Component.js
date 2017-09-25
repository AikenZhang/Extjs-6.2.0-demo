/* ***********************************************
 * author :  ***
 * function: 
 * history:  created by *** 2015/11/18 15:41:16 
 * ***********************************************/
Ext.override(Ext.Component, {
    responsiveFormulas: {
        'w800': function (context) {
            var leftWidth = (Cookie.get("main-left-panel-micro").toString() === 'true' ? AppConfig.Design.Menu.MinWidth : AppConfig.Design.Menu.MaxWidth);
            return context.width - leftWidth < 1000;
        },
        'w1000': function (context) {
            var leftWidth = (Cookie.get("main-left-panel-micro").toString() === 'true' ? AppConfig.Design.Menu.MinWidth : AppConfig.Design.Menu.MaxWidth);
            return context.width - leftWidth >= 1000 && context.width - leftWidth < 1200;
        },
        'w1200': function (context) {
            var leftWidth = (Cookie.get("main-left-panel-micro").toString() === 'true' ? AppConfig.Design.Menu.MinWidth : AppConfig.Design.Menu.MaxWidth);
            return context.width - leftWidth >= 1200;
        }
    },
    config: { selfConfig: null },
    resetAll: function () {
        var me = this,
            forms = me.query('form'),
            grids = me.query('grid,dataview');
        try {
            var dateFields = [];
            if (me.isForm && !me.isIgnoreReset) {
                me.reset(true);
                if (me.fireEvent) {
                    me.fireEvent('resetallvalue', me);
                }
                dateFields = me.query('datefield');
            }
            Ext.Array.each(forms, function (item) {
                if (!item.isIgnoreReset) {
                    item.reset(true);
                    if (item.fireEvent) {
                        item.fireEvent('resetallvalue', item);
                    }
                    dateFields = Ext.Array.merge(dateFields, item.query('datefield'));
                }
            });
            Ext.Array.each(dateFields, function (field) {
                field.fireEvent('resetminmaxvalue', field);
            });
            Ext.Array.each(grids, function (item) {
                var s = item.getStore();
                if (s && !s.isEmptyStore && s.clearAll && !s.isIgnoreReset) {
                    s.clearAll();
                    s.clearFilter();
                }
            });
        } catch (e) { }
    },
    initComponent: function () {
        var me = this,
            width = me.width,
            height = me.height;
        if (me.fieldLabel && me.up('base_searchform')) {
            var _fl = (me.fieldLabel || '').toString();
            var sLength = _fl.trim().length + (_fl.match(/[^x00-xff]/g) || []).length;
            if (sLength > 8) {
                me.labelWidth = AppConfig.Design.SearchPanel.Items.LabelWidth + (sLength - 8) * 6;
            }
        }
        try {
            // If plugins have been added by a subclass's initComponent before calling up to here (or any components
            // that don't have a table view), the processed flag will not have been set, and we must process them again.
            // We could just call getPlugins here however most components don't have them so prevent the extra function call.
            if (me.plugins && !me.plugins.processed) {
                me.plugins = me.constructPlugins();
            }
            me.pluginsInitialized = true;

            // this will properly (ignore or) constrain the configured width/height to their
            // min/max values for consistency.
            if (width != null || height != null) {
                me.setSize(width, height);
            }

            if (me.listeners) {
                me.on(me.listeners);
                me.listeners = null; //change the value to remove any on prototype
            }

            if (me.focusable) {
                me.initFocusable();
            }
        } catch (e) {
            Ext.log.error(e.stack);
        }
    }
});