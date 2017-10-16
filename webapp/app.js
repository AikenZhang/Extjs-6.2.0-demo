Ext.Loader.setPath({
    'FmApp': AppConfig.appUrl+'FmApp',
    'Ext.ux': AppConfig.appUrl+'lib/ux',
    'Fm':AppConfig.appUrl+'Content',
    'Ext.exporter': AppConfig.appUrl+'FmContent/lib/extjs621/ux/exporter',
    'Ext.draw.ContainerBase':AppConfig.appUrl+'lib/build/charts.js'
});
Ext.setGlyphFontFamily('FontAwesome');
//遮罩
var LoadMask={
    show:function(view){
        var me=this;
        var viewId=view.getId();
        me[viewId]=new Ext.LoadMask({
            style: {
                backgroundColor: 'rgba(255, 255, 255, 0.5);'
            },
            border: false,
            target: view
        });
        me[viewId].show();
    },
    hide:function(view){
        var viewId=view.getId();
        //this[viewId].hide();
    }
};
Ext.application({
    name: AppConfig.appName,
    appFolder: AppConfig.appUrl + AppConfig.appName,
    //extend: 'Fm.BaseApp',
    enabled: true,
    requires: [
        //'Fm.BaseApp',
        'Ext.window.MessageBox',
        
    ],
    autoCreateViewport: "webapp.view.main.Main"
});