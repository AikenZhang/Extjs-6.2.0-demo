/* ***********************************************
 * author :  ***
 * function: 
 * history:  created by *** 2015/6/9 15:12:18 
 * ***********************************************/
(function () {
    var ver = Ext.versions.extjs.major.toString() + Ext.versions.extjs.minor.toString() + Ext.versions.extjs.pad.toString();
    if (ver === '600') {
        ver = '6';
    }
    Ext.Loader.setPath({
        'Fm': AppConfig.urlStartWith + 'Fm',
        'FmApp': AppConfig.urlStartWith + 'FmApp',
        'Ext': AppConfig.urlStartWith + 'FmContent/lib/extjs' + ver + '/src',
        'Ext.draw.ContainerBase': AppConfig.urlStartWith + 'FmContent/lib/extjs' + ver + '/build/charts.js'
    });
})()


//忽略Ext部分错误
Ext.Error.ignore = true;
//ajax超时时间
Ext.Ajax.setTimeout(AppConfig.ajaxTimeOut);
//设置字体图标
Ext.setGlyphFontFamily('FontAwesome');

//屏蔽输入框 backspace  修正按键导致页面后退的问题
Ext.EventManager.on(window, 'keydown', function (e, t) {
    if (e.getKey() == e.BACKSPACE && (!/^input|textarea$/i.test(t.tagName) || t.disabled || t.readOnly)) {
        e.stopEvent();
    }
});


if (AppConfig.isDev) {
    //window.onerror = function (msg, url, line, l, e) {
    //    var _msg = msg + "\n所在文件：" + url + ":" + line + ":" + l;
    //    Ext.log.error("全局异常拦截：\n错误信息：" + _msg);
    //    Ext.log.error(e.stack);
    //    //CisApp.msg.error(_msg);
    //    return true;
    //}
} else {
    window.onerror = function (msg, url, line, l, e) {
        return true;
    }
    //禁用系统缓存更新规则 采用自定义版本缓存规则 提高网络性能(override Ext.js)
    Ext.Loader.setConfig({ disableCaching: false });
}


window._fmapp_now_mask_view = '';
var application;
Ext.define('Fm.BaseApp', {
    extend: 'Ext.app.Application',
    enabled: true,
    requires: [
        'Ext.window.MessageBox'
    ],
    mask: null,
    masks: {},
    showMask: function (view, param) {
        var me = application,
            maskView = me.getMainView().down(view + '[maskParam=' + param + ']'),
            key = (view || '') + (param || '');
        if (!maskView) {
            maskView = me.getMainView().down(view);
        }

        window._fmapp_now_mask_view = key;
        if (!key) {
            me.globalMask.show();
        } else {
            if (maskView) {
                if (!me.masks[key]) {
                    me.masks[key] = new Ext.LoadMask({
                        msg: AppConfig.maskHtml,
                        //cls:'x-cis-mask',
                        style: {
                            backgroundColor: 'rgba(255, 255, 255, 0.5);'
                        },
                        border: false,
                        target: maskView
                    });
                }
                me.masks[key].show();
            }
        }

        if (!view) {
            Ext.log.error("[showMask] 需要传入view参数.");
            try {
                //模拟异常 获取调用堆栈
                var temp = view.exception;
            } catch (e) {
                Ext.log.error(e.stack);
            }
        }
    },
    hideMask: function (view, param) {
        var me = application,
            key = (view || '') + (param || '');

        if (!key) {
            me.globalMask.hide();
        } else {
            if (me.masks[key]) {
                Ext.destroy(me.masks[key]);
                me.masks[key] = undefined;
            }
        }

        if (!view) {
            Ext.log.error("[showMask] 需要传入view参数.");
            try {
                //模拟异常 获取调用堆栈
                var temp = view.exception;
            } catch (e) {
                Ext.log.error(e.stack);
            }
        }
    },
    loginOut: function (choice) {
        application.showMask();
        var getUrlKey = function () {
            key = window.location.pathname.toLowerCase();
            if (key.substr(0, AppConfig.urlStartWith.length) === AppConfig.urlStartWith) {
                key = key.substr(0, AppConfig.urlStartWith.length);
            }
            if (key.substr(key.length - 1, 1) === '/') {
                key = key.substr(key.length - 1, 1);
            }
            if (key.length) {
                if (key.substr(0, 1) !== '/') {
                    key = '/' + key;
                }
            } else {
                key = '_default';
            }
            return key;
        }
        var key = getUrlKey(),
            name = Fm.Server.Config.AppNameInfo[key] || Fm.Server.Config.AppNameInfo['_default'],
            logo = Fm.Server.Config.AppIcoInfo[key] || Fm.Server.Config.AppIcoInfo['_default'];

        window.location = AppConfig.loginOutUrl + '?url=' + escape(window.location.href) +
            '&name=' + escape(name) +
            '&logo=' + escape(window.location.origin + AppConfig.urlStartWith + logo);
    },
    addBookmark: function (menuId, name, remark, params) {
        var mainView = application.getMainView(),
            bookView = mainView.down('sysuser_userbookmark');
        bookView.getController().addBookmark(menuId, name, remark, params);
    }
});