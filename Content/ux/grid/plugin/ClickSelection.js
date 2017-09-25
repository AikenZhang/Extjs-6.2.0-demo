/* ***********************************************
 * author :  ***
 * function: 单击选中行
 * history:  created by *** 2015/7/2 15:56:45 
 * ***********************************************/
Ext.override(Ext.grid.Panel, {
    config: {
        clickSelection: null
    },
    publishes: ['selection', 'clickSelection'],
    twoWayBindable: ['selection', 'clickSelection']
});
Ext.define('Fm.ux.grid.plugin.ClickSelection', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.clickselection',
    isClickSelection: true,
    /*
     * 是否允许选中行切换选中状态
     */
    allowDeSelect: false,
    /*
     * 点击是否为单次点击（不能重复点击）
     */
    singleClick: false,
    init: function (grid) {
        if (grid.isLocked || grid.ClickSelection) {
            return;
        }
        var me = this;
        me.grid = grid;
        me.store = grid.getStore();
        me.clickSelection = this.grid.getClickSelection();
        me.grid.getView().on("refresh", this.deSelect, me);
        me.grid.on("beforeitemclick", this._updateClickSelection, me);
        me.grid.lastSelectRecordId = null;
        var orgFn = me.grid.getView().getRowClass;
        this.grid.getView().getRowClass = function () { };
        this.grid.getView().getRowClass = function (record, rowIndex, rowParams, store) {
            var cls = orgFn(record, rowIndex, rowParams, store) || '';
            if (me.grid.lastSelectRecordId && record.getId() === me.grid.lastSelectRecordId) {
                cls = cls + ' x-grid-record-click';
            }
            return cls;
        };
    },
    destroy: function () {
        if (this.grid && !this.grid.lockable) {
            this.grid.getView().un("refresh", this.deSelect);
            this.grid.un("itemclick", this._updateClickSelection);
        }
    },
    _updateClickSelection: function (gridView, record, c, d, e) {
        if (record.get('_isDisabled')) {
            return false;
        }
        var me = this,
            grid = me.grid,
            store = grid.getStore().store || grid.getStore(),
            selectChx,
            lastRecord;
        if (me.singleClick && grid.lastSelectRecordId === record.getId()) {
            return false;
        }
        if (grid.getSelectionModel) {
            selectChx = grid.getSelectionModel();
        }
        //SelectionModel为checkOnly时点击选择框不执行
        if (selectChx && selectChx.checkOnly && e.position.colIdx === selectChx.injectCheckbox) {
            return false;
        }

        if (me.allowDeSelect && grid.lastSelectRecordId === record.getId()) {
            grid.lastSelectRecordId = null;
            grid.setClickSelection(null);
        } else {
            if (grid.lastSelectRecordId !== null) {
                lastRecord = store.getById(grid.lastSelectRecordId);
            }
            grid.lastSelectRecordId = record.getId();
            grid.setClickSelection(record);
        }

        if (lastRecord) {
            lastRecord.set('_rowclassclick', !lastRecord.get('_rowclassclick'));
        }
        record.set('_rowclassclick', !record.get('_rowclassclick'));
        return true;
    },
    deSelect: function () {
        this._clearClickSelection();
    },
    _clearClickSelection: function () {
        var me = this,
            grid = me.grid,
            store = grid.getStore();
        try {
            if (grid.lastSelectRecordId) {
                if (store && !store.isEmptyStore) {
                    var rec = store.getById(grid.lastSelectRecordId);
                    if (rec) {
                        var row = grid.getView().getRow(rec);
                        if (row) {
                            Ext.get(row).removeCls('x-grid-record-click');
                        }
                    }
                }
                grid.lastSelectRecordId = null;
            }
        } catch (e) { }
        if (grid.setClickSelection) {
            grid.setClickSelection(null);
        }
    }
});