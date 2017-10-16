//author   status404
Ext.define("Fm.ux.ueditor.Ueditor",{
	extend:"Ext.Component",
	alias: 'widget.ueditor',
	width:500,
	height:900,
    autoEl:{
        tag:'script',
        type:'text/plain'
    },
    initComponent: function () {
        var me = this;
        me.callParent(arguments);
    },
    onRender:function(){
        var me = this;
        me.callParent(arguments);
        //初始化Ueditor
        me.ue=UE.getEditor(me.getId(),Ext.apply(
            {
                //此处可以添加ueidot默认的配置
            },me.ueditorConfig)); 
        //当Ueditor 内容改变时，传回viewModel，实现双向绑定
        me.ue.on("contentChange",function(){
            me.publishState("value",me.ue.getContent());
            me.isSet=true;
        })
    },
    //给Ueditor赋值
    setValue:function(value){
        var me=this;
        //避免Ueditor内容更改时再又重新赋值
        if(me.isSet){
            me.isSet=false;
        }
        else{
            me.ue.ready(function(){
                me.ue.setContent(value, false);
        });
        }
    },
    //获取内容
    getValue:function(){
        var me = this;
        return me.ue.getContent();
    },
    //获得纯文本
    getContentText:function(){
        var me=this;
        return me.ue.getContentTxt();
    },
    //在内容最后添加内容
    addContent:function(value){
        var me=this;
        me.ue.setContent(value,true);
    },
    //指定位置追加内容
    insertHtml:function(value){
        var me=this;
        me.ue.execCommand('insertHtml', value);
    },
    //注销
    toDestroy:function(){
        var me=this;
        me.ue.destroy();
    },
    //组件关闭时，销毁Ueditor实例
    onDestroy:function(){
        var me = this;
        me.callParent(arguments);
        if (me.rendered) {
            try {
                me.ue.destroy();
                delete me.ue;
            } catch (e) { }
        }
    }
});