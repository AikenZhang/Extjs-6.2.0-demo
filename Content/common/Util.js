///* ***********************************************
// * author :  ***
// * function: 
// * history:  created by FeiLong 2015/5/11 16:21:57 
// * ***********************************************/
function FmUtil() {

}

//日期
FmUtil.prototype.dateRender = function (format, color) {
    var me = this,
        format = format || "Y-m-d";
    return function (date) {
        var _temp;
        if (!date) {
            return '';
        }
        if (Ext.isDate(date)) {
            _temp = date;
        } else {
            var _temp = me.convertISOStrToDate(date);

            if (!Ext.isDate(_temp)) {
                return '';
            }
        }
        var value = Ext.Date.format(_temp, format);
        if (color) {
            return "<span style='color:#" + color + "'>" + value + "</span>";
        }
        return value;
    }
}

//月份
FmUtil.prototype.dateMonthRender = function () {
    return this.dateRender("Y-m");
}

//时间
FmUtil.prototype.dateTimeRender = function () {
    return this.dateRender("Y-m-d H:i:s");
}

//时间
FmUtil.prototype.dateTextRender = function () {
    return this.dateRender("Y-m-d H:i:s");
}

//为了兼容IE8，对日期原字符串做处理
FmUtil.prototype.dateTransfer = function (d) {
    return this.convertISOStrToDate(d);
}

//链接
FmUtil.prototype.linkRender = function (v) {
    if (!v) {
        return "";
    }
    else {
        return "<a href='" + v + "' target='_blank'>" + v + "</a>";
    }
}

//bool 是 否
FmUtil.prototype.booleanRender = function (value, p, record) {
    return (!value || value === '0') ? "否" : "是";
}

//颜色
FmUtil.prototype.colorRender = function (color) {
    return function (v) {
        if (v) {
            return "<span style='color:#" + color + "'>" + v + "</span>";
        }
        return "";
    }
}

/*2015-06-04T23:59:59 转换为 2016/06/04 23:59:59 兼容IE8*/
FmUtil.prototype.convertISOStrToDate = function (dateString) {
    if (!dateString) {
        return null;
    }
    return new Date(dateString.replace(/-/g, '/').replace(/T|Z/g, ' ').trim());
}

//钱
FmUtil.prototype.moneyRender = function (color, accuracy) {
    var moneyAccuracy = accuracy || parseInt(Fm.Server.Config.MoneyAccuracy, 10) || 2;
    var format = '0.';
    for (var i = 0; i < moneyAccuracy; i++) {
        format += '0';
    }
    //color = color || 'ff0000';
    if (color) {
        return function (obj) {
            obj = Ext.util.Format.round(obj, moneyAccuracy);
            return "<span style='color:#" + color + "'>￥" + Ext.util.Format.number(obj, format) + "</span>";
        }
    } else {
        return function (obj) {
            obj = Ext.util.Format.round(obj, moneyAccuracy);
            return "￥" + Ext.util.Format.number(obj, format);
        }
    }
}

//钱 允许显示空
FmUtil.prototype.moneyForAllowNullRender = function (color, accuracy) {
    var moneyAccuracy = accuracy || parseInt(Fm.Server.Config.MoneyAccuracy, 10) || 2;
    var format = '0.';
    for (var i = 0; i < moneyAccuracy; i++) {
        format += '0';
    }
    //color = color || 'ff0000';
    if (color) {
        return function (obj) {
            if (obj === null || obj === undefined || obj === 0) {
                return '';
            }
            obj = Ext.util.Format.round(obj, moneyAccuracy);
            return "<span style='color:#" + color + "'>￥" + Ext.util.Format.number(obj, format) + "</span>";
        }
    } else {
        return function (obj) {
            if (obj === null || obj === undefined || obj === 0) {
                return '';
            }
            obj = Ext.util.Format.round(obj, moneyAccuracy);
            return "￥" + Ext.util.Format.number(obj, format);
        }
    }
}

//百分号
FmUtil.prototype.percentRender = function () {
    var moneyAccuracy = parseInt(Fm.Server.Config.MoneyAccuracy, 10) || 2;
    var format = '0.';
    for (var i = 0; i < moneyAccuracy; i++) {
        format += '0';
    }
    return function (obj) {
        obj = obj * 100;
        return Ext.util.Format.number(obj, format) + "%";
    }

}

//枚举、列表 映射
FmUtil.prototype.dataTextRender = function (datas) {
    return function (v) {
        if (v !== undefined && v !== null && v !== "") {
            var _item = Ext.Array.findBy(datas, function (item, index) {
                return item.Value == v;
            });
            if (_item) {
                return _item.Text
            }
        }
        return '';
    }
}

FmUtil.prototype.columnPanelBuild = function (_items) {
    var obj = {
        xtype: 'container',
        layout: "column",
        defaults: {
            xtype: "textfield",
            margin: "5 0 0 0",
            labelAlign: "right",
            labelWidth: 80,
            columnWidth: 0.5
        },
        items: _items
    }
    return obj;
}

//对比计算
FmUtil.prototype.comp = function (op, a, b) {
    switch (op) {
        case ">":
            return a > b;
            break;
        case ">=":
            return a >= b;
            break;
        case "<":
            return a < b;
            break;
        case "=":
        case "===":
            return a === b;
            break;
        case "==":
            return a == b;
            break;
        case "<=":
            return a <= b;
            break;
        case "like":
            return a && a.toLowerCase().indexOf(b.toLowerCase()) > -1;
            break;
        case "ClikeL":
            return b && b.toLowerCase().indexOf(a.toLowerCase()) > -1;
            break;
            //当指定字段值非空时通过验证
        case "!empty":
            return !!(a && a.toLowerCase());
            break;
        default:
            return true;
            break;
    }
}

//是否包含子字符串
FmUtil.prototype.containString = function (source, part) {
    for (var i = 0, j = 0; i < source.length; i++) {
        if (source[i] === part[j]) {
            j++;
            if (j === part.length) {
                return true;
            }
        } else {
            j = 0;
        }
    }
    return false;
}

//获取form的验证错误消息
FmUtil.prototype.getFormErrorMsg = function (form) {
    errors = Ext.Array.findBy(form.getForm().monitor.items.items, function (element, index, array) {
        return element.wasValid === false;
    });
    if (errors) {
        return (errors.errorfieldLabel || errors.fieldLabel || '输入错误') + ":" + errors.activeErrors.join(',');
    }
    return null;
}

FmUtil.prototype.Guid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxx xxxxxx'.replace(/[xy]/g,
        function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
}

//模拟post下载文件
FmUtil.prototype.downLoadFile = function (options) {
    var config = Ext.apply({ method: 'post' }, options),
        formId = 'down-file-form-kdkjgjkdagjfkdgh',
        form = Ext.fly(formId);

    if (!form) {
        form = Ext.getBody().createChild({
            tag: 'form',
            id: formId,
            name: formId,
            method: 'POST',
            style: 'display:none'
        });
    }
    Ext.Ajax.request({
        url: config.url,
        form: form,
        isUpload: true,
        params: config.data
    });
}

//获取当前时间
FmUtil.prototype.getNowDate = function () {
    var loadServerDate = Date.parse(Fm.Server.Config.NowDate.replace(/-/g, "/")),
        loadClientDate = Fm.Config.clientDate.getTime(),
        nowClientDate = new Date().getTime();

    return new Date(nowClientDate + (loadServerDate - loadClientDate));
}

//获取当前时间字符串
FmUtil.prototype.getNowDateStr = function (format) {
    var format = format || 'Y-m-d H:i:s';
    return this.dateRender(format)(this.getNowDate());
}

//数量小数点保留
FmUtil.prototype.numberRender = function (color) {
    var numberAccuracy = parseInt(Fm.Server.Config.NumberAccuracy, 10) || 0;
    var format = '0.';
    for (var i = 0; i < numberAccuracy; i++) {
        format += '0';
    }
    //color = color || 'ff0000';
    if (color) {
        return function (obj) {
            return "<span style='color:#" + color + "'>" + Ext.util.Format.number(obj, format) + "</span>";
        }
    } else {
        return function (obj) {
            return Ext.util.Format.number(obj, format);
        }
    }
}

//需要tips
FmUtil.prototype.getTips = function () {
    Ext.log.warn('Util.getTips过期，替代：列属性配置：showTip:true');
    return function (data, metadata, record) {
        if (metadata !== null) {
            metadata.tdAttr = 'data-qtip="' + data + '"';
        }
        return data;
    }
}

fmUtil = Ext.ns('Fm.Common').Util = new FmUtil();