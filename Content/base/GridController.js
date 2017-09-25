/* ***********************************************
 * author :  ***
 * function: 表格控制器基类
 * history:  created by *** 2015/5/21 13:25:24 
 * ***********************************************/
Ext.define("Fm.base.GridController", {
    extend: 'Ext.app.ViewController',
    alias: 'controller.cisgrid',
    operationView: '',
    autoLoad: false,
    init: function () {
        var me = this,
            xtype = me.getView().xtype,
            control = {};

        control[xtype] = {
            afterrender: me.selfRender
        };
        control[xtype + " cispagingtoolbar"] = { beforechange: me.beforePageChange };

        me.control(control, me);

        me.callParent(arguments);
        me.initSelfEvents();
    },
    getGridStore: function () {
        var me = this,
            grid,
            store;

        if (!me.__gridStore) {
            grid = this.getView();
            store = grid.getStore();
            if (store.isEmptyStore) {
                store = grid.getBind().store.getValue();
            }
            me.__gridStore = store;
        }
        return me.__gridStore;
    },
    /**
     * 常用事件
     * dataChanged: store数据改变时触发
     */
    initSelfEvents: function () {
        var me = this,
            store = me.getGridStore();
        if (me.dataChanged) {
            store.on('datachanged', me.dataChanged, me);
        }
        if (me.dataLoaded) {
            store.on('load', me.dataLoaded, me);
        }
        //store.on('load', function () {
        //    application.mask.hide();
        //});
    },
    selfRender: function () {
        var me = this,
            store = me.getGridStore();
        if (me.autoLoad && !store.autoLoad) {
            me.refresh();
        }
    },
    //过滤
    doFilter: function (cmp) {
        var me = this,
            view = me.getView(),
            store = me.getGridStore(),
            filterConfig = Ext.clone(cmp.filterConfig),
            key = cmp.id + '_filter',
            filter,
            filterArray;

        if (!view.filterArray) {
            view.filterArray = {};
        }
        filterArray = view.filterArray;
        Ext.suspendLayouts();
        store.clearFilter(false);
        if (store.getDataSource().items.length < 0) {
            return;
        }

        filter = me.getFilter(filterConfig, cmp.getValue());
        filterArray[key] = filter;

        var filters = [];
        for (var f in filterArray) {
            if (filterArray[f]) {
                filters.push(filterArray[f]);
            }
        }

        var fstore;
        if (filters.length > 0) {
            fstore = store.filter(filters);
        }
        Ext.resumeLayouts(true);
        if (cmp.filterCallBack) {
            cmp.filterCallBack.call(cmp, me.getView(), store);
        }
    },
    filter: function (cmp) {
        var me = this;
        me.doFilter(cmp);
        //var fn = function () {
        //    me._filtering = true;
        //    me.doFilter(cmp);
        //    me._filtering = false;
        //}
        //setTimeout(function () {
        //    if (!me._filtering) {
        //        fn();
        //    } else {
        //        setTimeout(function () {
        //            if (!me._filtering) {
        //                fn();
        //            }
        //        }, 300);
        //    }
        //}, 300);
    },
    //判断值是否需要过滤
    isFilter: function (type, value, valueType) {
        var rel = false;
        if (valueType && valueType === 'list') {
            if (value) {
                if (!Ext.isArray(value)) {
                    value = value.split(',');
                }
                if (value.length > 0) {
                    rel = true;
                }
            }
        } else {
            switch (type) {
                case "string":
                    value = (value || '').toString();
                    if (value) {
                        rel = true;
                    }
                    break;
                case "date":
                    if (value) {
                        value = Date.parse(value);
                        if (value) {
                            rel = true;
                        }
                    }
                    break;
                case "number":
                    value = parseFloat(value);
                    if (!isNaN(value)) {
                        rel = true;
                    }
                    break;
                case "int":
                    value = parseInt(value, 10);
                    if (!isNaN(value)) {
                        rel = true;
                    }
                    break;
                default:
                    break;
            }
        }
        return rel;
    },
    //获取过滤有效值
    getFilterValue: function (type, value) {
        switch (type) {
            case "string":
                if (value === 0) {
                    value = '0';
                } else {
                    value = (value || '').toString();
                }
                break;
            case "date":
                value = Date.parse(value);
                break;
            case "number":
                value = parseFloat(value);
                break;
            case "int":
                value = parseInt(value, 10);
                break;
            default:
                break;
        }
        return value;
    },
    getFilterListValue: function (type, value) {
        var me = this;
        if (value) {
            if (!Ext.isArray(value)) {
                value = value.split(',');
            }
            var _value = [];
            for (var i = 0; i < value.length; i++) {
                if ((type === 'int' || type === 'number')) {
                    if ((value || value === 0)) {
                        _value.push(me.getFilterValue(type, value[i]));
                    }
                } else {
                    if (value) {
                        _value.push(me.getFilterValue(type, value[i]));
                    }
                }
            }

            if (_value.length > 0) {
                return _value;
            }
        }
        return null;
    },
    //获取Filter      return Ext.util.Filter || undefined
    getFilter: function (filterConfig, value) {
        var me = this,
            filter;
        if (filterConfig.type && filterConfig.type === 'filter') {
            filterConfig.filter._cmpValue = value;
            return filterConfig.filter;
        }
        if (!Ext.isArray(filterConfig)) {
            filterConfig = [filterConfig];
        }
        var filterArray = Ext.Array.filter(filterConfig, function (item) {
            return me.isFilter(item.type, value, item.valueType);
        });
        if (filterArray.length > 1) {
            var values = [];
            var valueIsList = false;
            for (var i = 0; i < filterArray.length; i++) {
                if (filterArray[i].valueType === 'list') {
                    var _value = me.getFilterListValue(filterArray[i].type, value);
                    valueIsList = _value.length > 1;
                    if (_value.length === 1) {
                        _value = _value[0];
                        delete filterArray[i].valueType;
                    }
                    values.push(_value);
                } else {
                    values.push(me.getFilterValue(filterArray[i].type, value));
                }
            }
            if (valueIsList) {
                filter = {
                    filterFn: function (record) {
                        for (var i = 0; i < filterArray.length; i++) {
                            if (filterArray[i].valueType === 'list') {
                                if (Ext.Array.findBy(values[i], function (v) {
                                    return Fm.Common.Util.comp(
                                           filterArray[i].operator,
                                           me.getFilterValue(filterArray[i].type, record.data[filterArray[i].property]),
                                           v)
                                })) {
                                    return true;
                                }
                            } else {
                                if (Fm.Common.Util.comp(
                                    filterArray[i].operator,
                                    me.getFilterValue(filterArray[i].type, record.data[filterArray[i].property]),
                                    values[i])
                               ) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                }
            } else {
                filter = {
                    filterFn: function (record) {
                        for (var i = 0; i < filterArray.length; i++) {
                            if (Fm.Common.Util.comp(
                                    filterArray[i].operator,
                                    me.getFilterValue(filterArray[i].type, record.data[filterArray[i].property]),
                                    values[i])
                               ) {
                                return true;
                            }
                        }
                        return false;
                    }
                }
            }
        } else if (filterArray.length === 1) {
            var _temp = filterArray[0];
            var valueIsList = false;
            if (_temp.valueType === 'list') {
                var _value = me.getFilterListValue(_temp.type, value);
                valueIsList = _value.length > 1;
                if (_value.length === 1) {
                    _value = _value[0];
                    delete _temp.valueType;
                }
                value = _value;
            } else {
                value = me.getFilterValue(_temp.type, value);
            }
            if (valueIsList) {
                filter = {
                    filterFn: function (record) {
                        if (Ext.Array.findBy(value, function (v) {
                            return Fm.Common.Util.comp(
                                    _temp.operator,
                                    me.getFilterValue(_temp.type, record.data[_temp.property]),
                                    v)
                        })) {
                            return true;
                        }
                    }
                }
            } else {
                filter = {
                    filterFn: function (record) {
                        return Fm.Common.Util.comp(
                            _temp.operator,
                            me.getFilterValue(_temp.type, record.data[_temp.property]),
                            value)
                    }
                }
            }
        }
        return filter;
    },
    /* *
     * 获取查询参数 验证通过返回true 否则返回false 提示错误
     * 子类重写
     */
    getRefreshParams: function () {
        return {};
    },
    beforePageChange: function () {
        var me = this;
        //分页改变不需要重复查询分页总条数
        me.getGridStore().isRequiresPage = false;
        return me.addParams();
    },
    addParams: function () {
        var params = this.getRefreshParams();
        if (params !== false) {
            this.getGridStore().outParams = params;
            //Ext.apply(this.getGridStore().outParams, params);
            //console.dir(this.getGridStore().outParams);
            //application.mask.show();
            return true;
        }
        return false;
    },
    refresh: function () {
        //点击搜索需要重复查询分页总条数
        this.getGridStore().isRequiresPage = true;
        this.refreshByParams();
    },
    refreshByParams: function (params) {
        var me = this,
            isCanRefresh = me.addParams();
        if (isCanRefresh !== false) {
            setTimeout(function () {
                //me.getGridStore().load(params);
                //解决检索时从第一页开始查的问题
                me.getGridStore().loadPage(1, params);
            }, 10);
        }
    }
});
