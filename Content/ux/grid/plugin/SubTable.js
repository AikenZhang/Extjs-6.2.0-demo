/* ***********************************************
 * author :  ***
 * function: 表格行内表格
 * history:  created by *** 2015/7/2 15:56:45 
 * ***********************************************/
Ext.define('Fm.ux.grid.plugin.SubTable', {
    extend: 'Ext.grid.plugin.RowExpander',

    alias: 'plugin.subtable',

    //rowBodyTpl: ['<table class="' + Ext.baseCSSPrefix + 'grid-subtable" cellpadding="2" cellspacing="0">',
    //    '{%',
    //        'this.owner.renderTable(out, values);',
    //    '%}'
    //],
    rowBodyTpl: ['<div class="x-grid-subtable-con">',
        '{%',
            'this.owner.renderTable(out, values);',
        '%}',
        '<div>'
    ],
    /**
     * 是否展开第一行
     */
    autoExpandFirstRow: true,
    /**
     * 是否全部展开
     */
    autoExpandAllRow: false,

    pageSize: 10,
    //合计列  ['col1']
    sumColumns: [],
    //统计行格式 如 '数量总计:{col1}'
    sumFormat: '',

    init: function (grid) {
        var me = this,
            view,
            columns = me.columns,
            len, i, columnCfg;

        me.callParent(arguments);

        view = grid.getView();
        if (me.autoExpandFirstRow && !me.autoExpandAllRow) {
            view.ownerCt.on('expandfirstrow', me.onExpandFirstRow, me);
            view.on('refresh', function () {
                view.ownerCt.fireEvent('expandfirstrow', grid)
            }, view.ownerCt);
        }

        if (me.autoExpandAllRow) {
            view.ownerCt.on('expandalltrow', me.onExpandAllRow, me);
            view.on('refresh', function () {
                view.ownerCt.fireEvent('expandalltrow', grid)
            }, view.ownerCt);
        }

        view.on({
            expandbody: function (node, record, c) {
                me.swallowEvent(node.id);
                if (record._isrendersubpage) {
                    return;
                }
                record._isrendersubpage = true;
                me.rendPageByRecord(node.id, record, me);
            }
        });

        grid.on('beforeitemdblclick', function (a, b, c, d, e) {
            if (Ext.get(e.target).up('.x-grid-subtable-con')) {
                e.stopEvent();
                return false;
            }
        });

        me.columns = [];
        if (columns) {
            for (i = 0, len = columns.length; i < len; ++i) {
                columnCfg = Ext.apply({
                    preventRegister: true
                }, columns[i]);
                columnCfg.xtype = columnCfg.xtype || 'gridcolumn';
                me.columns.push(Ext.widget(columnCfg));
            }
        };
    },

    onExpandFirstRow: function (grid) {
        var me = this,
            view = grid.view,
            row = view.getRow(0),
            record;
        if (!row) {
            return;
        }
        setTimeout(function () {
            if (Ext.get(row)) {
                try {
                    record = grid.getStore().getAt(0);
                    me.expandRow(0, record);
                } catch (e) { }
            }
        }, 150);
    },
    onExpandAllRow: function (grid) {
        var me = this,
            view = grid.view,
            row,
            record,
            store = grid.getStore();
        setTimeout(function () {
            for (var i = 0; i < store.data.length; i++) {
                row = view.getRow(i);
                if (Ext.get(row)) {
                    try {
                        record = grid.getStore().getAt(i);
                        me.expandRow(i, record);
                    } catch (e) { }
                }
            }
        }, 150);
    },
    expandRow: function (rowIdx, record) {
        var me = this,
            view = me.view,
            rowNode = view.getNode(rowIdx),
            normalRow = Ext.fly(rowNode),
            wasCollapsed = normalRow.hasCls(me.rowCollapsedCls);
        if (wasCollapsed) {
            me.toggleRow(rowIdx, record);
        }
    },
    destroy: function () {
        var columns = this.columns,
            len, i;

        if (columns) {
            for (i = 0, len = columns.length; i < len; ++i) {
                columns[i].destroy();
            }
        }
        this.columns = null;
        this.callParent();
    },

    getRowBodyFeatureData: function (record, idx, rowValues) {
        this.callParent(arguments);
        rowValues.rowBodyCls += ' ' + Ext.baseCSSPrefix + 'grid-subtable-row';
    },
    getTableHtml: function (record, page) {
        var me = this,
            columns = me.columns,
            numColumns = columns.length,
            associatedRecords = me.getAssociatedRecords(record),
            recCount = associatedRecords.length,
            rec, column, i, j, value, out = [];

        var pageSize = me.pageSize,
            page = page || 1,
            star = pageSize * (page - 1),
            end = pageSize * page;
        if (end > recCount) {
            end = recCount;
        }

        out.push('<tr>');
        for (j = 0; j < numColumns; j++) {
            column = columns[j];
            out.push('<th style="white-space: nowrap;"><div' +
                (column.width != null ? ' style="display:block;width:' + column.width + 'px"' : '') +
                '>', columns[j].text, '</div></th>');
        }
        out.push('</tr>');
        for (var i = star; i < end; i++) {
            rec = associatedRecords[i];
            out.push('<tr>');
            for (j = 0; j < numColumns; j++) {
                column = columns[j];
                //value = rec.get(column.dataIndex);
                value = rec[column.dataIndex];
                if (column.renderer && column.renderer.call) {
                    value = column.renderer.call(column.scope || me, value, {}, rec);
                }
                if (column.autoExpand) {
                    out.push('<td class="sub_table_inner_cell x-text-nowrap" ');
                } else {
                    out.push('<td class="sub_table_inner_cell x-text-break" ');
                }
                if (column.align) {
                    out.push(' style="text-align:' + column.align + ';"');
                }
                if (column.showTip) {
                    out.push(' title="' + Ext.String.htmlEncode(value.toString()) + '"');
                }
                out.push('>', value, '</td>');
            }
            out.push('</tr>');
        }
        return out.join('');
    },
    swallowEvent: function (nodeid) {
        var subBody = Ext.get(nodeid);
        if (subBody && subBody.el) {
            subBody.el.swallowEvent(['mousedown', 'mousemove', 'mouseup', 'contextmenu', 'mouseover', 'mouseout'], false);

            rowBody = subBody.down('tr.x-grid-subtable-row');
            if (rowBody && rowBody.el) {
                rowBody.el.swallowEvent(['click', 'mousedown', 'mousemove', 'mouseup', 'dblclick', 'contextmenu', 'mouseover', 'mouseout'], false);
            }
            if (window.Clipboard) {
                var clipboard = new Clipboard(subBody.el.dom.querySelectorAll('.sub_table_inner_cell'), {
                    text: function (item) {
                        return Ext.String.trim(item.innerText || item.textContent || '');
                    }
                });
            }
        }
    },
    rendPageByRecord: function (nodeid, record, scope) {
        var me = scope || this,
            associatedRecords = me.getAssociatedRecords(record);

        me.swallowEvent(nodeid);

        if (associatedRecords.length / me.pageSize <= 1) {
            return true;
        };

        var pageBar = new fei.pageBar({
            nowPage: record._subtablepagenum || 1,
            totalSize: associatedRecords.length,
            pageSize: me.pageSize,
            callback: function (index) {
                record._subtablepagenum = index;
                me.pageRenderTable(nodeid, record, scope);
                me.rendPageByRecord(nodeid, record, scope);
            }
        });
        pageBar.render("subPage_" + nodeid + record.getId());
    },
    pageRenderTable: function (nodeid, record, scope) {
        var me = this,
            pageConId = nodeid + record.getId(),
            html = me.getTableHtml(record, record._subtablepagenum || 1);

        document.getElementById('subPage_table_' + pageConId).innerHTML = html;
    },
    renderTable: function (out, rowValues) {
        var me = this,
            associatedRecords = me.getAssociatedRecords(rowValues.record),
            pageConId = rowValues.rowId + rowValues.record.getId(),
            html;

        html = me.getTableHtml(rowValues.record, 1);
        out.push('<table class="x-grid-subtable" id="subPage_table_' + pageConId + '" cellpadding="2" cellspacing="0">');
        out.push(html);
        if (me.sumColumns && me.sumColumns.length > 0) {
            var sums = me.getSums(rowValues);
            var sumHtml = me.sumFormat;
            for (var i = 0; i < me.sumColumns.length; i++) {
                var cValue = sums[me.sumColumns[i]];
                var pC = Ext.Array.filter(me.columns, function (item) {
                    return item['dataIndex'] === me.sumColumns[i];
                })[0];
                if (pC && pC.renderer) {
                    cValue = pC.renderer(cValue);
                }
                sumHtml = sumHtml.replace('{' + me.sumColumns[i] + '}', cValue);
            }
            out.push('<tr><td colspan="' + me.columns.length + '">' + sumHtml + '</td></tr>');
        }
        out.push('</table>');
        if (associatedRecords.length / me.pageSize > 1) {
            out.push('<div class="page" id="subPage_' + pageConId + '"></div>');
        }
    },

    getSums: function (rowValues) {
        var me = this,
            associatedRecords = me.getAssociatedRecords(rowValues.record),
            sums = {},
            rec;
        //if (me.sums[record.getId()]) {
        //    return;
        //}
        for (var i = 0; i < me.sumColumns.length; i++) {
            sums[me.sumColumns[i]] = 0;
        }
        for (var i = 0; i < associatedRecords.length; i++) {
            rec = associatedRecords[i];
            for (var j = 0; j < me.sumColumns.length; j++) {
                sums[me.sumColumns[j]] += (parseFloat(rec[me.sumColumns[j]], 10) || 0);
            }
        }
        //me.sums[record.getId()] = sums;
        //return record[this.association]().getRange();
        return sums;
    },
    getRowBodyContentsFn: function (rowBodyTpl) {
        var me = this;
        return function (rowValues) {
            rowBodyTpl.owner = me;
            return rowBodyTpl.applyTemplate(rowValues);
        };
    },

    getAssociatedRecords: function (record) {
        //return record[this.association]().getRange();
        return record.get(this.association);
    },
    getExportColumns: function () {
        var me = this,
            columns = me.columns;

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
                    CellType: me.exportAlign[column.align]
                });
            }
        });

        for (var i = 0; i < records.length; i++) {
            record = records[i];
            row = {};

            for (var j = 0; j < lenCols; j++) {
                col = exportColumns[j];
                v = record.get(col.dataIndex);
                if (col.exportRender) {
                    v = col.exportRender(v, null, record);
                } else if (col.renderer) {
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

        return {
            titles: titles,
            rows: rows
        };
    }
});

/**
*客户端生成页码条
****
*/
fei = {}
fei.pageBar = function (config) {
    this.nowPage = 1;
    this.totalSize = 100;
    this.pageSize = 10;
    this.pageNumBarLength = 2;
    this.isSyncPageSize = true;
    this.callback = function (index) { alert(index); }

    for (var item in config) {
        this[item] = config[item];
    }
}

fei.pageBar.prototype.render = function (id) {
    var me = this;

    this.container = document.getElementById(id);
    this.container.innerHTML = "";

    this.nowPage = parseInt(this.nowPage, 10);
    this.totalSize = parseInt(this.totalSize, 10);
    this.pageSize = parseInt(this.pageSize, 10);
    this.pageNumBarLength = parseInt(this.pageNumBarLength, 10);
    this.totalPage = Math.ceil(this.totalSize / this.pageSize) < 1 ? 1 : Math.ceil(this.totalSize / this.pageSize);

    if (this.nowPage < 1) {
        this.nowPage = 1;
    }
    if (this.isSyncPageSize) {
        this._appendSyncPageSize();
    }

    this._appendPageNumBar();
}

fei.pageBar.prototype._appendSyncPageSize = function () {
    var me = this;

    var my = document.createElement("label");
    my.innerHTML = "每页 " + me.pageSize +
        " 条&nbsp;共 " + me.totalSize +
        ' 条&nbsp;&nbsp;';
    me.container.appendChild(my);
}

fei.pageBar.prototype._appendPageNumBar = function () {
    var i = this.nowPage - this.pageNumBarLength;
    if (i < 2) {
        i = 2;
    }
    this._getPageNumText(1, "1", true);
    if (i > 2) {
        var split = document.createElement("label");
        split.innerHTML = "...";
        this.container.appendChild(split);
    }
    for (i; i < this.nowPage; i++) {
        this._getPageNumText(i, i, true);
    }

    var numMax = this.nowPage + this.pageNumBarLength;
    if (numMax > this.totalPage - 1) {
        numMax = this.totalPage - 1;
    }
    var j = this.nowPage;
    if (j < 2) {
        j = 2;
    }
    for (j; j <= numMax; j++) {
        this._getPageNumText(j, j, true);
    }

    if (numMax < this.totalPage - 1) {
        var split = document.createElement("label");
        split.innerHTML = "...";
        this.container.appendChild(split);
    }

    if (this.totalPage > 1) {
        this._getPageNumText(this.totalPage, this.totalPage, true);
    }
}

fei.pageBar.prototype._getPageNumText = function (pageNum, pageText, isNum) {
    var me = this;
    if (pageNum == me.nowPage) {
        var nowNum = document.createElement("span");
        nowNum.innerHTML = pageText;
        me.container.appendChild(nowNum);
    }
    else {
        var num = document.createElement("a");
        num.href = "javascript:void(0)";

        var fn = function () {
            me.callback.call(window, pageNum);
        }
        if (num.addEventListener) {
            num.addEventListener("click", fn, false);
        }
        else if (num.attachEvent) {
            num.attachEvent('onclick', fn);
        }
        else {
            num["onclick"] = fn;
        }
        num.innerHTML = pageText;
        this.container.appendChild(num);
    }
}