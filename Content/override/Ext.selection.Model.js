/* ***********************************************
 * author :  ***
 * function: 解决大量数据取消全选速度慢的问题
 * history:  created by *** 2015/7/3 9:55:30 
 * ***********************************************/
(function () {
    Ext.override(Ext.selection.Model, {
        bindCheckedField: null,
        addSelectItems: function () {
            var me = this,
                owner;
            //if (me.grid.mask) {
            //    me.grid.mask('......');
            //}
            Ext.suspendLayouts();
            me.suspendChanges();
            me.selected.removeAll();

            var temp = [];
            Ext.Array.each(me.store.getData().items, function (item) {
                if (item.get(me.bindCheckedField)) {
                    //me.selected.add(item);
                    temp.push(item)
                }
            });
            me.select(temp, true, true);
            me.fireEvent('updateGroupSelect');
            me.resumeChanges();
            Ext.resumeLayouts(true);
        },
        onStoreLoad: function () {
            var me = this, store = me.store;
            if (me.bindCheckedField && store != null && store.getData().items.length > 0) {
                me.addSelectItems();
            }
        },
        updateGroupSelect: function () { },
        // records can be an index, a record or an array of records
        doDeselectNew: function (records, suppressEvent) {
            var me = this,
                selected = me.selected,
                i = 0,
                len, record,
                attempted = 0,
                accepted = 0,
                commit;

            if (me.locked || !me.store) {
                return false;
            }

            if (typeof records === "number") {
                // No matching record, jump out
                record = me.store.getAt(records);
                if (!record) {
                    return false;
                }
                records = [record];
            } else if (!Ext.isArray(records)) {
                records = [records];
            }

            commit = function () {
                ++accepted;
                //selected.remove(record);
                if (record === me.selectionStart) {
                    me.selectionStart = null;
                }
            };

            len = records.length;

            me.suspendChanges();
            for (; i < len; i++) {
                record = records[i];
                if (me.isSelected(record)) {
                    if (me.lastSelected === record) {
                        me.lastSelected = selected.last();
                    }
                    ++attempted;
                    me.onSelectChange(record, false, suppressEvent, commit);
                }
            }

            selected.removeAll();

            me.resumeChanges();

            // fire selchange if there was a change and there is no suppressEvent flag
            me.maybeFireSelectionChange(accepted > 0 && !suppressEvent);
            return accepted === attempted;
        },
        deselectAll: function (suppressEvent) {
            var me = this,
                selIndexes = {},
                store = me.store,
                selections,
                start,
                i, l, rec;

            //if (store.store) {
            //    selections = store.store.getRange();
            //} else {
            //    selections = store.getRange();
            //}
            selections = me.getSelection();
            start = selections.length;

            selections = Ext.Array.filter(selections, function (re) {
                return !re.get('_isDisabled')
            });
            for (i = 0, l = selections.length; i < l; i++) {
                rec = selections[i];

                selIndexes[rec.id] = store.indexOf(rec);
            }

            selections = Ext.Array.sort(selections, function (r1, r2) {
                var idx1 = selIndexes[r1.id],
                    idx2 = selIndexes[r2.id];

                return idx1 < idx2 ? -1 : 1;
            });

            me.suspendChanges();
            //阻止事件
            //me.doDeselectNew(selections, suppressEvent);
            me.doDeselectNew(selections, true);
            me.resumeChanges();

            //增加取消全选统一事件
            me.fireEvent('deselectAll', me, me.getSelection());

            if (!suppressEvent) {
                me.maybeFireSelectionChange(me.getSelection().length !== start);
            }
        },
        selectAll: function (suppressEvent) {
            var me = this,
                store = me.store,
                selections = store.getData().items,
                start = me.getSelection().length;

            //if (store.store) {
            //    selections = store.store.getRange();
            //} else {
            //    selections = store.getRange();
            //}

            var _selections = Ext.Array.filter(selections, function (re) {
                return !re.get('_isDisabled')
            });
            //start = _selections.length;

            me.suspendChanges();
            //me.doSelect(selections, true, suppressEvent);
            me.doSelect(_selections, true, true);
            me.resumeChanges();

            //增加全选统一事件
            me.fireEvent('selectAll', me, _selections);

            // fire selection change only if the number of selections differs
            if (!suppressEvent && !me.destroyed) {
                me.maybeFireSelectionChange(me.getSelection().length !== start);
            }
        },

        doMultiSelectNew: function (records, keepExisting, suppressEvent) {
            var me = this,
                selected = me.selected,
                change = false,
                result, i, len, record, commit;

            if (me.locked) {
                return;
            }

            records = !Ext.isArray(records) ? [records] : records;

            records = Ext.Array.filter(records, function (re) {
                return !re.get('_isDisabled')
            });

            len = records.length;
            if (!keepExisting && selected.getCount() > 0) {
                me.deselectAll();
                change = true;
            }
            if (!len) {
                return;
            }

            me.suspendChanges();
            me.selectionStart = records[0];
            commit = function () {
            };
            selected.add(records);
            change = true;

            for (i = 0; i < len; i++) {
                record = records[i];
                me.onSelectChange(record, true, true, commit);
                if (me.destroyed) {
                    return;
                }
            }
            me.resumeChanges();
            me.lastSelected = record;

            // fire selchange if there was a change and there is no suppressEvent flag
            me.maybeFireSelectionChange(change && !suppressEvent);
        },

        doSelect: function (records, keepExisting, suppressEvent) {
            var me = this,
                record;

            if (me.locked || records == null) {
                return;
            }

            if (typeof records === "number") {
                record = me.store.getAt(records);
                // No matching record, jump out.
                if (!record) {
                    return;
                }
                records = [record];
            }

            if (me.selectionMode === "SINGLE") {
                if (records.isModel) {
                    records = [records];
                }

                if (records.length) {
                    me.doSingleSelect(records[0], suppressEvent);
                }
            } else {
                me.doMultiSelectNew(records, keepExisting, suppressEvent);
            }
        }
    });
})();