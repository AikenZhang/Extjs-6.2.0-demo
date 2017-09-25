/* ***********************************************
 * author :  ***
 * function: 表格行内面板
 * history:  created by *** 2015/7/2 15:56:45 
 * ***********************************************/
Ext.define('Fm.ux.grid.plugin.CisRowExpander', {
    extend: 'Ext.plugin.Abstract',
    lockableScope: 'normal',
    requires: ['Ext.grid.feature.RowBody'],
    alias: 'plugin.cisrowexpander',
    columnWidth: 24,
    mixins: {
        observable: 'Ext.util.Observable'
    },
    /**
     * 是否展开第一行
     */
    autoExpandFirstRow: true,
    /**
     * 是否只能展开一行 为true时 行没有前面的 + 号
     */
    singleExpand: true,
    isRowExpander: true,
    rowBodyTpl: null,
    lockedTpl: null,
    /**
     * 是否Enter键展开
     */
    expandOnEnter: false,
    /**
     * 是否单击行展开
     */
    expandOnClick: true,
    /**
     * 是否双击行折叠
     */
    closeOnDblClick: true,
    /**
     * 是否选中行展开
     */
    selectRowOnExpand: false,
    headerWidth: 24,
    bodyBefore: false,
    hiddenColumn: false,
    rowBodyTrSelector: '.' + Ext.baseCSSPrefix + 'grid-rowbody-tr',
    rowBodyHiddenCls: Ext.baseCSSPrefix + 'grid-row-body-hidden',
    rowCollapsedCls: Ext.baseCSSPrefix + 'grid-row-collapsed',
    swallowBodyEvents: true,
    addCollapsedCls: {
        fn: function (out, values, parent) {
            var me = this.rowExpander;
            if (!me.recordsExpanded[values.record.internalId]) {
                values.itemClasses.push(me.rowCollapsedCls);
            }
            this.nextTpl.applyOut(values, out, parent);
        },
        syncRowHeights: function (lockedItem, normalItem) {
            this.rowExpander.syncRowHeights(lockedItem, normalItem);
        },
        priority: 20000
    },
    constructor: function (config) {
        this.callParent(arguments);
        this.mixins.observable.constructor.call(this);
        this.fitCmpWidth = Ext.Function.createDelayed(this.fitCmpWidth, 1);
    },
    setCmp: function (grid) {
        var me = this,
        features;
        this.callParent(arguments);
        this.recordsExpanded = {};
        this.preventsExpanding = {};
        this.bodyContent = {};
        if (!this.rowBodyTpl) {
            this.rowBodyTpl = "";
        }
        if (!Ext.isEmpty(this.rowBodyTpl) && (this.loader || this.component)) {
            this.cmpBodyTpl = (this.rowBodyTpl instanceof Ext.XTemplate) ? this.rowBodyTpl : Ext.create('Ext.XTemplate', this.rowBodyTpl);
            this.rowBodyTpl = "";
        }
        this.rowBodyTpl = (this.rowBodyTpl instanceof Ext.XTemplate) ? this.rowBodyTpl : Ext.create('Ext.XTemplate', this.rowBodyTpl);
        features = me.getFeatureConfig(grid);
        if (grid.features) {
            grid.features = Ext.Array.push(features, grid.features);
        } else {
            grid.features = features;
        }
        this.componentsCache = [];
        this.outerComponentsCache = [];
        if (this.component && this.singleExpand === false) {
            this.componentCfg = this.component;
            delete this.component;
        }
        if (this.component && !this.component.initialConfig) {
            this.component.monitorResize = true;
            this.componentCfg = this.component;
            this.component = Ext.ComponentManager.create(Ext.isFunction(this.component) ? this.component.call({
                expander: this
            }) : this.component, "panel");
            this.component.on({
                render: function () {
                    var comp = this;
                    me.swallowRow(comp);
                    Ext.each(comp.query('textfield,textarea'), function (tempText) {
                        tempText.on({
                            focus: function (a, b, c, d) {
                                grid.getStore().suspendEvents();
                            },
                            blur: function (a) {
                                grid.getStore().resumeEvents();
                            }
                        });
                    });
                }
            })
        }
    },
    getFeatureConfig: function (grid) {
        var me = this,
        features = [],
        featuresCfg = {
            ftype: 'rowbody',
            rowExpander: me,
            bodyBefore: me.bodyBefore,
            recordsExpanded: this.recordsExpanded,
            rowBodyHiddenCls: this.rowBodyHiddenCls,
            rowCollapsedCls: this.rowCollapsedCls,
            setupRowData: this.getRowBodyFeatureData,
            setup: this.setup,
            expander: this
        };
        features.push(Ext.apply({
            lockableScope: 'normal',
            getRowBodyContents: me.getRowBodyContentsFn(me.rowBodyTpl)
        },
        featuresCfg));
        if (grid.enableLocking) {
            features.push(Ext.apply({
                lockableScope: 'locked',
                getRowBodyContents: me.lockedTpl ? me.getRowBodyContentsFn(me.lockedTpl) : function () {
                    return '';
                }
            },
            featuresCfg));
        }
        return features;
    },
    getRowBodyContentsFn: function (rowBodyTpl) {
        var me = this;
        return function (rowValues) {
            rowBodyTpl.owner = me;
            return rowBodyTpl.applyTemplate(rowValues.record.getData()) || this.rowExpander.bodyContent[rowValues.record.internalId];
        };
    },
    getExpanded: function () {
        var store = this.grid.store,
        expandedRecords = [];
        (store.store || store).each(function (record, index) {
            if (this.recordsExpanded[record.internalId]) {
                expandedRecords.push(record);
            }
        },
        this);
        return expandedRecords;
    },
    init: function (grid) {
        if (grid.lockable) {
            grid = grid.normalGrid;
        }
        var me = this,
        ownerLockable = grid.ownerLockable,
        lockedView;
        this.callParent(arguments);
        this.grid = grid;
        me.view = grid.getView();
        me.bindView(me.view);
        me.view.addRowTpl(me.addCollapsedCls).rowExpander = me;
        if (ownerLockable) {
            me.addExpander(ownerLockable.lockedGrid.headerCt.items.getCount() ? ownerLockable.lockedGrid : grid);
            lockedView = ownerLockable.lockedGrid.getView();
            me.bindView(lockedView);
            lockedView.addRowTpl(me.addCollapsedCls).rowExpander = me;
            ownerLockable.syncRowHeight = true;
            ownerLockable.mon(ownerLockable, {
                processcolumns: me.onLockableProcessColumns,
                lockcolumn: me.onColumnLock,
                unlockcolumn: me.onColumnUnlock,
                scope: me
            });
            me.viewListeners = view.on({
                itemadd: Ext.Function.createAnimationFrame(ownerLockable.syncRowHeights, ownerLockable)
            });
        } else {
            me.addExpander(grid);
            grid.on('beforereconfigure', me.beforeReconfigure, me);
        }
        //grid.headerCt.on("columnresize", this.updateComponentsWidth, this, {
        //    delay: 20,
        //    buffer: 20
        //});
        grid.headerCt.on("columnhide", this.updateComponentsWidth, this, {
            delay: 20,
            buffer: 20
        });
        grid.headerCt.on("columnshow", this.updateComponentsWidth, this, {
            delay: 20,
            buffer: 20
        });
        me.expands = [];
    },
    updateComponentsWidth: function () {
        var i, grid = this.grid,
            store = (grid.store.store || grid.store),
        body, len = this.componentsCache.length,
        item;
        try {
            if (this.component && this.component.record && this.recordsExpanded[this.component.record.internalId]) {
                var _node = Ext.get(grid.view.getNode(store.getByInternalId(this.component.record.internalId)));
                if (_node && _node.down) {
                    body = _node.down("div.x-grid-rowbody");
                    this.component.setWidth(body.getWidth() - body.getPadding("lr") - (this.scrollOffset || 0));
                }
            }
            if (this.componentsCache && len > 0) {
                for (i = 0; i < len; i++) {
                    item = this.componentsCache[i];
                    if (this.recordsExpanded[item.id]) {
                        body = Ext.get(grid.view.getNode(store.getByInternalId(item.id))).down("div.x-grid-rowbody");
                        item.cmp.setWidth(body.getWidth() - body.getPadding("lr") - (this.scrollOffset || 0));
                    }
                }
            }
        } catch (e) { }
    },
    beforeReconfigure: function (grid, store, columns, oldStore, oldColumns) {
        var me = this;
        if (me.viewListeners) {
            me.viewListeners.destroy();
        }
        if (columns) {
            me.expanderColumn = new Ext.grid.Column(me.getHeaderConfig());
            columns.unshift(me.expanderColumn);
        }
    },
    onLockableProcessColumns: function (lockable, lockedHeaders, normalHeaders) {
        this.addExpander(lockedHeaders.length ? lockable.lockedGrid : lockable.normalGrid);
    },
    addExpander: function (expanderGrid) {
        var me = this,
        expanderHeader = me.getHeaderConfig();
        //单击展开为true时 不添加展开列
        if (!me.expandOnClick) {
            if (expanderGrid.isLocked && expanderGrid.ownerLockable.shrinkWrapLocked) {
                expanderGrid.width += expanderHeader.width;
            }
            me.expanderColumn = expanderGrid.headerCt.insert(0, expanderHeader);
            expanderGrid.getSelectionModel().injectCheckbox = 1;
        }
    },
    getRowBodyFeatureData: function (record, idx, rowValues) {
        var me = this;
        me.self.prototype.setupRowData.apply(me, arguments);
        rowValues.rowBody = me.getRowBodyContents(rowValues);
        rowValues.rowBodyCls = me.recordsExpanded[record.internalId] ? '' : me.rowBodyHiddenCls;
    },
    setup: function (rows, rowValues) {
        var me = this,
        lockable = me.grid.ownerLockable;
        me.self.prototype.setup.apply(me, arguments);
        if (lockable && Ext.Array.indexOf(me.grid.columnManager.getColumns(), me.rowExpander.expanderColumn) !== -1) {
            rowValues.rowBodyColspan -= 1;
        }
    },
    bindView: function (view) {
        view.stopEventFn = this.stopEventFn;
        view.on("beforerefresh",
        function () {
            this.preventsExpanding = {};
        },
        this);
        if (this.expandOnEnter) {
            view.on('itemkeydown', this.onKeyDown, this);
        }
        if (this.closeOnDblClick) {
            view.on('itemdblclick', this.onDblClick, this);
        }
        if (this.expandOnClick) {
            view.on('itemclick', this.onClick, this);
        }
        if (this.autoExpandFirstRow) {
            var me = this;
            view.ownerCt.on('expandfirstrow', this.onExpandFirstRow, this);
            view.on('refresh', function () {
                this.fireEvent('expandfirstrow', this)
            }, view.ownerCt);
        }
        view.on('itemmousedown',
        function (view, record, item, index, e) {
            return !e.getTarget('div.x-grid-rowbody', view.el);
        },
        this);
        if ((this.componentCfg && this.singleExpand === false) || this.loader) {
            view.on("beforerefresh", this.mayRemoveComponents, this);
            view.on("beforeitemupdate", this.mayRemoveComponent, this);
            view.on("beforeitemremove", this.removeComponent, this);
            view.on("refresh", this.restoreComponents, this);
            view.on("itemupdate", this.restoreSingleComponent, this);
            view.on("itemadd", this.onExpandMemRows, this);
        }
        if (this.component) {
            view.on("beforerefresh", this.moveComponent, this);
            view.on("beforeitemupdate", this.moveComponent, this);
            view.on("beforeitemremove", this.moveComponent, this);
            view.on("refresh", this.restoreComponent, this);
            view.on("itemupdate", this.restoreComponent, this);

            view.on("itemremove", this.moveComponent, this);
            view.on("itemadd", this.restoreComponent, this);
            view.ownerCt.on('show', this.restoreComponent, this);
        }
    },
    moveComponent: function () {
        if (!this.componentInsideGrid) {
            return;
        }
        var ce = this.component.getEl(),
        //el = Ext.net.ResourceMgr.getAspForm() || Ext.getBody();
        el = Ext.getBody();
        ce.addCls("x-hidden");
        el.dom.appendChild(ce.dom);
        this.componentInsideGrid = false;
    },
    removeComponent: function (view, record, rowIndex) {
        for (var i = 0,
        l = this.componentsCache.length; i < l; i++) {
            if (this.componentsCache[i].id == record.internalId) {
                try {
                    var cmp = this.componentsCache[i].cmp;
                    cmp.destroy();
                    Ext.Array.remove(this.componentsCache, this.componentsCache[i]);
                } catch (ex) { }
                break;
            }
        }
    },
    mayRemoveComponent: function (view, record, rowIndex) {
        if (this.invalidateComponentsOnRefresh) {
            this.removeComponents(view, record, rowIndex);
            return;
        }
        var item, ce, elTo;
        for (var i = 0,
        l = this.componentsCache.length; i < l; i++) {
            item = this.componentsCache[i];
            if (item.id == record.internalId) {
                ce = item.cmp.getEl();
                elTo = Ext.getBody();
                ce.addCls("x-hidden");
                elTo.dom.appendChild(ce.dom);
                this.outerComponentsCache.push(item);
                Ext.Array.remove(this.componentsCache, item);
                break;
            }
        }
    },
    mayRemoveComponents: function () {
        if (this.invalidateComponentsOnRefresh) {
            this.removeComponents();
            return;
        }
        var cmp, ce, elTo = Ext.getBody();
        for (var i = 0,
        l = this.componentsCache.length; i < l; i++) {
            cmp = this.componentsCache[i].cmp;
            ce = cmp.getEl();
            ce.addCls("x-hidden");
            elTo.dom.appendChild(ce.dom);
        }
        this.outerComponentsCache = this.componentsCache;
        this.componentsCache = [];
    },
    removeComponents: function (outer) {
        for (var i = 0,
        l = this.componentsCache.length; i < l; i++) {
            try {
                var cmp = this.componentsCache[i].cmp;
                cmp.destroy();
            } catch (ex) { }
        }
        this.componentsCache = [];
        if (outer && this.outerComponentsCache) {
            for (var i = 0,
            l = this.outerComponentsCache.length; i < l; i++) {
                try {
                    var cmp = this.outerComponentsCache[i].cmp;
                    cmp.destroy();
                } catch (ex) { }
            }
            this.outerComponentsCache = [];
        }
    },
    restoreComponent: function () {
        if (this.component.rendered === false) {
            return;
        }
        var grid = this.grid;
        Ext.each(grid.getView().getViewRange(),
        function (record, i) {
            if (record.isCollapsedPlaceholder) {
                return;
            }
            if (this.recordsExpanded[record.internalId]) {
                var rowNode = grid.view.getNode(record, false),
                row = Ext.get(rowNode),
                body = row.down("div.x-grid-rowbody"),
                rowCmp = this.getComponent(record, body);
                body.appendChild(this.component.getEl());
                this.component.removeCls("x-hidden");
                this.componentInsideGrid = true;
                return false;
            }
        },
        this);
        grid.view.refreshSize(true);
        this.fitCmpWidth(this.component);
    },
    onRowCmpLoad: function (loader, response, options) {
        var expander = loader.paramsFnScope.expander,
        grid = expander.grid,
        target = loader.getTarget();
        grid.view.refreshSize(true);
        expander.fitCmpWidth(target);
    },
    createComponent: function (record, body) {
        var rowCmp, needContainer, scope, box, loader;
        if (this.loader) {
            needContainer = !(this.loader.renderer == "html" || this.loader.renderer == "data");
            scope = {
                record: record,
                expander: this,
                el: body,
                grid: this.grid
            };
            loader = Ext.isFunction(this.loader) ? this.loader.call(scope) : Ext.clone(this.loader);
            loader.paramsFnScope = scope;
            loader.success = this.onRowCmpLoad;
            rowCmp = Ext.create(needContainer ? "Ext.container.Container" : "Ext.Component", {
                loader: loader,
                layout: "anchor",
                defaults: {
                    anchor: "100%"
                },
                tpl: !Ext.isEmpty(this.cmpBodyTpl) ? ((this.cmpBodyTpl instanceof Ext.XTemplate) ? this.cmpBodyTpl : Ext.create('Ext.XTemplate', this.cmpBodyTpl)) : undefined
            });
        } else {
            rowCmp = Ext.ComponentManager.create(Ext.isFunction(this.componentCfg) ? this.componentCfg.call({
                record: record,
                expander: this
            }) : Ext.clone(this.componentCfg), "panel");
        }
        if (this.componentMargin) {
            rowCmp.margin = this.componentMargin;
        }
        rowCmp.ownerCt = this.grid;
        rowCmp.record = record;
        rowCmp.width = body.getWidth() - (this.scrollOffset || 0);
        rowCmp.render(body);
        rowCmp.addCls("x-row-expander-control");
        this.componentsCache.push({
            id: record.internalId,
            cmp: rowCmp
        });
        return rowCmp;
    },
    restoreSingleComponent: function (record, index, node) {
        var grid = this.grid;
        if (record.isCollapsedPlaceholder) {
            return;
        }
        if (this.recordsExpanded[record.internalId]) {
            var rowNode = grid.view.getNode(record, false),
            row = Ext.get(rowNode),
            nextBd = row.down(this.rowBodyTrSelector),
            body = row.down("div.x-grid-rowbody"),
            rowCmp = this.getComponent(record, body);
            if (!rowCmp) {
                rowCmp = this.createComponent(record, body);
            }
            grid.view.refreshSize(true);
            this.fitCmpWidth(rowCmp);
        }
    },
    restoreComponents: function () {
        var grid = this.grid,
        cmps = [];
        Ext.each(grid.getView().getViewRange(),
        function (record, i) {
            if (record.isCollapsedPlaceholder) {
                return;
            }
            if (this.recordsExpanded[record.internalId]) {
                var rowNode = grid.view.getNode(record, false),
                row = Ext.get(rowNode),
                nextBd = row.down(this.rowBodyTrSelector),
                body = row.down("div.x-grid-rowbody"),
                rowCmp = this.getComponent(record, body);
                if (!rowCmp) {
                    rowCmp = this.createComponent(record, body);
                }
                cmps.push(rowCmp);
            }
        },
        this);
        this.removeOuterOrphans();
        if (grid.view.viewReady) {
            grid.view.refreshSize(true);
        }
        Ext.each(cmps,
        function (cmp) {
            this.fitCmpWidth(cmp);
        },
        this);
    },
    removeOuterOrphans: function () {
        if (this.outerComponentsCache && this.outerComponentsCache.length > 0) {
            var len = this.outerComponentsCache.length,
            store = (this.grid.store.store || this.grid.store),
            records = store.data.items,
            len2 = records.length,
            r, found, i = 0,
            item;
            while (i < len) {
                item = this.outerComponentsCache[i];
                found = false;
                for (r = 0; r < len2; r++) {
                    if (records[r].internalId == item.id) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    try {
                        item.cmp.destroy();
                    } catch (ex) { }
                    Ext.Array.remove(this.outerComponentsCache, item);
                    len--;
                } else {
                    i++;
                }
            }
        }
    },
    swallowRow: function (comp) {
        if (this.swallowBodyEvents) {
            comp.getEl().swallowEvent(['click', 'mousedown', 'mousemove', 'mouseup', 'dblclick', 'contextmenu', 'mouseover', 'mouseout'], false);
        }
    },
    onKeyDown: function (view, record, row, rowIdx, e) {
        if (e.getKey() === e.ENTER) {
            var ds = (view.store.store || view.store),
            sels = view.getSelectionModel().getSelection(),
            ln = sels.length,
            i = 0;
            for (; i < ln; i++) {
                if (!this.preventsExpanding[sels[i].internalId]) {
                    rowIdx = ds.indexOf(sels[i]);
                    this.toggleRow(rowIdx, sels[i]);
                }
            }
        }
    },
    beforeExpand: function (record, body, rowNode, rowIndex) {
        if (this.fireEvent("beforeexpand", this, record, body, rowNode, rowIndex) !== false) {
            if (this.singleExpand || this.component) {
                this.collapseAll();
            }
            return true;
        } else {
            return false;
        }
    },
    expandAll: function () {
        if (this.singleExpand || this.component) {
            return;
        }
        var i = 0,
        records = this.view.getViewRange(),
        store = (this.grid.store.store || this.grid.store),
        len = records.length;
        for (i; i < len; i++) {
            this.toggleRow(store.indexOf(records[i]), records[i], true);
        }
    },
    collapseAll: function () {
        try {
            var i = 0,
            records = this.view.getViewRange(),
            store = (this.grid.store.store || this.grid.store),
            len = records.length;
            for (i; i < len; i++) {
                this.toggleRow(store.indexOf(records[i]), records[i], false);
            }
            this.recordsExpanded = {};
            this.grid.view.rowBodyFeature.recordsExpanded = this.recordsExpanded;
        } catch (e) {
        }
    },
    collapseRow: function (row) {
        this.toggleRow(row, this.view.getRecord(this.view.getNode(row)), false);
    },
    expandRow: function (row) {
        try {
            if (!Ext.get(row.offsetParent).hasCls(this.rowCollapsedCls)) {
                return;
            }
            this.toggleRow(row, this.view.getRecord(this.view.getNode(row)), true);
        } catch (e) { }
    },
    toggleRow: function (rowIdx, record, state) {
        if (record.isCollapsedPlaceholder) {
            return;
        }
        var me = this,
        view = this.view,
        bufferedRenderer = view.bufferedRenderer,
        scroller = view.getScrollable(),
        fireView = view,
        rowNode = this.view.getNode(record, false),
        normalRow = Ext.get(rowNode),
        lockedRow;
        try {
            normalRow.down(this.rowBodyTrSelector)
        } catch (e) {
            return;
        }

        var nextBd = normalRow.down(this.rowBodyTrSelector),
        body = normalRow.down("div.x-grid-rowbody"),
        hasState = Ext.isDefined(state),
        wasCollapsed = normalRow.hasCls(me.rowCollapsedCls),
        addOrRemoveCls = wasCollapsed ? 'removeCls' : 'addCls',
        grid = this.grid,
        rowCmp,
        needContainer,
        rowSpan = wasCollapsed ? 2 : 1,
        ownerLockable = me.grid.ownerLockable,
        expanderCell;
        rowIdx = (grid.store.store || grid.store).indexOf(record);
        Ext.suspendLayouts();
        if ((!hasState) || (hasState && state === true)) {
            if (this.beforeExpand(record, nextBd, rowNode, rowIdx)) {
                normalRow.removeCls(this.rowCollapsedCls);
                nextBd.removeCls(this.rowBodyHiddenCls);
                this.recordsExpanded[record.internalId] = true;
                if (this.component) {
                    if (this.recreateComponent) {
                        this.component.destroy();
                        this.component = Ext.ComponentManager.create(Ext.isFunction(this.componentCfg) ? this.componentCfg.call({
                            record: record,
                            expander: this
                        }) : this.componentCfg, "panel");
                    }
                    if (this.component.rendered) {
                        body.appendChild(this.component.getEl());
                        this.component.show();
                        this.component.setWidth(body.getWidth() - (this.scrollOffset || 0));
                    } else {
                        this.component.width = body.getWidth() - (this.scrollOffset || 0);
                        this.component.render(body);
                    }
                    this.component.addCls("x-row-expander-control");
                    this.component.removeCls("x-hidden");
                    this.componentInsideGrid = true;
                    rowCmp = this.component;
                } else if (this.componentCfg || this.loader) {
                    rowCmp = this.getComponent(record, body);
                    if (!rowCmp) {
                        rowCmp = this.createComponent(record, body);
                    } else {
                        rowCmp.show();
                    }
                }
                if (rowCmp) {
                    rowCmp.record = record;
                    this.fitCmpWidth(rowCmp);
                }
                this.expands.push(record);

                //var _height = rowCmp.getHeight();
                //if (_height > 5) {
                //    grid.getView().setScrollY(rowIdx * 23);
                //}

                this.fireEvent('expand', this, record, rowCmp, nextBd, rowNode, rowIdx);
            }
        } else if ((!normalRow.hasCls(this.rowCollapsedCls) && !hasState) || (hasState && state === false && !normalRow.hasCls(this.rowCollapsedCls))) {
            if (this.fireEvent("beforecollapse", this, record, nextBd, rowNode, rowIdx) !== false) {
                if (this.component && this.component.rendered) {
                    this.component.hide();
                } else if (this.componentCfg || this.loader) {
                    rowCmp = this.getComponent(record, body);
                    if (rowCmp && rowCmp.rendered) {
                        rowCmp.hide();
                    }
                }
                normalRow.addCls(this.rowCollapsedCls);
                nextBd.addCls(this.rowBodyHiddenCls);
                this.recordsExpanded[record.internalId] = false;
                Ext.Array.remove(this.expands, record);
                this.fireEvent('collapse', this, record, rowCmp, nextBd, rowNode, rowIdx);
            }
        }
        if (me.grid.ownerLockable) {
            fireView = ownerLockable.getView();
            if (ownerLockable.lockedGrid.isVisible()) {
                view = ownerLockable.view.lockedGrid.view;
                lockedRow = Ext.fly(view.getNode(rowIdx));
                if (lockedRow) {
                    lockedRow[addOrRemoveCls](me.rowCollapsedCls);
                    nextBd = lockedRow.down(me.rowBodyTrSelector, true);
                    Ext.fly(nextBd)[addOrRemoveCls](me.rowBodyHiddenCls);
                }
            }
        }
        if (me.expanderColumn) {
            expanderCell = Ext.fly(view.getRow(rowIdx)).down(me.expanderColumn.getCellSelector(), true);
            if (expanderCell) {
                expanderCell.rowSpan = rowSpan;
            }
        }
        fireView.fireEvent(wasCollapsed ? 'expandbody' : 'collapsebody', rowNode, record, nextBd);
        if (view.getSizeModel().height.shrinkWrap || ownerLockable) {
            view.refreshSize(true);
        }
        if (scroller) {
            if (bufferedRenderer) {
                bufferedRenderer.refreshSize();
            } else {
                scroller.refresh(true);
            }
        }
        Ext.resumeLayouts(true);
    },
    onDblClick: function (view, record, row, rowIdx, e) {
        if (!this.preventsExpanding[record.internalId] && !e.getTarget(this.rowBodyTrSelector, view.el)) {
            if (this.isExpanded(row)) {
                this.collapseRow(row);
            }
        }
    },
    onClick: function (view, record, row, rowIdx, e) {
        var me = this,
            grid = me.grid,
            selectChx;

        if (grid.getSelectionModel) {
            selectChx = grid.getSelectionModel();
        }
        //SelectionModel为checkOnly时点击选择框不执行
        if (selectChx && selectChx.checkOnly && e.position.colIdx === selectChx.injectCheckbox) {
            return false;
        }
        if (this.isExpanded(row)) {
            return;
        }
        if (!this.preventsExpanding[record.internalId] && !e.getTarget(this.rowBodyTrSelector, view.el)) {
            this.collapseAll();
            this.toggleRow(rowIdx, record);
        }
    },
    /**
     * 展开大数据时 动态缓存行   解决bufferedRenderer 时的bug
     */
    onExpandMemRows: function (grid) {
        var me = this,
            view = me.grid.view,
            row;

        for (var i = 0; i < this.expands.length; i++) {
            var rowNode = view.getNode(this.expands[i], false);
            row = Ext.get(rowNode);
            if (row) {
                setTimeout(function () {
                    me.expandRow(row);
                }, 100);
            }
        }
    },
    onExpandFirstRow: function (grid) {
        var me = this,
            view = grid.view,
            row = view.getRow(0),
            record = grid.getStore().getAt(0);
        if (!row) {
            return;
        }
        me.recordsExpanded[record.internalId] = true;
        //me.expandRow(row);
        me.collapseAll();
        setTimeout(function () {
            if (Ext.get(row)) {
                try {
                    me.expandRow(row);
                } catch (e) { }
            }
            //var record = grid.getStore().getAt(0);
            //view.onRowSelect(record);
            //row.click();
        }, 100);
    },
    renderer: Ext.emptyFn,
    syncRowHeights: function (lockedItem, normalItem) {
        var me = this,
        lockedBd = Ext.fly(lockedItem).down(me.rowBodyTrSelector),
        normalBd = Ext.fly(normalItem).down(me.rowBodyTrSelector),
        lockedHeight,
        normalHeight;
        if (normalBd.isVisible()) {
            if ((lockedHeight = lockedBd.getHeight()) !== (normalHeight = normalBd.getHeight())) {
                if (lockedHeight > normalHeight) {
                    normalBd.setHeight(lockedHeight);
                } else {
                    lockedBd.setHeight(normalHeight);
                }
            }
        } else {
            lockedBd.dom.style.height = normalBd.dom.style.height = '';
        }
    },
    onColumnUnlock: function (lockable, column) {
        var me = this,
        lockedColumns;
        lockable = me.grid.ownerLockable;
        lockedColumns = lockable.lockedGrid.visibleColumnManager.getColumns();
        if (lockedColumns.length === 1) {
            if (lockedColumns[0] === me.expanderColumn) {
                lockable.unlock(me.expanderColumn);
                me.grid = lockable.normalGrid;
            } else {
                lockable.lock(me.expanderColumn, 0);
            }
        }
    },
    onColumnLock: function (lockable, column) {
        var me = this,
        lockedColumns, lockedGrid;
        lockable = me.grid.ownerLockable;
        lockedColumns = lockable.lockedGrid.visibleColumnManager.getColumns();
        if (lockedColumns.length === 1) {
            me.grid = lockedGrid = lockable.lockedGrid;
            lockedGrid.headerCt.insert(0, me.expanderColumn);
        }
    },
    getHeaderConfig: function () {
        var me = this,
        lockable = me.grid.ownerLockable;
        return {
            width: me.headerWidth,
            isExpanderColumn: true,
            lockable: false,
            sortable: false,
            resizable: false,
            draggable: false,
            hideable: false,
            menuDisabled: true,
            hidden: this.hiddenColumn,
            tdCls: Ext.baseCSSPrefix + 'grid-cell-special',
            innerCls: Ext.baseCSSPrefix + 'grid-cell-inner-row-expander',
            preinitScope: me,
            preinitFn: function (column) {
                this.expanderColumn = column;
            },
            renderer: function (value, metadata, record) {
                var res = me.renderer.apply(this, arguments);
                if (res === false) {
                    res = "&#160;";
                    me.preventsExpanding[record.internalId] = true;
                } else if (res === true) {
                    res = null;
                }
                if (me.recordsExpanded[record.internalId]) {
                    metadata.tdAttr += ' rowspan="2"';
                }
                return res ? res : ('<div class="' + Ext.baseCSSPrefix + 'grid-row-expander" role="presentation"></div>');
            },
            processEvent: function (type, view, cell, rowIndex, cellIndex, e, record) {
                if (e.getTarget('.' + Ext.baseCSSPrefix + 'grid-row-expander')) {
                    if (type === "click") {
                        me.toggleRow(rowIndex, record);
                        return me.selectRowOnExpand;
                    }
                }
            },
            isLocked: function () {
                return lockable && (lockable.lockedGrid.isVisible() || this.locked);
            },
            editRenderer: function () {
                return '&#160;';
            }
        };
    },
    isCollapsed: function (row) {
        if (typeof row === "number") {
            row = this.view.getNode(row);
        }
        return Ext.fly(row).hasCls(this.rowCollapsedCls);
    },
    isExpanded: function (row) {
        if (typeof row === "number") {
            row = this.view.getNode(row);
        }
        return !Ext.fly(row).hasCls(this.rowCollapsedCls);
    },
    getComponent: function (record, body) {
        var i, l, item, cmp;
        if (this.componentsCache) {
            for (i = 0, l = this.componentsCache.length; i < l; i++) {
                item = this.componentsCache[i];
                if (item.id == record.internalId) {
                    if (body) {
                        item.cmp.setWidth(body.getWidth() - (this.scrollOffset || 0));
                    }
                    return item.cmp;
                }
            }
        }
        if (this.outerComponentsCache) {
            for (i = 0, l = this.outerComponentsCache.length; i < l; i++) {
                if (this.outerComponentsCache[i].id == record.internalId) {
                    item = this.outerComponentsCache[i];
                    cmp = item.cmp;
                    if (body) {
                        body.appendChild(cmp.getEl());
                        cmp.removeCls("x-hidden");
                        cmp.setWidth(body.getWidth() - (this.scrollOffset || 0));
                        Ext.Array.remove(this.outerComponentsCache, item);
                        this.componentsCache.push(item);
                    }
                    return cmp;
                }
            }
        }
        return null;
    },
    destroy: function () {
        if (this.component && Ext.isFunction(this.component.destroy)) {
            this.component.destroy();
        }
        if (this.componentsCache) {
            this.removeComponents(true);
        }
    },
    fitCmpWidth: function (cmp) {
        if (cmp && cmp.record && this.recordsExpanded[cmp.record.internalId]) {
            var row = Ext.get(this.grid.view.getNode((this.grid.store.store || this.grid.store).getByInternalId(cmp.record.internalId)));
            if (row) {
                var body = row.down("div.x-grid-rowbody");
                cmp.setWidth(body.getWidth() - body.getPadding("lr") - (this.scrollOffset || 0));
            }
        }
    }
});