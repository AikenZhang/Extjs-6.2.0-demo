/* ***********************************************
 * author :  ***
 * function: 下拉表格 带选择框 弹出框 全选按钮 多选
 * history:  created by *** 2015/6/9 15:12:18 
 * ***********************************************/
Ext.define('Fm.ux.form.ComboGrid', {
    extend: 'Ext.form.field.ComboBox',
    alias: ['widget.comboxgrid', 'widget.combogrid'],
    editable: false,
    windowTitle: null, //控制弹出窗的title
    //triggerCls: null,

    /**
     * 是否显示清除按钮
     */
    showClearTriggers: true,
    checkChangeEvents: Ext.isIE && (!document.documentMode || document.documentMode <= 9) ?
                        ['change', 'propertychange', 'keyup'] :
                        ['change', 'keyup', 'dragdrop'],
    /**
     * 是否在全选时处理值  为true时 全选的值用 multiAllValue 替代 仅限多选
     */
    isHandleAllValue: true,
    isValidate:false,
    taskType: null,
    month: null,
    /**
     * isHandleAllValue为true时 全选时的替代值
     */
    multiAllValue: [],
    /**
     * singleIsArray为true时 单选值也转换为数组
     */
    singleIsArray:false,
    isSelectAll: false,
    /**
     * 全部源数据的长度（包括无权限数据）
     * 用于判断是否替换全选值 如果有则使用‘allLength’比较，如果没有则使用store.totalCount比较
     */
    allLength: null,

    /**
    * 是否以弹出窗体显示
    */
    isPopWindow: false,

    //是否单选
    multiSelect: false,

    valueSplitChar: ',',

    valueIsString: false,

    onTriggerClick: function (e) {
        var me = this;

        if (me.isPopWindow) {
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
    onFieldMutation: function (e) {
        var me = this,
            key = e.getKey(),
            isDelete = key === e.BACKSPACE || key === e.DELETE,
            isCtrl = key === e.CTRL,
            rawValue = me.inputEl.dom.value,
            len = rawValue.length;

        // Do not process two events for the same mutation.
        // For example an input event followed by the keyup that caused it.
        // We must process delete keyups.
        // Also, do not process TAB event which fires on arrival.
        if (!me.readOnly && (rawValue !== me.lastMutatedValue || isDelete) && key !== e.TAB) {
            var oldValue = me.lastMutatedValue;
            me.lastMutatedValue = rawValue;
            me.lastKey = key;
            if (!len && (e.type !== 'keyup' || (!e.isSpecialKey() || isDelete))) {
                me.clearValue();
                me.fireEvent('change', me);
            } else if (len && (e.type !== 'keyup' || (!e.isSpecialKey() || isDelete || isCtrl))) {
                //me.doQueryTask.delay(me.queryDelay);
                me.setValue(rawValue);
                me.fireEvent('change', me);
                //me.fireEvent('select', me, me, rawValue, oldValue);
            } else {
                // We have *erased* back to empty if key is a delete, or it is a non-key event (cut/copy)
                if (!len && (!key || isDelete)) {
                    // Essentially a silent setValue.
                    // Clear our value, and the tplData used to construct a mathing raw value.
                    if (!me.multiSelect) {
                        me.value = null;
                        me.displayTplData = undefined;
                    }
                    // If the value is blank we can't have a value
                    if (me.clearValueOnEmpty) {
                        me.valueCollection.removeAll();
                    }

                    // Just erased back to empty. Hide the dropdown.
                    me.collapse();

                    // There may have been a local filter if we were querying locally.
                    // Clear the query filter and suppress the consequences (we do not want a list refresh).
                    if (me.queryFilter) {
                        // Must set changingFilters flag for this.checkValueOnChange.
                        // the suppressEvents flag does not affect the filterchange event
                        me.changingFilters = true;
                        me.store.removeFilter(me.queryFilter, true);
                        me.changingFilters = false;
                    }
                }
                me.callParent([e]);
            }
        }
    },
    onTriggerClickPopWindow: function () {
        var me = this,
            win,
            selModel,
            bbar = ['->'];

        if (me.multiSelect) {
            selModel = {
                selType: "checkboxmodel",
                mode: "SIMPLE",
                allowDeselect: true
            };
            //bbar.push(
            //    {
            //    text: '全选',
            //    width: 70,
            //    handler: function (btn) {
            //        var win = btn.up('window[popWindow=is]'),
            //            grid = win.down('cisgrid') || win.down('grid'),
            //            records = grid.getSelection()

            //        grid.getSelectionModel().selectAll(true);
            //    }
            //}, {
            //    text: '取消选中',
            //    width: 70,
            //    handler: function (btn) {
            //        var win = btn.up('window[popWindow=is]'),
            //            grid = win.down('cisgrid') || win.down('grid'),
            //            records = grid.getSelection()

            //        grid.getSelectionModel().deselectAll(true);
            //    }
            //});
        } else {
            selModel = {
                mode: "SINGLE",
                allowDeselect: true
            };
        }
        bbar.push({
            text: '选择',
            width: 70,
            handler: function (btn) {
                var win = btn.up('window[popWindow=is]'),
                    grid = win.down('cisgrid') || win.down('grid'),
                    records = grid.getSelection();
                if (me.isValidate) {
                    me.setValue(null);
                }
                me.updateValue(records);
                if (me.callbackChecked) {
                    me.callbackChecked(records);
                }
                win.close();
            }
        }, {
            text: '取消',
            width: 70,
            handler: function (btn) {
                var win = btn.up('window[popWindow=is]');
                win.close();
            }
        });

        win = Ext.create('Ext.window.Window', {
            title: me.windowTitle || me.fieldLabel,
            height: me.winHeight,
            width: me.winWidth,
            modal: true,
            layout: 'fit',
            popWindow: 'is',
            taskType: me.taskType,
            month: me.month,
            listeners: {
                'close': function () {
                    me.focus();
                }
            },
            items: [Ext.apply(me.innerGrid, {
                selModel: selModel,
                listeners: {
                    'itemdblclick': function (obj, record, item, index, e, eOpts) {
                        if (!me.multiSelect) {
                            var array = [],
                                win = obj.up('window[popWindow=is]');
                            array.push(record);
                            if (me.isValidate) {
                                me.setValue(null);
                            }
                            
                            me.updateValue(array);
                            if (me.callbackChecked) {
                                me.callbackChecked(record);
                            }
                            win.close();
                        }
                    },
                    afterrender: function (obj, record) {
                        //第一次焦点加载
                        if (obj.down('[focusEnable=true]')) {
                            obj.down('[focusEnable=true]').focus();
                        }

                    }
                }
            })],
            buttons: bbar
        });
        win.show();
    },
    getAllLength: function () {
        var me = this,
            store;

        if (!me.allLength) {
            store = me.getStore();
            if (!store || store.isEmptyStore) {
                var bind = me.getBind();
                if (bind && bind.store) {
                    store = bind.store.getValue();
                }
            }

            return store.getTotalCount();
        }

        return me.allLength;
    },

    createPicker: function () {
        var me = this,
            picker;

        picker = me.picker = me.getGridPicker();

        if (!me.store || me.store.isEmptyStore) {
            me.store = picker.getStore();
        }

        if (!me.store || me.store.isEmptyStore) {
            me.store = picker.getController().getGridStore();
        }

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
        var temp = {
            pickerField: me,
            hidden: true,
            //store: me.getPickerStore(),
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
        };

        if (me.store || me.store.isEmptyStore) {
            temp.store = me.getPickerStore();
        }

        var pickerConfig = Ext.apply(me.innerGrid, temp);

        //解决火狐下点击选择框关闭的问题
        me.originalCollapse = me.collapse;
        if (me.multiSelect) {
            pickerConfig.listeners.show = {
                fn: function () {
                    me.picker.el.on({
                        mouseover: function () {
                            this.collapse = Ext.emptyFn;
                        },
                        mouseout: function () {
                            this.collapse = this.originalCollapse;
                        },
                        scope: me
                    });
                }
            }
        } else {
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
        }

        var picker;

        picker = Ext.ComponentManager.create(Ext.isFunction(pickerConfig) ? pickerConfig.call() : pickerConfig, "panel");

        return picker;
    },
    updateValue: function (records) {
        var me = this,
            selectedRecords = records || me.valueCollection.getRange(),
            len = selectedRecords.length,
            valueArray = [],
            displayTplData = me.displayTplData || (me.displayTplData = []),
            inputEl = me.inputEl,
            i, record;

        // Loop through values, matching each from the Store, and collecting matched records
        displayTplData.length = 0;
        for (i = 0; i < len; i++) {
            record = selectedRecords[i];
            displayTplData.push(me.getRecordDisplayData(record));

            // There might be the bogus "value not found" record if forceSelect was set. Do not include this in the value.
            if (record !== me.valueNotFoundRecord) {
                valueArray.push(record.get(me.valueField));
            }
        }

        // Set the value of this field. If we are multiselecting, then that is an array.
        me.setHiddenValue(valueArray);
        me.value = me.multiSelect ? valueArray : valueArray[0];
        if (!Ext.isDefined(me.value)) {
            me.value = undefined;
        }
        me.displayTplData = displayTplData; //store for getDisplayValue method

        if (inputEl && me.emptyText && !Ext.isEmpty(me.value)) {
            inputEl.removeCls(me.emptyCls);
        }

        // Calculate raw value from the collection of Model data

        me.setRawValue(me.getDisplayValue());
        me.checkChange();

        me.applyEmptyText();
    },

    updateValue22: function (records) {
        var me = this,
            selectedRecords = me.valueCollection.getRange(),
            len = selectedRecords.length,
            valueArray = [],
            displayTplData = me.displayTplData || (me.displayTplData = []),
            inputEl = me.inputEl,
            i, record;

        if (selectedRecords.length == 0 && records) {
            selectedRecords = records;
            len = selectedRecords.length;
        }
        // Loop through values, matching each from the Store, and collecting matched records
        displayTplData.length = 0;
        for (i = 0; i < len; i++) {
            record = selectedRecords[i];
            displayTplData.push(me.getRecordDisplayData(record));

            // There might be the bogus "value not found" record if forceSelect was set. Do not include this in the value.
            if (record !== me.valueNotFoundRecord) {
                valueArray.push(record.get(me.valueField));
            }
        }



        //Ext.each(selectedRecords, function (sel) {
        //    valueArray.push(sel.get(me.valueField));
        //});

        // Set the value of this field. If we are multiselecting, then that is an array.
        me.setHiddenValue(valueArray);
        me.value = me.multiSelect ? valueArray : valueArray[0];
        if (!Ext.isDefined(me.value)) {
            me.value = undefined;
        }
        me.displayTplData = displayTplData; //store for getDisplayValue method

        if (inputEl && me.emptyText && !Ext.isEmpty(me.value)) {
            inputEl.removeCls(me.emptyCls);
        }

        // Calculate raw value from the collection of Model data
        me.setRawValue(me.getDisplayValue());
        me.checkChange();

        me.applyEmptyText();
    },

    doSetValue: function (value, add) {
        if (!this.isPopWindow) {
            this.getPicker();
        }
        var me = this,
            store = me.getStore(),
            Model,
            matchedRecords = [],
            valueArray = [],
            autoLoadOnValue = me.autoLoadOnValue,
            isLoaded = store.getCount() > 0 || store.isLoaded(),
            pendingLoad = store.hasPendingLoad(),
            unloaded = autoLoadOnValue && !isLoaded && !pendingLoad,
            forceSelection = me.forceSelection,
            selModel = me.pickerSelectionModel,
            displayIsValue = me.displayField === me.valueField,
            isEmptyStore = store.isEmptyStore,
            lastSelection = me.lastSelection,
            i, len, record, dataObj, valueChanged, key;
        if (add && !me.multiSelect) {
            Ext.raise('Cannot add values to non multiSelect ComboBox');
        }
        // Called while the Store is loading or we don't have the real store bound yet.
        // Ensure it is processed by the onLoad/bindStore.
        // Even if displayField === valueField, we still MUST kick off a load because even though
        // the value may be correct as the raw value, we must still load the store, and
        // upon load, match the value and select a record sop we can publish the *selection* to
        // a ViewModel.
        if (pendingLoad || unloaded || !isLoaded || isEmptyStore) {
            // If they are setting the value to a record instance, we can
            // just add it to the valueCollection and continue with the setValue.
            // We MUST do this before kicking off the load in case the load is synchronous;
            // this.value must be available to the onLoad handler.
            if (!value.isModel) {
                if (me.multiSelect && !me.valueIsString) {
                    var _tempV = value;
                    if (value && !Ext.isArray(value)) {
                        _tempV = value.toString().split(me.valueSplitChar);
                    }
                    value = _tempV;
                }
                if (add) {
                    me.value = Ext.Array.from(me.value).concat(value);
                } else {
                    me.value = value;
                }
                //判断 object 表示 赋值的话 是空  value 是字符串 
                //输入文本 value是数组 this.displayTplData 是空数组
                if (value === '') {
                    this.displayTplData = [''];
                }
                if (this.displayTplData && (this.displayTplData.length === 0 || typeof this.displayTplData[0] === 'string') && typeof this.displayTplData[0] !== 'object') {
                    var tempvalue = [];
                    tempvalue.push(value);
                    this.displayTplData = tempvalue;
                }
                me.setHiddenValue(me.value);
                if (this.displayTplData && this.displayTplData.length !== 0 && typeof value !== 'object') {
                    me.setRawValue(me.getDisplayValue());
                } else {
                    me.setRawValue(me.value);
                }

                //me.setRawValue(me.value);

                if (me.value) {
                    this.displayTplData = [];
                    me.inputEl.removeCls(me.emptyCls + '-' + me.ui);
                }
                if (!value.isModel || isEmptyStore) {
                    return me;
                }
                // If we know that the display value is the same as the value, then show it.
                // A store load is still scheduled so that the matching record can be published.
            }
            // Kick off a load. Doesn't matter whether proxy is remote - it needs loading
            // so we can select the correct record for the value.
            //
            // Must do this *after* setting the value above in case the store loads synchronously
            // and fires the load event, and therefore calls onLoad inline.
            //
            // If it is still the default empty store, then the real store must be arriving
            // in a tick through binding. bindStore will call setValueOnData.
            if (unloaded && !isEmptyStore) {
                store.load();
            }
            // If they had set a string value, another setValue call is scheduled in the onLoad handler.
            // If the store is the defauilt empty one, the setValueOnData call will be made in bindStore
            // when the real store arrives.
            if (!value.isModel || isEmptyStore) {
                return me;
            }
        }
        // This method processes multi-values, so ensure value is an array.
        value = add ? Ext.Array.from(me.value).concat(value) : Ext.Array.from(value);
        // Loop through values, matching each from the Store, and collecting matched records
        for (i = 0, len = value.length; i < len; i++) {
            record = value[i];
            // Set value was a key, look up in the store by that key
            if (!record || !record.isModel) {
                //record = me.findRecordByValue(key = record);
                record = me.store.findRecord(me.valueField, record);
                // The value might be in a new record created from an unknown value (if !me.forceSelection).
                // Or it could be a picked record which is filtered out of the main store.
                // Or it could be a setValue(record) passed to an empty store with autoLoadOnValue and aded above.
                if (!record) {
                    record = me.valueCollection.find(me.valueField, key);
                }
            }
            // record was not found, this could happen because
            // store is not loaded or they set a value not in the store
            if (!record) {
                // If we are allowing insertion of values not represented in the Store, then push the value and
                // create a new record to push as a display value for use by the displayTpl
                if (!forceSelection) {
                    // We are allowing added values to create their own records.
                    // Only if the value is not empty.
                    if (!record && value[i]) {
                        dataObj = {};
                        dataObj[me.displayField] = value[i];
                        if (me.valueField && me.displayField !== me.valueField) {
                            dataObj[me.valueField] = value[i];
                        }
                        Model = store.getModel();
                        record = new Model(dataObj);
                    }
                }
                    // Else, if valueNotFoundText is defined, display it, otherwise display nothing for this value
                else if (me.valueNotFoundRecord) {
                    record = me.valueNotFoundRecord;
                }
            }
            // record found, select it.
            if (record) {
                matchedRecords.push(record);
                valueArray.push(record.get(me.valueField));
            }
        }
        // If the same set of records are selected, this setValue has been a no-op
        if (lastSelection) {
            len = lastSelection.length;
            if (len === matchedRecords.length) {
                for (i = 0; !valueChanged && i < len; i++) {
                    if (Ext.Array.indexOf(me.lastSelection, matchedRecords[i]) === -1) {
                        valueChanged = true;
                    }
                }
            } else {
                valueChanged = true;
            }
        } else {
            valueChanged = matchedRecords.length;
        }
        if (valueChanged) {
            // beginUpdate which means we only want to notify this.onValueCollectionEndUpdate after it's all changed.
            me.suspendEvent('select');
            me.valueCollection.beginUpdate();
            if (matchedRecords.length) {
                selModel.select(matchedRecords, false);
            } else {
                selModel.deselectAll();
            }
            me.valueCollection.endUpdate();
            me.resumeEvent('select');
        } else {
            me.updateValue();
        }
        return me;
    },
    //setValue: function (value) {
    //    var me = this;
    //    // Value needs matching and record(s) need selecting.
    //    if (value !== null && value !== undefined){
    //        if (!value) {
    //            me.isSelectAll = false;
    //        }

    //        //if (me.isSelectAll && !me.isPopWindow) {
    //        //    return me.doSetValue(me.store.getData().items);
    //        //}
    //        return me.doSetValue(value);
    //    } else // Clearing is a special, simpler case.
    //    {
    //        me.suspendEvent('select');
    //        me.valueCollection.beginUpdate();
    //        me.pickerSelectionModel.deselectAll();
    //        me.valueCollection.endUpdate();
    //        me.lastSelectedRecords = null;
    //        me.resumeEvent('select');
    //    }
    //},
    //getValue: function () {
    //    var me = this,
    //        value = me.callParent(arguments);

    //    if (!value) {
    //        return value;
    //    }

    //    if (me.isHandleAllValue && me.multiSelect && me.multiAllValue && Ext.isArray(value)) {
    //        if (me.getAllLength() === value.length) {
    //            me.isSelectAll = true;
    //            return me.multiAllValue;
    //        }
    //        me.isSelectAll = false;
    //    }

    //    return value;
    //},
    onValueCollectionEndUpdate: function () {
        var me = this,
            store = me.store,
            selectedRecords = me.valueCollection.getRange(),
            selectedRecord = selectedRecords[0],
            selectionCount = selectedRecords.length;

        me.updateBindSelection(me.pickerSelectionModel, selectedRecords);

        if (me.isSelectionUpdating()) {
            return;
        }

        Ext.suspendLayouts();

        me.lastSelection = selectedRecords;
        if (selectionCount) {
            // Track the last selection with a value (non blank) for use in
            // assertValue
            me.lastSelectedRecords = selectedRecords;
        }

        //me.setRawValue('121212');

        me.updateValue();

        // If we have selected a value, and it's not possible to select any more values
        // or, we are configured to hide the picker each time, then collapse the picker.
        if (selectionCount && ((!me.multiSelect && store.contains(selectedRecord)) || me.collapseOnSelect || !store.getCount())) {
            me.updatingValue = true;
            me.collapse();
            me.updatingValue = false;
        }
        Ext.resumeLayouts(true);
        if (selectionCount && !me.suspendCheckChange) {
            if (!me.multiSelect) {
                selectedRecords = selectedRecord;
            }
            me.fireEvent('select', me, selectedRecords);
        }
    },
    onBindStore: function (store, initial) {
        var me = this,
            picker = me.picker,
            extraKeySpec,
            valueCollectionConfig;

        // We're being bound, not unbound...
        if (store) {
            // If store was created from a 2 dimensional array with generated field names 'field1' and 'field2'
            if (store.autoCreated) {
                me.queryMode = 'local';
                me.valueField = me.displayField = 'field1';
                if (!store.expanded) {
                    me.displayField = 'field2';
                }
            }
            if (!Ext.isDefined(me.valueField)) {
                me.valueField = me.displayField;
            }
            // Add a byValue index to the store so that we can efficiently look up records by the value field
            // when setValue passes string value(s).
            // The two indices (Ext.util.CollectionKeys) are configured unique: false, so that if duplicate keys
            // are found, they are all returned by the get call.
            // This is so that findByText and findByValue are able to return the *FIRST* matching value. By default,
            // if unique is true, CollectionKey keeps the *last* matching value.
            extraKeySpec = {
                byValue: {
                    rootProperty: 'data',
                    unique: false
                }
            };
            extraKeySpec.byValue.property = me.valueField;
            store.setExtraKeys(extraKeySpec);

            if (me.displayField === me.valueField) {
                store.byText = store.byValue;
            } else {
                extraKeySpec.byText = {
                    rootProperty: 'data',
                    unique: false
                };
                extraKeySpec.byText.property = me.displayField;
                store.setExtraKeys(extraKeySpec);
            }

            // We hold a collection of the values which have been selected, keyed by this field's valueField.
            // This collection also functions as the selected items collection for the BoundList's selection model
            valueCollectionConfig = {
                rootProperty: 'data',
                extraKeys: {
                    byInternalId: {
                        property: 'internalId'
                    },
                    byValue: {
                        property: '', // Set below. This is the name of our valueField
                        rootProperty: 'data'
                    }
                },
                // Whenever this collection is changed by anyone, whether by this field adding to it,
                // or the BoundList operating, we must refresh our value.
                listeners: {
                    beginupdate: me.onValueCollectionBeginUpdate,
                    endupdate: me.onValueCollectionEndUpdate,
                    scope: me
                }
            };
            valueCollectionConfig.extraKeys.byValue.property = me.valueField;

            // This becomes our collection of selected records for the Field.
            me.valueCollection = new Ext.util.Collection(valueCollectionConfig);

            // This is the selection model we configure into the dropdown BoundList.
            // We use the selected Collection as our value collection and the basis
            // for rendering the tag list.
            if (me.multiSelect) {
                me.pickerSelectionModel = new Ext.selection.CheckboxModel({
                    mode: 'SIMPLE',
                    enableInitialSelection: false,
                    pruneRemoved: false,
                    selected: me.valueCollection,
                    store: store
                });
            } else {
                me.pickerSelectionModel = new Ext.selection.DataViewModel({
                    mode: 'SINGLE',
                    enableInitialSelection: false,
                    pruneRemoved: false,
                    selected: me.valueCollection,
                    store: store
                });
            }

            if (!initial) {
                me.resetToDefault();
            }

            if (picker) {
                picker.setSelectionModel(me.pickerSelectionModel);
                if (picker.getStore() !== store) {
                    picker.bindStore(store);
                }
            }
        }
    }
});

