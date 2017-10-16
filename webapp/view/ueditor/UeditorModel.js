Ext.define('webapp.view.ueditor.UeditorModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.ueditor',
    data:{
    	ueditor:Ext.create('Ext.data.Model',{
    		value:'欢迎使用ueditor'
    	})
    }
})