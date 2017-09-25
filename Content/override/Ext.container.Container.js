(function () {
    //layout table布局 就诊信息导出
    Ext.override(Ext.container.Container, {
        getExportData: function (beginRow, beginCol) {
            // beginRow 导出时起始行位置
            // beginCol 导出时起始列位置
            var me = this,
                columns = (me.layout.columns || 0) * 2,
                cells = [],
                beginRow = beginRow || 1,
                beginCol = beginCol || 0,
                row = 0, col = 0, cellcount = 1;

            var _div = document.createElement('div');

            Ext.Array.forEach(me.items.items, function (item) {
                if (!item.hidden) {
                    if (col >= columns) {
                        col = 0;
                        row++;
                    }
                    cells.push({
                        CellValue: item.fieldLabel,
                        RowNumber: beginRow + row,
                        CellNumber: beginCol + col,
                        CellCount: 1,
                        CellType: 'Right'
                    });
                    col = col + 1;
                    cellcount = (item.colspan || 1) * 2 - 1;
                    var cellValue = item.renderer ? item.renderer(item.value) : item.value;
                    _div.innerHTML = cellValue;
                    cellValue = _div.innerText || _div.textContent;

                    cells.push({
                        CellValue: cellValue || '',
                        RowNumber: beginRow + row,
                        CellNumber: beginCol + col,
                        CellCount: cellcount
                    });
                    col = col + cellcount;
                }
            });
            return { Cells: cells, EndRow: beginRow + row, EndCol: beginCol + col };
        },
        //折叠Panel
        foldPanel: function (p) {
            var me = this,
                view = me,
                n = view.down('[region=north]'),
                c = view.down('[region=center]'),
                e = view.down('[region=east]'),
                s = view.down('[region=south]');

            //记录south原高度
            if (s.getHeight() !== 0 && c.getHeight() !== 0) {
                me._southHeight = s.getHeight();
            }
            //设置折叠
            if (p === 'c') {
                s.setHeight(s.getHeight() === 0 ? me._southHeight : 0);
            }
            else if (p === 's') {
                var maxH = view.getHeight();
                s.setHeight(s.getHeight() === maxH
                    ? me._southHeight
                    : maxH);
            }
        }
    });
})();