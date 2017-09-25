/* ***********************************************
 * author :  苗建龙
 * function: 表格分组头部添加全选功能
 * history:  created by 苗建龙 2015/8/8 15:56:45 
 * ***********************************************/
Ext.define('Fm.ux.grid.feature.Grouping', {
    extend: 'Ext.grid.feature.Grouping',
    alias: 'feature.cisgrouping',
    checkCls: Ext.baseCSSPrefix + 'grid-group-checked',
    groupHeaderTpl: '{columnName}: {name}',
    checkSelector: Ext.baseCSSPrefix + 'grid-group-checked-select',
    /**
     * 是否显示全选按钮
     */
    isShowCheck: true,

    init: function (grid) {
        var me = this;

        if (me.isShowCheck) {
            me.groupHeaderTpl = [
                '<i class="{checkedCls} ' + me.checkSelector +
                '" data-groupName-check="{name:htmlEncode}"></i>' +
                me.groupHeaderTpl
            ];
        }

        me.callParent([grid]);

        if (me.isShowCheck) {
            grid.on({
                'select': me.groupCheckedChange,
                'deselect': me.groupDeCheckedChange,
                scope: me
            });

            grid.getSelectionModel().on({
                'selectAll': me.groupCheckedAllChange,
                'deselectAll': me.groupDeCheckedAllChange,
                'updateGroupSelect': me.groupFristCheckedChange,
                scope: me
            });
        }
    },
    //afterViewRender: function () {
    //    var me = this,
    //        view = me.view;

    //    me.callParent(arguments);

    //    if (me.isShowCheck) {
    //        var gridStore = me.getGridStore();
    //        if (gridStore.isLoaded()) {
    //            me.groupFristCheckedChange()
    //        }
    //        me.getGridStore().on({
    //            'load': me.groupFristCheckedChange,
    //            scope: me
    //        });
    //    }
    //},

    getGridStore: function () {
        return this.view.getStore() || this.view.selModel.store;
    },

    /**
     * 表格行全选事件  更新分组全选切换按钮的状态
     */
    groupFristCheckedChange: function () {
        var me = this,
        store = me.getGridStore(),
        groups = store.getGroups().items;

        for (var i = 0; i < groups.length; i++) {
            me.doUpdateGroupCheckedHead(groups[i].getGroupKey(), null);
        }
    },

    /**
     * 表格行选中事件  更新分组全选切换按钮的状态
     */
    groupCheckedChange: function (obj, record) {
        var me = this,
            groupName = me.getGridStore().getGrouper().getGroupString(record);

        me.doUpdateGroupCheckedHead(groupName, null);
    },
    /**
     * 表格行全选事件  更新分组全选切换按钮的状态
     */
    groupCheckedAllChange: function (obj, record) {
        var me = this,
        store = this.getGridStore(),
        groups = store.getGroups().items;

        for (var i = 0; i < groups.length; i++) {
            me.doUpdateGroupCheckedHead(groups[i].getGroupKey(), true);
        }
    },

    /**
     * 表格行取消选中事件  更新分组全选切换按钮的状态
     */
    groupDeCheckedChange: function (obj, record) {
        var me = this,
            groupName = me.getGridStore().getGrouper().getGroupString(record);

        me.doUpdateGroupCheckedHead(groupName, false);
    },

    /**
     * 表格取消全选事件  更新分组全选切换按钮的状态
     */
    groupDeCheckedAllChange: function (obj, record) {
        var me = this,
        store = this.getGridStore(),
        groups = store.getGroups().items;
        for (var i = 0; i < groups.length; i++) {
            me.doUpdateGroupCheckedHead(groups[i].getGroupKey(), false);
        }
    },

    /**
     * 更新分组全选切换按钮的状态
     */
    doUpdateGroupCheckedHead: function (groupName, checked) {
        var me = this,
            group,
            selection,
            checkedNode;

        if (checked === null) {
            checked = true;
            group = me.getGroup(groupName);
            selection = me.grid.getSelectionModel();

            Ext.each(group.items, function (item) {
                if (!selection.isSelected(item)) {
                    checked = false;
                    return false;
                }
            });
        }
        me.getCache()[groupName].isCheckedSub = checked;

        Ext.suspendLayouts();
        if (me.dataSource && me.dataSource.onRefresh) {
            me.dataSource.onRefresh();
        }
        else if (me.dataSource && me.dataSource.onDataChanged) {
            me.dataSource.onDataChanged();
        }
        Ext.resumeLayouts(true);
    },

    /**
     * 分组全选切换
     */
    doSetGroupChecked: function (groupName, checked) {
        var me = this;
        me.grid.mask('......');
        setTimeout(function () {
            Ext.suspendLayouts();
            var selection = me.grid.getSelectionModel();
            var start = selection.getSelection().length;
            selection.suspendChanges();
            if (checked) {
                selection.select(me.getGroup(groupName).items, true, true);
            } else {
                var delArr = me.getGroup(groupName).items;
                if (delArr.length > 100) {
                    //优化速度 解决卡死问题
                    var arr = Ext.Array.difference(selection.getSelection(), me.getGroup(groupName).items);
                    selection.deselectAll(true);
                    selection.select(arr, true, true);
                    me.groupFristCheckedChange();
                } else {
                    selection.deselect(me.getGroup(groupName).items, true);
                }
            }
            selection.resumeChanges();

            if (!selection.destroyed) {
                selection.maybeFireSelectionChange(selection.getSelection().length !== start);
            }

            me.doUpdateGroupCheckedHead(groupName, checked);
            Ext.resumeLayouts(true);
            me.grid.unmask();
        }, 10);
    },

    /**
     * Toggle between expanded/collapsed state when clicking on
     * the group.
     * @private
     */
    onGroupClick: function (view, rowElement, groupName, e) {
        var me = this,
            metaGroupCache = me.getCache(),
            target;

        if (me.isShowCheck) {
            target = Ext.get(e.target);
            if (target.hasCls(me.checkSelector)) {
                me.doSetGroupChecked(groupName, !metaGroupCache[groupName].isCheckedSub);
                metaGroupCache[groupName].isCheckedSub = !metaGroupCache[groupName].isCheckedSub;
                e.stopEvent();
            } else {
                me.callParent(arguments);
            }
        } else {
            me.callParent(arguments);
        }
    },

    /**
     * 初始化全选切换按钮的样式
     */
    setupRowData: function (record, idx, rowValues) {
        this.callParent(arguments);

        var me = this,
            data = me.refreshData,
            groupRenderInfo = rowValues.groupRenderInfo;

        if (data.doGrouping) {
            if (rowValues.isFirstRow) {
                var temp = me.getMetaGroup(rowValues.groupName);
                if (temp.isCheckedSub) {
                    if (rowValues.metaGroupCache) {
                        rowValues.metaGroupCache.checkedCls = me.checkCls;
                    }
                    if (groupRenderInfo) {
                        groupRenderInfo.checkedCls = me.checkCls;
                    }
                } else {
                    if (rowValues.metaGroupCache) {
                        rowValues.metaGroupCache.checkedCls = me.checkCls + '-no';
                    }
                    if (groupRenderInfo) {
                        groupRenderInfo.checkedCls = me.checkCls + '-no';
                    }
                }
            }
        }
    }
});
