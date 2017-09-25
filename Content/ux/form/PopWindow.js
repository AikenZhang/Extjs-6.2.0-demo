/* ***********************************************
 * author :  韩奎奎
 * function: 公共弹出框备用
 * history:  created by  韩奎奎 2015/8/9 15:12:18 
 * ***********************************************/
Ext.define('Fm.ux.form.PopWindow', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.popwindowfield',

    //当pickerType为window时，设置小图标样式
    triggerCls : Ext.baseCSSPrefix + 'cis-window-trigger',

    multiSelect: true,
    // 多选时可以显示清空按扭
    showClearTriggers: true,

    clearValue: function () {
        this.setValue([]);
    },
    onTriggerClickPopWindow: function () {
        var me = this,
            win;

        win = new Ext.window.Window({
            title: me.fieldLabel,
            height: me.winHeight,
            width: me.winWidth,
            modal: true,
            layout: 'fit',
            items: [me.innerGrid],
            bbar: ['->',
                {
                text: '全选',
                handler: 'onExpandAll',
                bind: {
                    hidden: '{singleSelected}'
                }
            },{
                text: '取消选中',
                handler: 'cancelCheck',
                bind: {
                    hidden: '{singleSelected}'
                }
            },{
                text: '选择',
                handler: function () {
                    var me = this;

                    me.setValue('ssss');
                    me.close();
                }
            },{
                text: '取消',
                handler: 'cancel'
            }],
            listeners: {
                scope: me,
                close: me.onClose,
                select: me.onSelect
            }
        });

        win.show();
    },
    initComponent: function () {
        var me = this;
        triggers = me.getTriggers();

        //当pickerType为window时，设置小图标样式
        if (me.pickerType !== 'window') {
            me.triggerCls = null
        }

        triggers["picker"] = {
            weight: 1,
            handler: 'onTriggerClick',
            scope: 'this'
        };

        me.setTriggers(triggers)

        me.callParent();
    },

    onTriggerClick: function (e) {
        var me = this;

        if (me.pickerType === 'window') {

            me.onTriggerClickPopWindow()
        } 
        else {
            if (!me.readOnly && !me.disabled) {
                if (me.isExpanded) {
                    me.collapse();
                } else {
                    me.expand();
                }
            }
        }
    },

    initValue: function () {
        var me = this,
            value = me.value;

        // If a String value was supplied, try to convert it to a proper Date
        if (Ext.isString(value)) {
            me.value = me.rawToValue(value);
        }

        me.callParent();
    },

    onClose: function () {
        var me = this;
        me.collapse();

        me.setValue('关闭弹出窗口');
    },

    createPicker: function () {
        var me = this,
            picker;

        me.store = me.innerGrid.store;

        var me = this,

        picker = me.picker = me.getGridPicker();
        if (me.pageSize) {
            picker.pagingToolbar.on('beforechange', me.onPageChange, me);
        }

        // We limit the height of the picker to fit in the space above
        // or below this field unless the picker has its own ideas about that.
        if (!picker.initialConfig.maxHeight) {
            picker.on({
                beforeshow: me.onBeforePickerShow,
                scope: me
            });
        }
        picker.getSelectionModel().on({
            beforeselect: me.onBeforeSelect,
            beforedeselect: me.onBeforeDeselect,
            scope: me
        });

        picker.getNavigationModel().navigateOnSpace = false;

        return picker;
    },
    getGridPicker: function () {
        var me = this;

        var pickerConfig = Ext.apply(me.innerGrid, {
            pickerField: me,
            hidden: true,
            store: me.getPickerStore(),
            displayField: me.displayField,
            preserveScrollOnRefresh: true,
            pageSize: me.pageSize,
            selModel: me.pickerSelectionModel,
            floating: true,
            minWidth: me.minPickerWidth,
            minHeight: me.minPickerHeight,
            maxHeight: me.maxPickerHeight,
            autoScroll: true,
            listeners: {
                itemclick: {
                    fn: me.onItemClick
                }
            },
            refresh: function () { }
        });

        //解决火狐下点击选择框关闭的问题
        me.originalCollapse = me.collapse;
        pickerConfig.listeners.show = {
            fn: function () {
                me.picker.el.on({
                    mousedown: function () {
                        this.collapse = Ext.emptyFn;
                    },
                    mouseup: function () {
                        this.collapse = this.originalCollapse;
                    },
                    scope: me
                });
            }
        }

        var picker;

        picker = Ext.ComponentManager.create(Ext.isFunction(pickerConfig) ? pickerConfig.call() : pickerConfig, "panel");

        return picker;
    },
    onSelect: function (m, d) {
        var me = this;
        me.setValue(d);
        me.fireEvent('select', me, d);
        me.collapse();
    },

    /**
     * Sets the Date picker's value to match the current field value when expanding.
     */

    onArrowKey: function (direction, e) {
        if (direction === 'left' || direction === 'right') {
            // Don't move the cursor in the field while we're navigating
            // the picker.
            e.preventDefault();
        }
    }
});