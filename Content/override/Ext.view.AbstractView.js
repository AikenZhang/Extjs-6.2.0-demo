/* ***********************************************
 * author :  ***
 * function: loading图标
 * history:  created by *** 2015/12/11 13:21:31 
 * ***********************************************/
Ext.override(Ext.view.AbstractView, {
    loadingText: AppConfig.maskHtml || '<i class="fa fa-cog fa-spin" style="font-size:30px"></i>'
});