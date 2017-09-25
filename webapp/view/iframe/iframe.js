Ext.define('webapp.view.iframe.iframe', {
    extend: 'Ext.contaniner.Container',
    requires:[
        "webapp.view.ll.llController",
        "webapp.view.ll.llModel"
    ],
    width:400, 
    height:500,
    id:"aaa01",
    html:'<iframe src="webapp/view/aa.html"></iframe>',
    buttons:[
        {
            xtype:"button",
            text:"dd",
            scope:this,
            handler:function(){
                this.getView().close();
            }
        }
    ],
    // initComponent: function () {
    //     // var me = this;
    //     // me.buttons = [
    //     //     {
    //     //         text: '关闭',
    //     //         scope:this,
    //     //         handler: function(){console.log(this)}
    //     //     }
    //     // ];
    //     // me.callParent(arguments);
    // }
 })