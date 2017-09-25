/* ***********************************************
 * author :  ***
 * function: 增加 异常提示  控制台
 * history:  created by *** 2015/7/3 10:04:05 
 * history:  update by *** 2015/8/18 10:04:05 
 * history:  update by 何泽立 2015/11/12 17:04:05 异常处理 
             Ext.Boot 增加版本缓存更新
 * ***********************************************/
(function () {
    //Ext.Boot 增加版本缓存更新
    Ext.apply(Ext.Boot, {
        create: function (url, key, cfg) {
            var config = cfg || {};
            try {
                url = Ext.urlAppend(url, "_v=" + AppConfig.version);
            } catch (e) { }
            config.url = url;
            config.key = key;
            return Ext.Boot.scripts[key] = new Ext.Boot.Entry(config);
        }
    });

    //增加Ext.Loader异常提示  控制台
    Ext.apply(Ext.Loader, {
        loadScript: function (options) {
            var Loader = Ext.Loader;
            var isString = typeof options === 'string',
                isArray = options instanceof Array,
                isObject = !isArray && !isString,
                url = isObject ? options.url : options,
                onError = isObject && options.onError,
                onLoad = isObject && options.onLoad,
                scope = isObject && options.scope,
                request = {
                    url: (AppConfig.urlStartWith + url).replace('//', '/'),
                    scope: scope,
                    onLoad: onLoad,
                    onError: onError,
                    _classNames: []
                };

            Loader.loadScripts(request);
        },
        onLoadFailure: function () {
            var Loader = Ext.Loader;
            var options = this,
                onError = options.onError;
            Loader.hasFileLoadError = true;
            --Loader.scriptsLoading;
            if (onError) {
                onError.call(options.userScope, options);
            } else {
                Ext.Msg.alert('操作失败', '网络已断开,请检查您的网络并重试。');
                Ext.log.error("[Ext.Loader] Some requested files failed to load.");
                var _entries = arguments[0].entries;
                for (var i = 0; i < _entries.length; i++) {
                    if (_entries[i].error) {
                        //清除缓存 关闭重新点击时重新请求
                        Ext.Boot.scripts[_entries[i].key] = undefined;
                        Ext.log.error("[Ext.Loader]类: " + options._classNames[i] + " 加载失败,请检查requires或者uses配置路径。");
                        //Ext.log.error(_entries[i].error);
                    }
                }
            }
            Loader.checkReady();
        }
    });

    //增加Ext.create错误时的异常提示  控制台
    Ext.apply(Ext, {
        create: function () {
            try {
                var name = arguments[0],
                    nameType = typeof name,
                    args = Array.prototype.slice.call(arguments, 1),
                    cls;

                if (nameType === 'function') {
                    cls = name;
                } else {
                    if (nameType !== 'string' && args.length === 0) {
                        args = [name];
                        if (!(name = name.xclass)) {
                            name = args[0].xtype;
                            if (name) {
                                name = 'widget.' + name;
                            }
                        }
                    }

                    //<debug>
                    if (typeof name !== 'string' || name.length < 1) {
                        //throw new Error("[Ext.create] Invalid class name or alias '" + name +
                        //              "' specified, must be a non-empty string");
                        Ext.log.error("[Ext.create] Invalid class name or alias '" + name + "' specified, must be a non-empty string");

                    }
                    //</debug>

                    name = Ext.ClassManager.resolveName(name);
                    cls = Ext.ClassManager.get(name);
                }
                var isNonBrowser = typeof window === 'undefined';
                // Still not existing at this point, try to load it via synchronous mode as the last resort
                if (!cls) {
                    //<debug>
                    //<if nonBrowser>
                    !isNonBrowser &&
                    //</if>
                    Ext.log.warn("[Ext.Loader] Synchronously loading '" + name + "'; consider adding " +
                         "Ext.require('" + name + "') above Ext.onReady");
                    //</debug>

                    Ext.syncRequire(name);

                    cls = Ext.ClassManager.get(name);
                }

                //<debug>
                if (!cls) {
                    Ext.log.error("[Ext.create] Unrecognized class name / alias: " + name);
                }

                if (typeof cls !== 'function') {
                    Ext.log.error("[Ext.create] Singleton '" + name + "' cannot be instantiated.");
                }
                //</debug>

                return Ext.ClassManager.getInstantiator(args.length)(cls, args);
            } catch (e) {
                Ext.log.error("[Ext.create] 位于Class " + name + " .消息:" + e.message);
                Ext.log.error(e.stack);
                application.globalMask.hide();
            }
        }
    });

    //Ext错误提示
    Ext.apply(Ext.Error, {
        raise: function (err) {
            err = err || {};
            if (Ext.isString(err)) {
                err = { msg: err };
            }

            var me = this,
                method = me.raise.caller,
                msg, name;

            if (method === Ext.raise) {
                method = method.caller;
            }
            if (method) {
                if (!err.sourceMethod && (name = method.$name)) {
                    err.sourceMethod = name;
                }
                if (!err.sourceClass && (name = method.$owner) && (name = name.$className)) {
                    err.sourceClass = name;
                }
            }

            if (me.handle(err) !== true) {
                msg = toString.call(err);
                if (AppConfig.isDev) {
                    Fm.msg.error(msg);
                }
                Ext.log.error(msg);
            }
        }
    });

})();