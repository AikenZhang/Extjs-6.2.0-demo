///* ***********************************************
// * author :  ***
// * function: 
// * history:  created by FeiLong 2015/5/11 16:21:57 
// * history:  update by FeiLong 2017/3/20 16:21:57  全部代码更新为面向对象模式 增加应用扩展性、降低耦合度

//数据处理类
function fmDataFactory(config) {
    //数据命名空间前缀
    this.nsStartWith = config.nsStartWith;
}

fmDataFactory.prototype.getDatas = function (key, fn) {
    return Ext.ns(this.nsStartWith)[key];
}

//根据key获取简单DataStore
//isAddAll:是否在第一项插入 ‘全部’选项
//插入数据 默认[{ "Value": -1, "Text": "全部" }]
fmDataFactory.prototype.getDataStore = function (key, isAddAll, addRecord) {
    var me = this,
        datas = me.getDatas(key);

    if (!datas) {
        Ext.log.error("[fmDataFactory-getDataStore]" + me.nsStartWith + ": " + key + " 不存在。");
        datas = [];
    }
    var _data = [];
    if (isAddAll) {
        _data = addRecord || [{ "Value": -1, "Text": "全部" }]
    }
    _data = Ext.Array.push(_data, Ext.Array.filter(datas, function (item) {
        return item.IsAlloted === true;
    }));
    var _tempDataStore = Ext.create('Ext.data.Store', {
        fields: ['Value', 'Text'],
        data: _data
    });
    return _tempDataStore;
}

fmDataFactory.prototype.getAllDataStore = function (key, isAddAll, addRecord) {
    var me = this,
        datas = me.getDatas(key);
    if (!datas) {
        Ext.log.error("[fmDataFactory-getAllDataStore]" + me.nsStartWith + ": " + key + " 不存在。");
        datas = [];
    }
    var _data = [];
    if (isAddAll) {
        _data = addRecord || [{ "Value": -1, "Text": "全部" }]
    }
    _data = Ext.Array.push(_data, datas);
    var _tempDataStore = Ext.create('Ext.data.Store', {
        fields: ['Value', 'Text'],
        data: _data
    });
    return _tempDataStore;
}

//根据code判断用户是否拥有功能权限，返回 true/false 
//注：兼容方法 2.0 移除
fmDataFactory.prototype.judgePrivilege = function (code) {
    return Ext.Array.findBy(this.getDatas("Privileges"), function (item) {
        return item.Value === code && item.IsAlloted;
    }) != null;
}


//配置处理类
function fmUiFactory(config) {
    //配置命名空间前缀
    this.nsStartWith = config.nsStartWith;
}

//根据key获取全部配置项
fmUiFactory.prototype.getAllItems = function (key) {
    var me = this,
        obj = Ext.ns(key);

    if (typeof obj !== 'function') {
        obj = Ext.ns(key);
    }
    if (typeof obj !== 'function') {
        obj = Ext.ns(me.nsStartWith + '.' + key);
    }

    if (typeof obj === 'function') {
        obj = obj();
        if (AppConfig.isDev === 1 && typeof obj !== 'string') {
            Ext.Array.forEach(obj, function (item) {
                if (Ext.Array.filter(obj, function (child) {
                    return item.configIndex == child.configIndex;
                }).length > 1) {
                    Fm.msg.error(key + '配置信息出现异常！出现重复configIndex，值为：' + item.configIndex);
                }
            })
        }
        return obj;
    }
    else {
        Fm.msg.error('配置信息出现异常！请检查拼写');
        return [];
    }
}

//根据key获取显示项的索引
fmUiFactory.prototype.getConfigs = function (key) {
    var viewConfig = Ext.ns("Fm.ViewConfig");
    if (viewConfig[key]) {
        return viewConfig[key]();
    }
    var _key = key;
    if (this.nsStartWith) {
        _key = this.nsStartWith + '.' + key;
    }
    if (viewConfig[_key]) {
        return viewConfig[_key]();
    }
    return null;
}

//根据key获取显示状态的配置项
fmUiFactory.prototype.getShowItems = function (key) {
    return this.getGridItems(key);
}

//获取列表配置项
fmUiFactory.prototype.getGridItems = function (key) {
    var me = this,
        allItems = me.getAllItems(key),
        configs = me.getConfigs(key),
        showItems = [];

    if (configs) {
        for (var i = 0; i < configs.length; i++) {
            var obj = Ext.Array.findBy(allItems, function (item, _i) {
                return item.configIndex == configs[i].index;
            });
            if (obj) {
                me.handlerGridConfig(obj, configs[i]);
                showItems.push(obj);
            }
        }
    } else {
        Ext.Array.forEach(allItems, function (item) {
            if (!item.configHidden) {
                showItems.push(item);
            }
        })
    }

    return showItems;
}

//获取查询配置项
fmUiFactory.prototype.getFormItems = function (key) {
    var me = this,
        allItems = me.getAllItems(key),
        configs = me.getConfigs(key),
        showItems = [],
        res = [];

    if (configs) {
        Ext.Array.forEach(configs, function (config) {
            var obj = { resolution: config.resolution, col: config.col, row: config.row, items: [] };
            Ext.Array.forEach(config.items, function (cItem) {
                var cmp = Ext.Array.findBy(allItems, function (item) {
                    return item.configIndex == cItem.index;
                });
                if (!cmp) {
                    cmp = { xtype: 'container', style: {'visibility':'hidden'}, colspan: cItem.colspan, configIndex: cItem.index, height: 25, width: 180 * cItem.colspan };
                }
                obj.items.push(cmp);
            })
            res.push(obj);
        })
    } else {
        Ext.Array.forEach(allItems, function (item) {
            if (!item.configHidden) {
                showItems.push(item);
            }
        })
        res = [
            { resolution: 1, col: 3, row: Math.ceil(showItems.length / 3) > 3 ? 3 : Math.ceil(showItems.length / 3), items: showItems },
            { resolution: 2, col: 4, row: showItems.length > 4 ? 2 : 1, items: showItems },
            { resolution: 3, col: 5, row: showItems.length > 5 ? 2 : 1, items: showItems }
        ];
    }
    return res;
}

//grid数据格式处理
fmUiFactory.prototype.handlerGridConfig = function (obj, config) {
    if (config.width) {
        obj.width = config.width;
        obj.flex = undefined;
    }
    if (config.exportIsCount) {
        obj.exportIsCount = config.exportIsCount;
    }
    if (config.datatype) {
        switch (config.datatype) {
            case 'Money':
                obj.renderer = Fm.Common.Util.moneyRender('f00');
                obj.align = 'right';
                break;
            case 'Date':
                obj.renderer = Fm.Common.Util.dateTextRender();
                break;
        }
    }
}


function fmCommonFactory(config) {
    return {
        Data: new fmDataFactory({ nsStartWith: (config.appName || AppConfig.appName) + ".Server.Datas" }),
        Config: new fmUiFactory({ nsStartWith: (config.appName || AppConfig.appName) + ".Config" })
    };
}

var appFactory = fmCommonFactory({ appName: null });