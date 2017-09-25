/* ***********************************************
 * author :  ***
 * function: 图片浏览器 缩放 旋转
 * history:  created by *** 2015/7/31 13:54:07 
 * history:  update by *** 2015/8/2 13:54:07 
 *           添加图片列表浏览功能 
 *           左右切换图片
 *           改造css3动画效果 
 *           添加鼠标滚轮事件 
 *           添加拖动放大功能 
 *           添加移动图片功能 
 *           添加原图查看功能
 *           IE6-8 
 * ***********************************************/
Ext.define("Fm.ux.ImageView", {
    extend: 'Ext.panel.Panel',
    requires: ['Fm.ux.IFrame'],
    alias: 'widget.imageview',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    imageIndex: 0,
    /**
     * 图片列表 多图查看
     */
    imageList: [],
    layout: 'fit',
    loadingMsg: '加载中...',
    initComponent: function () {
        var me = this;
        me.items = [{
            xtype: 'uxiframe',
            src: AppConfig.urlStartWith + 'FmContent/lib/feiimageview/viewpanel.html?v=1&imageList=' + encodeURIComponent(Ext.JSON.encode(me.imageList)) + '&index=' + me.imageIndex,
            listeners: {
                load: function (frame) {
                    me.image = frame.getWin()._fImagePanel.image;
                },
                error: function () {

                }
            }
        }];

        me.callParent();
    },
    getImage: function () {
        return this.image;
    }
});