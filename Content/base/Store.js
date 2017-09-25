/* ***********************************************
 * author :  ***
 * function: Store基类
 * history:  created by *** 2015/5/21 13:23:18 
 * ***********************************************/
Ext.define("Fm.base.Store", {
    extend: 'Ext.data.Store',
    outParams: {},
    pageSize: Fm.Server.Config.PageRowCount || 10,
    autoLoad: false,
    //autoDestroy: true,
    isRequiresPage: true,
    latestTotalCount: 0,
    proxy: {
        type: 'ajax',
        actionMethods: {
            create: 'POST',
            read: 'POST',
            update: 'POST',
            destroy: 'POST'
        },
        reader: {
            type: 'json',
            rootProperty: 'Result',
            successProperty: 'IsSuccess',
            messageProperty: 'ErrMsg',
            totalProperty: "TotalCount"
        },
        limitParam: "PageSize",
        pageParam: "PageNum",
        startParam: 'StartIndex',
        timeout: AppConfig.ajaxTimeOut
    },
    listeners: {
        beforeload: function (store, opration, opt) {
            var me = this;

            me.lastTotalCount = store.totalCount;
            if (me.isRequiresPage) {
                me.outParams.TotalCount = 0;
            } else {
                try {
                    me.outParams.TotalCount = store.totalCount || 0;
                } catch (e) { }
            }
            Ext.apply(store.proxy.extraParams, me.outParams);

            setTimeout(function () {
                var proxy = store.getProxy();
                if (proxy) {
                    var getCountUrl = proxy.api.readTotalCount;
                    if (getCountUrl) {
                        if (me.isRequiresPage) {
                            store.fireEvent('beforeUpdatePageInfo');
                            Ext.Ajax.request({
                                url: getCountUrl,
                                method: 'post',
                                callback: function (options, success, response) {
                                    if (success) {
                                        var responseJson = Ext.JSON.decode(response.responseText);
                                        store.totalCount = responseJson.Result;
                                        store.latestTotalCount = responseJson.Result;
                                        //beforeload load 事件执行完之后都执行这个方法
                                        me.updateTotalCount();
                                        store.fireEvent('updatePageInfo');
                                    }
                                },
                                params: store.proxy.extraParams
                            });
                        } else {
                            store.totalCount = me.lastTotalCount;
                        }
                    }
                }
            }, 1000);
            //store.removeAll();
        },
        load: function (store) {
            var me = this;
            //beforeload load 事件执行完之后都执行这个方法
            var getCountUrl = store.getProxy().api.readTotalCount;
            if (getCountUrl) {
                me.updateTotalCount();
            }

        }
    },
    /*silent : Boolean (optional)
        Pass true to prevent the clear event from being fired.
        This method is affected by filtering.
        Defaults to: false
    */
    clearAll: function (silent) {
        this.outParams = {};
        this.proxy.extraParams = {};
        this.removeAll(silent || false);
    },

    //beforeload load 事件执行完之后都执行这个方法，更新总数
    updateTotalCount: function () {
        var me = this;

        me.totalCount = me.latestTotalCount;

    }
});