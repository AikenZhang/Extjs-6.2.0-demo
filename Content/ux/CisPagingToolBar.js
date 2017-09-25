/* ***********************************************
 * author :  ***
 * function: 分页条 带页码大小下拉框 自定义格式等 用法同pagingtoolbar
 * history:  created by *** 2015/5/21 13:26:03 
 * ***********************************************/
Ext.define('Fm.ux.CisPagingToolBar', {
    extend: 'Ext.toolbar.Paging',
    xtype: 'cispagingtoolbar',
    alternateClassName: 'Fm.ux.CisPagingToolBar',
    cls: 'cis-pagingtoolbar-panel',
    padding: 0,
    displayInfo: true,
    displayMsg: '显示{0}-{1}&nbsp;共{2}条',
    emptyMsg: '没有数据',
    beforePageText: '第',
    afterPageText: '页&nbsp;共{0}页',
    firstText: '首页',
    prevText: '上一页',
    nextText: '下一页',
    lastText: '最后一页',
    refreshText: '刷新',
    /**
     * 每页大小列表
     */
    pageSizes: '10,50,100,500,1000,3000',
    getPagingItems: function () {
        var me = this,
            inputListeners = {
                scope: me,
                blur: me.onPagingBlur
            };

        //inputListeners[''] = me.onPagingKeyDown;
        inputListeners[Ext.supports.SpecialKeyDownRepeat ? 'keydown' : 'keypress'] = me.onPagingKeyDown;

        var _temp = me.pageSizes.split(',');
        var _data = [];
        for (var i = 0; i < _temp.length; i++) {
            if (_temp[i]) {
                _data[_data.length] = { text: _temp[i].toString(), value: _temp[i] };
            }
        }
        var pagess = Ext.create('Ext.data.Store', {
            fields: ['text', 'value'],
            data: _data
        });

        return [
        "每页",
        {
            itemId: 'pageSizes',
            xtype: "combo",
            store: pagess,
            queryMode: 'local',
            displayField: 'text',
            valueField: 'value',
            width: 65,
            editable: false,
            showClearTriggers: false,
            value: me.store.getPageSize(),
            listeners: {
                change: function (obj, v) {
                    me.store.setPageSize(v);
                    if (!me._notFireChange) {
                        me.moveFirst();
                    }
                }
            }
        },
        "条",
        '-', {
            itemId: 'first',
            tooltip: me.firstText,
            overflowText: me.firstText,
            iconCls: Ext.baseCSSPrefix + 'tbar-page-first',
            disabled: true,
            handler: me.moveFirst,
            scope: me
        }, {
            itemId: 'prev',
            tooltip: me.prevText,
            overflowText: me.prevText,
            iconCls: Ext.baseCSSPrefix + 'tbar-page-prev',
            disabled: true,
            handler: me.movePrevious,
            scope: me
        },
        '-',
        me.beforePageText,
        {
            xtype: 'numberfield',
            itemId: 'inputItem',
            name: 'inputItem',
            cls: Ext.baseCSSPrefix + 'tbar-page-number',
            allowDecimals: false,
            minValue: 1,
            hideTrigger: true,
            enableKeyEvents: true,
            keyNavEnabled: false,
            selectOnFocus: true,
            submitValue: false,
            // mark it as not a field so the form will not catch it when getting fields
            isFormField: false,
            width: me.inputItemWidth,
            margin: '-1 2 3 2',
            listeners: inputListeners
        },
        {
            xtype: 'tbtext',
            itemId: 'afterTextItem',
            text: Ext.String.format(me.afterPageText, 1)
        },
        '-',
        {
            itemId: 'next',
            tooltip: me.nextText,
            overflowText: me.nextText,
            iconCls: Ext.baseCSSPrefix + 'tbar-page-next',
            disabled: true,
            handler: me.moveNext,
            scope: me
        }, {
            itemId: 'last',
            tooltip: me.lastText,
            overflowText: me.lastText,
            iconCls: Ext.baseCSSPrefix + 'tbar-page-last',
            disabled: true,
            handler: me.moveLast,
            scope: me
        },
        '-',
        {
            itemId: 'refresh',
            tooltip: me.refreshText,
            overflowText: me.refreshText,
            iconCls: Ext.baseCSSPrefix + 'tbar-loading',
            disabled: me.store.isLoading(),
            handler: me.doRefresh,
            scope: me
        }];
    },

    initComponent: function () {
        var me = this;
        me.store.on({
            'beforeUpdatePageInfo': {
                fn: me.beforeUpdatePageInfo,
                scope: me
            },
            'updatePageInfo': {
                fn: me.updatePageInfo,
                scope: me
            }
        });
        me.callParent();
    },
    beforeUpdatePageInfo: function () {
        var me = this;
        me.mask('正在更新分页信息...');
    },
    updatePageInfo: function () {
        var me = this;
        me.unmask();
        me.updateBarInfo();
    },

    // @private
    onLoad: function () {
        var me = this,
            pageData,
            currPage,
            pageCount,
            afterText,
            count,
            isEmpty,
            item,
            pageSizes;

        count = me.store.getCount();
        isEmpty = count === 0;
        if (!isEmpty) {
            pageData = me.getPageData();
            currPage = pageData.currentPage;
            pageCount = pageData.pageCount;

            // Check for invalid current page.
            if (currPage > pageCount) {
                //me.store.loadPage(pageCount);
                return;
            }

            afterText = Ext.String.format(me.afterPageText, isNaN(pageCount) ? 1 : pageCount);
        } else {
            currPage = 0;
            pageCount = 0;
            afterText = Ext.String.format(me.afterPageText, 0);
        }

        Ext.suspendLayouts();
        item = me.child('#afterTextItem');
        if (item) {
            item.setText(afterText);
        }
        item = me.getInputItem();
        if (item) {
            item.setDisabled(isEmpty).setValue(currPage);
        }
        item = me.child('#pageSizes');
        if (item) {
            me._notFireChange = true;
            item.setValue(me.store.getPageSize());
            me._notFireChange = false;
        }

        me.setChildDisabled('#first', currPage === 1 || isEmpty);
        me.setChildDisabled('#prev', currPage === 1 || isEmpty);
        me.setChildDisabled('#next', currPage === pageCount || isEmpty);
        me.setChildDisabled('#last', currPage === pageCount || isEmpty);
        me.setChildDisabled('#refresh', false);
        me.setChildDisabled('#go', isEmpty);
        me.updateInfo();
        Ext.resumeLayouts(true);

        if (!me.calledInternal) {
            me.fireEvent('change', me, pageData || me.emptyPageData);
        }
    },

    // @private
    onPagingBlur: function (e) {
        var me = this,
            inputItem = this.getInputItem(),
            pageData = me.getPageData(),
            pageNum;

        if (inputItem) {
            pageNum = me.readPageFromInput(pageData);
            if (pageNum !== false) {
                pageNum = Math.min(Math.max(1, pageNum), pageData.pageCount);
                if (pageNum !== pageData.currentPage && me.fireEvent('beforechange', me, pageNum) !== false) {
                    me.store.loadPage(pageNum);
                }
            }
            //curPage = this.getPageData().currentPage;
            //inputItem.setValue(curPage);
        }
    }
});
