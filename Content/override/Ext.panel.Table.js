/* ***********************************************
 * author :  fei85
 * function: 
 * history:  created by fei85 2016/9/21 9:48:17 
 * ***********************************************/
Ext.override(Ext.panel.Table, {
    //增加行的可用不可用设置
    setDisabled: function (records) {
        var me = this,
            view = me.getView();
        Ext.suspendLayouts();
        Ext.Array.each(records, function (item) {
            item.set({ _isDisabled: true });
        });
        Ext.resumeLayouts(true);
    },
    //修改bind selection多选的问题
    updateBindSelection: function (selModel, selection) {
        var me = this,
            selected = null;
        if (!me.ignoreNextSelection) {
            me.ignoreNextSelection = true;
            if (selection.length) {
                if (selModel.selectionMode === 'SINGLE') {
                    selected = selModel.getLastSelected();
                } else {
                    selected = me.getSelection();
                }
                me.hasHadSelection = true;
            }
            if (me.hasHadSelection) {
                me.setSelection(selected);
            }
            me.ignoreNextSelection = false;
        }
    },
    getRowExpander: function () {
        if (this.plugins && Ext.isArray(this.plugins)) {
            for (var i = 0; i < this.plugins.length; i++) {
                if (this.plugins[i].isRowExpander) {
                    return this.plugins[i];
                }
            }
        } else {
            if (this.plugins && this.plugins.isRowExpander) {
                return this.plugins;
            }
        }
    },
    getClickSelectionModel: function () {
        if (this.plugins && Ext.isArray(this.plugins)) {
            for (var i = 0; i < this.plugins.length; i++) {
                if (this.plugins[i].isClickSelection) {
                    return this.plugins[i];
                }
            }
        } else {
            if (this.plugins && this.plugins.isClickSelection) {
                return this.plugins;
            }
        }
    },
    getExportColumns: function () {
        var me = this,
            columns = me.getColumns();

        var exportColumns = Ext.Array.filter(columns, function (column) {
            return !column.isCheckerHd && !column.ignoreExport;
        });

        return exportColumns;
    },
    exportAlign: {
        'left': 'Left',
        'right': 'Right',
        'center': 'Center'
    },
    //获取导出数据
    getExportData: function (records) {
        var me = this,
            exportColumns = me.getExportColumns(),
            lenCols = exportColumns.length,
            titles = [],
            rows = [],
            record, row, col, v,
            regExp = /<.*>(.*)<\/.*>|<.*\/>/;

        Ext.Array.each(exportColumns, function (column) {
            if (!column.isCheckerHd && !column.ignoreExport) {
                var width = column.exportWidth || column.width;
                try {
                    width = column.getWidth();
                } catch (e) { }
                titles.push({
                    TitleName: column.text,
                    TitleValue: column.exportIndex || column.dataIndex,
                    TitleWide: Math.ceil(width / 7.5),
                    IsRMB: !!column.exportIsRMB,
                    IsCount: !!column.exportIsCount,
                    DataType: column.dataType,
                    Digit: column.digit,
                    CellType: me.exportAlign[column.align]
                });
            }
        });

        if (records) {
            for (var i = 0; i < records.length; i++) {
                record = records[i];
                row = {};

                for (var j = 0; j < lenCols; j++) {
                    col = exportColumns[j];
                    v = record.get(col.dataIndex);
                    if (col.exportRender) {
                        v = col.exportRender(v, null, record);
                    } else if (col.renderer && !col.renderer.$emptyFn) {
                        v = col.renderer(v, null, record);
                    }
                    if (v === null || v === undefined) {
                        v = '';
                    }
                    v = v.toString();
                    if (v) {
                        //替换金额数字
                        _v = v.replace(/￥/g, '');
                        if (_v) {
                            v = _v;
                            //处理html标签
                            var _temp = v.match(regExp);
                            if (_temp) {
                                v = _temp[1];
                            }
                        }
                    }
                    row[col.exportIndex || col.dataIndex] = v.trim();
                }

                rows.push(row);
            }
        }

        return {
            titles: titles,
            rows: rows
        };
    }
});
