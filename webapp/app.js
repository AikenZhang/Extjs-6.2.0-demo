Ext.Loader.setPath({
    'FmApp': AppConfig.appUrl+'FmApp',
    'Ext.ux': AppConfig.appUrl+'lib/ux',
    'Fm':AppConfig.appUrl+'Content',
    'Ext.exporter': AppConfig.appUrl+'FmContent/lib/extjs621/ux/exporter',
    'Ext.draw.ContainerBase':AppConfig.appUrl+'lib/build/charts.js'
});
Ext.setGlyphFontFamily('FontAwesome');
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