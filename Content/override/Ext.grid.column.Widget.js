/* ***********************************************
 * author :  fei85
 * function: 增加多属性绑定
 * history:  created by fei85 2016/9/21 9:47:24 
 * ***********************************************/
Ext.override(Ext.grid.column.Widget, {
    sortable: true,
    ignoreExport: false,
    setWidgetVal: function (widget, record) {
        var dataIndex = this.dataIndex;
        if (widget && this.rendered) {
            if (widget.cisBindProperty) {
                //增加多属性绑定
                var _temp = {};
                for (var _key in widget.cisBindProperty) {
                    var _val = record.get(widget.cisBindProperty[_key].dataIndex);
                    if (widget.cisBindProperty[_key].renderer) {
                        _val = widget.cisBindProperty[_key].renderer(_val, record);

                    }
                    _temp[_key] = _val;
                    widget.setConfig(_temp);
                }
            } else {
                if (widget.defaultBindProperty && dataIndex) {
                    var _val = record.get(dataIndex);
                    //增加renderer
                    if (widget.renderer) {
                        _val = widget.renderer(_val, record);
                    }
                    widget.setConfig(widget.defaultBindProperty, _val);
                }
            }
            widget.updateLayout();
        }
    },
    updateWidget: function (record) {
        var dataIndex = this.dataIndex,
            widget;

        if (this.rendered) {
            widget = this.liveWidgets[record.internalId];
            // Call the appropriate setter with this column's data field
            this.setWidgetVal(widget, record);
        }
    },
    onViewRefresh: function (view, records) {
        var me = this,
            rows = view.all,
            hasAttach = !!me.onWidgetAttach,
            oldWidgetMap = me.liveWidgets,
            dataIndex = me.dataIndex,
            isFixedSize = me.isFixedSize,
            cell, widget, el, width, recordId,
            itemIndex, recordIndex, record, id, lastBox, dom;

        if (me.isVisible(true)) {
            me.liveWidgets = {};
            Ext.suspendLayouts();
            for (itemIndex = rows.startIndex, recordIndex = 0; itemIndex <= rows.endIndex; itemIndex++, recordIndex++) {
                record = records[recordIndex];
                if (record.isNonData) {
                    continue;
                }

                recordId = record.internalId;
                cell = view.getRow(rows.item(itemIndex)).cells[me.getVisibleIndex()].firstChild;

                // Attempt to reuse the existing widget for this record.
                widget = me.liveWidgets[recordId] = oldWidgetMap[recordId] || me.getFreeWidget();
                widget.$widgetRecord = record;
                widget.$widgetColumn = me;
                delete oldWidgetMap[recordId];

                lastBox = me.lastBox;
                if (lastBox && !isFixedSize && width === undefined) {
                    width = lastBox.width - parseInt(me.getCachedStyle(cell, 'padding-left'), 10) - parseInt(me.getCachedStyle(cell, 'padding-right'), 10);
                }

                // Call the appropriate setter with this column's data field
                this.setWidgetVal(widget, record);

                if (hasAttach) {
                    Ext.callback(me.onWidgetAttach, me.scope, [me, widget, record], 0, me);
                }

                el = widget.el || widget.element;
                if (el) {
                    dom = el.dom;
                    if (dom.parentNode !== cell) {
                        Ext.fly(cell).empty();
                        cell.appendChild(el.dom);
                    }
                    if (!isFixedSize) {
                        widget.setWidth(width);
                    }
                    widget.reattachToBody();
                } else {
                    if (!isFixedSize) {
                        widget.width = width;
                    }
                    Ext.fly(cell).empty();
                    widget.render(cell);
                }
            }

            Ext.resumeLayouts(true);

            // Free any unused widgets from the old live map.
            // Move them into detachedBody.
            for (id in oldWidgetMap) {
                widget = oldWidgetMap[id];
                widget.$widgetRecord = widget.$widgetColumn = null;
                me.freeWidgetStack.unshift(widget);
                widget.detachFromBody();
            }
        }
    },
    onItemAdd: function (records, index, items) {
        var me = this,
            view = me.getView(),
            hasAttach = !!me.onWidgetAttach,
            dataIndex = me.dataIndex,
            isFixedSize = me.isFixedSize,
            len = records.length, i,
            record,
            row,
            cell,
            widget,
            el,
            focusEl,
            width;

        // Loop through all records added, ensuring that our corresponding cell in each item
        // has a Widget of the correct type in it, and is updated with the correct value from the record.
        if (me.isVisible(true)) {
            for (i = 0; i < len; i++) {
                record = records[i];
                if (record.isNonData) {
                    continue;
                }

                row = view.getRowFromItem(items[i]);

                // May be a placeholder with no data row
                if (row) {
                    cell = row.cells[me.getVisibleIndex()].firstChild;
                    if (!isFixedSize && !width) {
                        width = me.lastBox.width - parseInt(me.getCachedStyle(cell, 'padding-left'), 10) - parseInt(me.getCachedStyle(cell, 'padding-right'), 10);
                    }

                    widget = me.liveWidgets[record.internalId] = me.getFreeWidget();
                    widget.$widgetColumn = me;
                    widget.$widgetRecord = record;

                    // Render/move a widget into the new row
                    Ext.fly(cell).empty();

                    // Call the appropriate setter with this column's data field
                    this.setWidgetVal(widget, record);

                    if (hasAttach) {
                        Ext.callback(me.onWidgetAttach, me.scope, [me, widget, record], 0, me);
                    }

                    el = widget.el || widget.element;
                    if (el) {
                        cell.appendChild(el.dom);
                        if (!isFixedSize) {
                            widget.setWidth(width);
                        }
                        widget.reattachToBody();
                    } else {
                        if (!isFixedSize) {
                            widget.width = width;
                        }
                        widget.render(cell);
                    }

                    // If the widget has a focusEl, ensure that its tabbability status is synched with the view's
                    // navigable/actionable state.
                    focusEl = widget.getFocusEl();
                    if (focusEl) {
                        if (view.actionableMode) {
                            if (!focusEl.isTabbable()) {
                                focusEl.restoreTabbableState();
                            }
                        } else {
                            if (focusEl.isTabbable()) {
                                focusEl.saveTabbableState();
                            }
                        }
                    }
                }
            }
        }
    }
});