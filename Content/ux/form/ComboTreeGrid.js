/* ***********************************************
 * author :  ***
 * function: 下拉树形表格 带选择框 全选按钮 多选
 * history:  created by *** 2015/6/9 15:12:18 
 * history:  update by *** 2015/8/18 15:12:18 
 *           更新控件逻辑 增加全选时用设定值替代功能
 * ***********************************************/
Ext.define('Fm.ux.form.ComboTreeGrid', {
    extend: 'Fm.ux.form.ComboGrid',
    alias: ['widget.comboxtreegrid', 'widget.combotreegrid'],
    requires: [
        'Ext.tree.Panel'
    ],
    editable: false,

    multiSelect: true,

    /**
     * 值是否包含父级节点
     */
    valueIsContainRoot: false,

    /**
     * 联动选择方式
     * 'p-c'选中父节点的同时选中子节点 'c-p'选中子节点的同时选中父节点
     */
    selectModel: [],

    /**
     * 是否在一级节点只有一组的情况下 展开第一个父节点
     */
    isAutoExpandFirst: true,

    /**
     * 是否在全选时处理值  为true时 全选的值用 multiAllValue 替代 仅限多选
     */
    isHandleAllValue: true,

    /**
     * isHandleAllValue为true时 全选时的替代值
     */
    multiAllValue: [],

    initComponent: function () {
        var me = this,
            triggers = {};

        me.multiAllTempValue = me.multiAllValue;
        me.callParent(arguments);
    },

    listeners: {
        afterrender: function () {
            var me = this;

            if (me.fakeStore) {
                var children = me.getForData(me.fakeStore);
                if (Fm.Server.Config.IsGroupClaimType && children && children.length === 1) {
                    me.store = Ext.create('Ext.data.TreeStore', {
                        fields: ['value', 'text'],
                        root:
                        {
                            text: children[0]['text'] || '全部',
                            value: -1,
                            expanded: true,
                            checked: children[0]['checked'],
                            children: children[0]['children']
                        }
                    });
                } else {
                    me.store = Ext.create('Ext.data.TreeStore', {
                        fields: ['value', 'text'],
                        root:
                        {
                            text: '全部',
                            value: -1,
                            expanded: true,
                            checked: false,
                            children: children
                        }
                    });
                }
            }
        }
    },
    getForData: function (data) {
        var getArray = function (data, parent) {
            var cg = [],
                index = 0;

            for (var i = 0; i < data.length; i++) {
                //判断是否有权限
                if (data[i].IsAlloted === true) {
                    if (Ext.isArray(data[i].Children) && data[i].Children.length > 0) {
                        cg[index] = {
                            value: data[i].Id,
                            text: data[i].Name,
                            leaf: data[i].Children.length > 0 ? false : true,
                            checked: false,
                            children: getArray(data[i].Children, data[i].Name)
                        };
                    }
                    else {
                        var items = [];
                        Ext.each(data, function (item) {
                            //添加子节点时，也要判断权限
                            if (item && item.IsAlloted === true) {
                                var childenItem = {
                                    value: item.Id,
                                    text: item.Name,
                                    Id: item.Id,
                                    leaf: true,
                                    checked: false
                                };
                                items.push(childenItem);
                            }
                        });
                        return items;
                    }
                    index = index + 1;
                }
            }
            return cg;
        };
        return getArray(data);
    },

    createPicker: function () {
        var me = this,
            picker;

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
        //picker.getSelectionModel().on({
        //    beforeselect: me.onBeforeSelect,
        //    beforedeselect: me.onBeforeDeselect,
        //    scope: me
        //});

        picker.getNavigationModel().navigateOnSpace = false;

        return picker;
    },

    getAllLength: function () {
        var me = this,
            store;

        if (!me.allLength) {
            store = me.getStore();
            if (!store || store.storeId === 'ext-empty-store') {
                store = me.getBind().store.getValue();
            }
            return me.getTreeStoreLen(store);
        }

        return me.allLength;
    },

    getTreeStoreLen: function (store) {
        var me = this,
            _allLen = 0,
            root = store.getRootNode();

        var getLenByNode = function (node) {
            if (node.get('leaf') !== true) {
                if (me.valueIsContainRoot) {
                    _allLen++;
                }
                for (var i = 0; i < node.childNodes.length; i++) {
                    getLenByNode(node.childNodes[i]);
                }
            } else {
                _allLen++;
            }
        }
        getLenByNode(root);
        return _allLen;
    },

    getGridPicker: function () {
        var me = this,
            coCellTpl;

        var pickerConfig = Ext.apply(me.innerGrid, {
            pickerField: me,
            hidden: true,
            store: me.store,
            displayField: me.displayField,
            //preserveScrollOnRefresh: true,
            pageSize: me.pageSize,
            selModel: me.pickerSelectionModel,
            floating: true,
            minWidth: me.minPickerWidth,
            minHeight: me.minPickerHeight,
            maxHeight: me.maxPickerHeight,
            autoScroll: true,
            allowDeselect: false,
            listeners: {
                checkchange: {
                    fn: me.onSelectItem,
                    scope: me
                },
                render: function () {
                    if (me.isAutoExpandFirst) {
                        var firstNode;
                        if (this.store.rootVisible) {
                            firstNode = this.store.root;
                        } else {
                            var cNodes = this.store.data.item;
                            if (cNodes && cNodes.length === 1) {
                                firstNode = this.store.data.item[0];
                            }
                        }
                        if (firstNode && firstNode.isExpanded() === false) {
                            firstNode.expand();
                        }
                    }
                }
            },
            hideHeaders: true,
            useArrows: true,
            columns: [{
                xtype: 'treecolumn',
                flex: 1,
                notAutoWidth: true,
                dataIndex: me.displayField,
                //picker: me,
                renderer: function (value, metaData) {
                    if (metaData) {
                        metaData.tdAttr = 'data-qtip="' + value + '"';
                    }

                    return value;
                }
            }],
            refresh: function () { }
        });

        //解决火狐下点击选择框关闭的问题
        me.originalCollapse = me.collapse;
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

        var picker = Ext.ComponentManager.create(Ext.isFunction(pickerConfig) ? pickerConfig.call() : pickerConfig, "panel");

        return picker;
    },

    checkedNode: function (node, check) {
        node.set('checked', check);
        this.selectNode(node, check);
    },

    selectNodeRecord: function (node, check) {
        var me = this;
        if (check) {
            if (node.get('checked') === true || node.get('checked') === false) {
                node.set('checked', true);
            }
        } else {
            if (node.get('checked') === true || node.get('checked') === false) {
                node.set('checked', false);
            }
        }
    },
    selectNode: function (node, check) {
        var me = this,
            selModel = me.pickerSelectionModel;
        if (!me.valueIsContainRoot && !node.isLeaf()) {
            return;
        }
        me.selectNodeRecord(node, check);
        if (check) {
            selModel.select(node, true, true);
        } else {
            selModel.deselect(node, true);
        }
    },

    checkedChild: function (view, checked) {
        var pCheck = checked || view.get('checked');
        for (var i = 0; i < view.childNodes.length; i++) {
            var cCheck = view.childNodes[i].get('checked');
            if (cCheck != pCheck) {
                this.checkedNode(view.childNodes[i], pCheck);
            }
            if (view.childNodes[i].childNodes.length > 0) {
                this.checkedChild(view.childNodes[i]);
            }
        }
    },

    checkedParent: function (view) {
        if (view.parentNode) {
            var isHasChildChecked = false;
            view.parentNode.eachChild(function (view) {
                if (view.get('checked')) {
                    isHasChildChecked = true;
                    return false;
                }
            });
            this.checkedNode(view.parentNode, isHasChildChecked);
            if (view.parentNode.parentNode) {
                this.checkedParent(view.parentNode);
            }
        }
    },

    onSelectItem: function (node, checked, eOpts) {
        var me = this,
            picker = me.picker,
            records,
            selRecords,
            selModel = me.pickerSelectionModel;

        if (Ext.Array.contains(me.selectModel, 'p-c')) {
            me.checkedChild(node);
        }
        if (Ext.Array.contains(me.selectModel, 'c-p')) {
            me.checkedParent(node);
        }

        this.selectNode(node, checked);
    },

    clearTreeChecked: function () {
        var me = this,
            picker = me.picker,
            records;
        if (picker) {
            records = picker.getChecked();
            if (records) {
                Ext.each(records, function (item) {
                    item.set('checked', false);
                });
                me.pickerSelectionModel.deselectAll();
            }
        }
    },

    getTreeStoreAllData: function () {
        var me = this,
            _allData = [],
            store = me.getStore(),
            root = store.getRootNode();

        var getLenByNode = function (node) {
            if (!node.isLeaf()) {
                if (me.valueIsContainRoot) {
                    _allData.push(node);
                }
                for (var i = 0; i < node.childNodes.length; i++) {
                    getLenByNode(node.childNodes[i]);
                }
            } else {
                _allData.push(node);
            }
        }
        getLenByNode(root);
        return _allData;
    },

    //setValue: function (value) {
    //    var me = this;
    //    // Value needs matching and record(s) need selecting.
    //    if (value != null) {
    //        if (!value) {
    //            me.isSelectAll = false;
    //            return me;
    //        }
    //        if (me.isSelectAll) {
    //            return me.doSetValue(me.getTreeStoreAllData());
    //        }

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
    //    if (me.isHandleAllValue && me.multiSelect && Ext.isArray(value)) {
    //        if (me.getAllLength() === value.length) {
    //            me.isSelectAll = true;
    //            return me.multiAllValue;
    //        }
    //        me.isSelectAll = false;
    //    }
    //    return value;
    //},

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
                    checkOnly: true,
                    addCheckbox: function (view, initial) {
                    },
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
                //picker.setSelectionModel(me.pickerSelectionModel);
                if (picker.getStore() !== store) {
                    picker.bindStore(store);
                }
            }
        }
    },
    doAutoSelect: function () {

    },

    getRecordByValue: function (nodes, value) {
        var me = this,
            result = null;

        if (!nodes || !nodes.length) return result;
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].get(me.valueField) == value) {
                return nodes[i];
            }
            if (nodes[i].childNodes) {
                result = me.getRecordByValue(nodes[i].childNodes, value);
                if (result != null) return result;
            }
        }
        return result;
    },

    /**
 * Finds the record by searching values in the {@link #valueField}.
 * @param {Object} value The value to match the field against.
 * @return {Ext.data.Model} The matched record or `false`.
 */
    findRecordByValue: function (value) {
        var result = this.getRecordByValue(this.store.data.items, value),
            ret = false;

        // If there are duplicate keys, tested behaviour is to return the *first* match.
        if (result) {
            ret = result[0] || result;
        }
        return ret;
    },

    /**
     * @private
     * Sets or adds a value/values
     */
    doSetValue: function (value /* private for use by addValue */, add) {
        var me = this,
            store = me.getStore(),
            Model = store.getModel(),
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
            i, len, record, dataObj,
            valueChanged, key;

        //<debug>
        if (add && !me.multiSelect) {
            Ext.raise('Cannot add values to non multiSelect ComboBox');
        }
        //</debug>

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
                if (add) {
                    me.value = Ext.Array.from(me.value).concat(value);
                } else {
                    me.value = value;
                }

                me.setHiddenValue(me.value);

                // If we know that the display value is the same as the value, then show it.
                // A store load is still scheduled so that the matching record can be published.
                me.setRawValue(displayIsValue ? value : '');
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
                record = me.findRecordByValue(key = record);

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
            if (!me.picker) {
                var dd = me.getPicker();
            }
            // beginUpdate which means we only want to notify this.onValueCollectionEndUpdate after it's all changed.
            me.suspendEvent('select');
            me.valueCollection.beginUpdate();
            if (matchedRecords.length) {
                for (var i = 0; i < matchedRecords.length; i++) {
                    me.onSelectItem(matchedRecords[i], true);
                    //me.selectNodeRecord(matchedRecords[i], true);
                }
            } else {
                me.onSelectItem(store.getRoot(), false);
            }
            me.valueCollection.endUpdate();
            me.resumeEvent('select');
        } else {
            me.updateValue();
        }

        return me;
    }
});

