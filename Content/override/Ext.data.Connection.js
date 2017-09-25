/* ***********************************************
 * author :  ***
 * function: 重写ajax方法 添加异常提示
 * history:  created by *** 2015/7/3 9:53:59 
 * ***********************************************/
(function () {
    var _ajaxRequest = Ext.data.Connection.prototype.request;
    Ext.data.Connection.prototype.request = undefined;
    Ext.override(Ext.data.Connection, {
        request: function (options) {
            options = options || {};
            var me = this,
                scope = options.scope || window;

            var newCall = options.callback;
            options.callback = undefined;

            options.url = (AppConfig.urlStartWith + options.url).replace('//', '/');

            var showLogin = function () {
                application.loginOut();
            }

            var _fmapp_now_mask_view = window._fmapp_now_mask_view + '';
            var _errLang = {
                NetWorkErrorMsg: "网络错误，请检查您的网络。",
                ServerErrorMsg: "服务器异常，请联系管理人员。",
                LoadErrorMsg: "加载出错"
            };
            var callback = function (options, success, response) {
                var responseJson = response.responseJson = { ErrCode: null, ErrMsg: null, IsSuccess: true };

                if ((response.status >= 400 && response.status < 500) || response.status == 0) {
                    responseJson.ErrMsg = _errLang.NetWorkErrorMsg;
                }
                else if (response.status >= 500) {
                    responseJson.ErrMsg = _errLang.ServerErrorMsg;
                } else {
                    if (response.responseText) {
                        var matches = response.responseText.match(/("ErrCode[\s\S]*ErrMsg[\s\S]*),"AttachedObject"/)
                        if (matches && matches.length) {
                            var relStr = '{' + matches[1] + '}';
                            responseJson = Ext.JSON.decode(relStr);
                        }
                    } else {
                        if (success) {
                            responseJson.ErrMsg = _errLang.loadErrorMsg;
                        }
                    }
                }

                responseJson.IsSuccess = !responseJson.ErrMsg;
                if (!responseJson.IsSuccess) {
                    if (responseJson.ErrCode === '1002') {
                        Ext.Msg.alert('登录过期', responseJson.ErrMsg, function () {
                            showLogin();
                        });
                    } else {
                        Fm.msg.error(responseJson.ErrMsg);
                    }
                    try {
                        application.hideMask(_fmapp_now_mask_view);
                    } catch (e) { }
                }
                if (newCall) {
                    newCall.call(scope, options, responseJson.IsSuccess, response);
                }
            }
            options.callback = callback;
            if (!options.error) {
                options.error = function () {
                    application.hideMask(_fmapp_now_mask_view);
                }
            }
            _ajaxRequest.call(me, options);
        }
    });
})();