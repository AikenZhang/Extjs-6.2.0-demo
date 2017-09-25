/* ***********************************************
 * author :  fei85
 * function: 
 * history:  created by fei85 2016/3/3 9:45:57 
 * ***********************************************/
Ext.define("Fm.ux.form.UEditor", {
    extend: 'Ext.form.field.TextArea',
    alias: ['widget.ueditor'],

    fieldSubTpl: [
        '<textarea id="{id}-ue" autocomplete="off">\n',
            '<tpl if="value">{[Ext.util.Format.htmlEncode(values.value)]}</tpl>',
        '</textarea>',
        '<textarea id="{id}" data-ref="inputEl" style="display:none" ',
            '<tpl if="name"> name="{name}"</tpl>',
            ' autocomplete="off">\n',
            '<tpl if="value">{[Ext.util.Format.htmlEncode(values.value)]}</tpl>',
        '</textarea>',
        {
            disableFormats: true
        }
    ],
    width: 700,
    config: {
        ueditorConfig: {}
    },
    initComponent: function () {
        var me = this;
        me.callParent(arguments);
    },
    afterRender: function () {
        var me = this;
        me.callParent(arguments);
        if (!me.ue) {
            me.ue = UE.getEditor(me.getInputId() + '-ue', Ext.apply(me.ueditorConfig, {
                initialFrameHeight: me.height || '300px',
                initialFrameWidth: '100%',
                "imageActionName": "uploadimage",
                "imageFieldName": "upfile",
                "imageAllowFiles": [".png", ".jpg", ".jpeg", ".gif", ".bmp"],
                "imageCompressEnable": false,
                "imageInsertAlign": "none",
                "imageUrlPrefix": "",
                "fileActionName": "uploadfile",
                "fileFieldName": "upfile",
                "fileUrlPrefix": "",
                "fileAllowFiles": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".rar", ".zip", ".tar", ".gz", ".7z", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".pdf", ".txt"]
            }));
            me.ue.ready(function () {
                me.UEditorIsReady = true;
            });

            //这块 组件的父容器关闭的时候 需要销毁编辑器 否则第二次渲染的时候会出问题 可根据具体布局调整
            var win = me.up('window');
            if (win && win.closeAction == "hide") {
                win.on('beforehide', function () {
                    me.onDestroy();
                });
            } else {
                var panel = me.up('panel');
                if (panel && panel.closeAction == "hide") {
                    panel.on('beforehide', function () {
                        me.onDestroy();
                    });
                }
            }
        } else {
            me.ue.setContent(me.getValue());
        }
    },
    setValue: function (value) {
        var me = this;
        if (!me.UEditorIsReady) {
            me.setRawValue(me.valueToRaw(value));
        } else {
            me.ue.insertHtml(value);
        }
        me.callParent(arguments);
        return me;
    },
    getRawValue: function () {
        var me = this;
        if (me.UEditorIsReady) {
            document.getElementById(me.getInputId()).innerText = me.ue.getContent();
        }
        var v = me.callParent();
        if (v === me.emptyText && me.valueContainsPlaceholder) {
            v = '';
        }
        return v;
    },
    onDestroy: function () {
        var me = this;
        if (me.rendered) {
            try {
                me.ue.destroy();
                delete me.ue;
            } catch (e) { }
        }
        me.callParent();
    }
});