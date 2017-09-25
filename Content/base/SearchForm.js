/* ***********************************************
 * author :  ***
 * function: 搜索面板基类
 * history:  created by *** 2015/10/12 9:20:39 
 * ***********************************************/
Ext.define("Fm.base.SearchForm", {
    extend: 'Ext.form.Panel',
    alias: 'widget.base_searchform',
    modelValidation: true,
    bodyCls: 'cis-searh-panel',
    configKey: '',
    searchHandler: 'refresh',
    heights: {
        '1': 36,
        '2': 66,
        '3': 96,
        '4': 126,
        '5': 156,
        '6': 186,
        '7': 216,
        '8': 246,
        '9': 276,
        '10': 306
    },
    widths: {
        "1": 800,
        "2": 1000,
        "3": 1200
    },
    layout: {
        type: 'hbox',
        pack: 'start',
        align: 'stretch'
    },
    initComponent: function () {
        var me = this,
            isEdit = !!me.record,
            items,
            mainView = Ext.getCmp('ViewPortCoreTab'),
            mainWidth = mainView.getWidth(),
            resolutionIndex = mainWidth > 1200 ? 2 : (mainWidth > 1000 ? 1 : 0),
            conWidth = mainWidth < 1000 ? 800 : (mainWidth < 1200 ? 1000 : 1200);

        me._layouting = true;

        if (me.record) {
            me._setLayoutConfig(me.record);
            me.layoutConfig = me.record;
        } else {
            if (me.configs) {
                me.layoutConfigs = me.configs;
            } else {
                me.layoutConfigs = appFactory.Config.getFormItems(me.configKey);
            }
            for (var i = 0; i < me.layoutConfigs.length; i++) {
                me._setLayoutConfig(me.layoutConfigs[i]);
            }
            me.layoutConfig = me.layoutConfigs[resolutionIndex];
        }

        if (isEdit) {
            me.width = me.widths[me.layoutConfig.resolution.toString()];
            conWidth = me.width < 1000 ? 800 : (me.width < 1200 ? 1000 : 1200);
        }
        me.height = me.heights[me.layoutConfig.row.toString()] + (isEdit ? 1 : 0);

        me.items = [{
            xtype: 'panel',
            selfType: 'itemsContainer',
            layout: {
                type: 'table',
                columns: me.layoutConfig.col,
                itemCls: 'x_seachform_item'
            },
            width: conWidth,
            padding: 3,
            defaults: {
                margin: '3 0',
                width: 186,
                labelAlign: "right",
                labelWidth: 66
            },
            items: me.layoutConfig.items,
            dockedItems: [{
                dock: 'right',
                xtype: 'toolbar',
                layout: {
                    type: 'hbox',
                    align: 'middle'
                },
                width: 130,
                padding: '5 0 0 0',
                style: {
                    zIndex: 0
                },
                cls: 'cis-searh-panel',
                items: [{
                    margin: '0 0 0 5',
                    width: 70,
                    xtype: 'button',
                    text: '检索',
                    listeners: {
                        click: me.searchHandler
                    },
                    disabled: isEdit,
                    optype: 'search'
                }, {
                    width: 22,
                    margin: '0 0 0 5',
                    xtype: 'button',
                    hidden: !me.layoutConfig.isShowToggleBtn,
                    iconCls: 'fa fa-arrow-down cis-searchform-expand-btn',
                    optype: 'toggle',
                    style: {
                        backgroundColor: '#368ecc'
                    },
                    listeners: {
                        click: me._toggleHeight,
                        scope: me
                    }
                }]
            }]
        }, {
            xtype: 'container',
            flex: 1
        }];

        me.callParent(arguments);

        if (!isEdit && !AppConfig.Design.FixedResolution) {
            me.on('resize', me._updateLayout, me);
            me.on('afterlayout', function () {
                me._layouting = false;
            }, me);
        }
    },
    _toggleHeight: function () {
        var me = this,
            isEdit = !!me.record;

        if (!isEdit && !AppConfig.Design.FixedResolution) {
            me.un('resize', me._updateLayout, me);
        }
        var layoutConfig = me.layoutConfig,
            layout = me.down('panel[selfType=itemsContainer]').getLayout(),
            minHeight = me.heights[layoutConfig.row.toString()] + (isEdit ? 1 : 0),
            maxHeight = layout.table.getHeight() + 5,
            isExpand;

        if (minHeight > maxHeight) {
            minHeight = maxHeight;
        }
        isExpand = me.getHeight() !== minHeight;

        Ext.suspendLayouts();

        me.setHeight(isExpand ? minHeight : maxHeight);
        me.down('button[optype=toggle]').setIconCls(isExpand ? 'fa fa-arrow-down cis-searchform-expand-btn' : 'fa fa-arrow-up cis-searchform-expand-btn');

        Ext.resumeLayouts(true);
        if (!isEdit && !AppConfig.Design.FixedResolution) {
            me.on('resize', me._updateLayout, me);
        }
    },
    _updateLayout: function () {
        if (this._layouting || !this.configKey) {
            return;
        }
        this._layouting = true;

        var me = this,
            container = me.down('panel[selfType=itemsContainer]'),
            layout = container.getLayout(),
            isEdit = !!me.record,
            conWidth = me.getWidth(),
            resolutionIndex = conWidth > 1200 ? 2 : (conWidth > 1000 ? 1 : 0);

        me.layoutConfig = me.layoutConfigs[resolutionIndex];

        Ext.suspendLayouts();

        layout.setColumns(me.layoutConfig.col);

        Ext.Array.each(Ext.Array.filter(container.items.items, function (item) {
            return item.xtype === 'container';
        }), function (item) {
            container.remove(item);
        });

        var itemLength = 0,
            endColspan = false;
        Ext.Array.each(me.layoutConfig.items, function (newItem, index) {
            container.insert(index, Ext.Array.findBy(container.items.items, function (item) {
                return newItem.configIndex === item.configIndex;
            }) || newItem);

            var length = newItem.colspan || 1;
            if ((itemLength + 1) % me.layoutConfig.col === 0) {
                endColspan = endColspan || length > 1;
                length = 1;
            }
            itemLength += length;
        });

        container.setWidth(conWidth < 1000 ? 800 : (conWidth < 1200 ? 1000 : 1200));
        me.setHeight(me.heights[me.layoutConfig.row.toString()] + (isEdit ? 1 : 0));

        var btnToggle = me.down('button[optype=toggle]');
        btnToggle.setHidden(!me.layoutConfig.isShowToggleBtn);

        Ext.resumeLayouts(true);
    },
    _setLayoutConfig: function (config) {
        var itemLength = 0,
            maxRowCount = 0;
        Ext.Array.each(config.items, function (newItem, index) {
            var length = newItem.colspan || 1;
            if ((itemLength + 1) % config.col === 0) {
                length = 1;
            }
            itemLength += length;
        });
        config.maxRow = Math.ceil(itemLength / config.col);
        config.isShowToggleBtn = config.maxRow > config.row;

        //增加键盘enter事件
        Ext.Array.each(config.items, function (i) {
            i.labelPad = 0;
            var setEventFn = function (control) {
                if (!control.listeners) {
                    control.listeners = {};
                }
                control.listeners['specialkey'] = function (field, e) {
                    if (e.getKey() == e.ENTER) {
                        var form = field.up('base_searchform').down('button[optype=search]').fireEvent('click');
                    }
                }
                control.labelPad = 0;
            }
            if (i.items && i.items.length > 0) {
                Ext.Array.each(i.items, function (control) {
                    control.margin = 0;
                    setEventFn(control);
                });
            } else {
                setEventFn(i);
            }
        });
    }
});