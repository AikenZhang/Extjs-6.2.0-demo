/* ***********************************************
 * author :  闫刘盘 韩奎奎
 * function: 文件上传按扭控件，支持暂停，断点续传，进度显示等
 * history:  created by 闫刘盘 韩奎奎 2015/8/9 15:12:18 
 * ***********************************************/

Ext.define('Fm.ux.form.FileUpload', {
    extend: 'Ext.form.field.File',
    alias: ['widget.fileupload'],
    alternateClassName: ['Ext.form.FileUploadField', 'Ext.ux.form.FileUploadField', 'Ext.form.File'],
    requires: [
        'Ext.form.field.FileButton',
        'Ext.form.trigger.Component'
    ],
    needArrowKeys: false,
    auto: null,
    compressMode: false,
    //webuploader
    uploader: null,
    //滚动条
    progressBar: null,
    //实际文件名
    fileName: null,
    //是否日期分隔 
    dateSeparate: true,
    //当前文件对象
    currrentFile: null,

    onRender: function () {
        var me = this;

        me.callParent(arguments);
        me.rendWebUpload(me.button.id);
    },

    //添加外部滚动条
    setProgressBar: function (progressbar) {
        var me = this;

        me.progressBar = progressbar;
    },
    //开始上传或继续上传
    startUpload: function (options) {
        var me = this,
            uploader = me.uploader;

        if (typeof options === 'function') {
            options = {
                callback: options
            };
        }
        else {
            options = Ext.apply({}, options);
        }

        if (uploader) {
            uploader.upload();
        }

        Ext.apply(me, options);

    },
    //停止上传 paused
    stopUpload: function () {
        var me = this,
            uploader = me.uploader;

        if (uploader) {
            uploader.stop(true);
        }
    },
    //重试上传
    retryUpload: function () {
        var me = this,
            uploader = me.uploader;

        if (uploader) {
            uploader.retry();
        }
    },

    //移除文件
    removeFile: function () {
        var me = this,
            uploader = me.uploader;

        me.setRawValue('');

        if (uploader) {
            if (me.currrentFile) {
                uploader.removeFile(me.currrentFile.id, true);
            }
        }
    },

    //取消上传
    cancelFile: function () {
        var me = this,
            uploader = me.uploader;

        if (uploader && uploader.isInProgress()) {
            uploader.cancelFile(me.currrentFile);
        }
    },
    //获取所选文件
    getFiles: function () {
        var me = this,
            uploader = me.uploader;

        if (uploader) {
            return uploader.getFiles();
        }
    },
    //获取文件上传后的文件名 以GUID命名
    getFileName: function () {
        var me = this;

        return me.fileName;
    },
    //获取文件上传后的文件名 以GUID命名
    setFileName: function (name) {
        var me = this,
            uploader = me.uploader;

        me.fileName = name;

        uploader.option('formData', {
            fileName: name
        });
        
    },

    rendWebUpload: function (buttonId) {
        var me = this,
            guid, datePath,
            dateSeparate = me.dateSeparate,
            inBuiltProgressBar = true,
            //分块大小：1024 * 1024 为1M
            nChunkSize = 1024 * 1024;

        if (me.progressBar) {
            me.progressBar.hide();
        }
        else {
            inBuiltProgressBar = false;
        }

        WebUploader.Uploader.register({
            'before-send': 'checkchunk'
        }, {
            checkchunk: function (block) {
                var blob = block.blob.getSource(),
                    owner = this.owner,
                    deferred = WebUploader.Deferred();

                Ext.Ajax.request({
                    url: 'fmshared/file/chunkcheck',
                    method: 'post',
                    params: { guid: guid, chunk: block.chunk, fileName: block.file.name },
                    success: function (res) {
                        var resText = Ext.util.JSON.decode(res.responseText);//获取服务端操作返回值
                        if (resText.isSuccess) {
                            deferred.reject();
                        } else {
                            deferred.resolve();
                        }
                    }
                });

                return deferred.promise();
            }
        });

        //创建一个WebUploader
        var uploader = WebUploader.create({
            auto: me.auto,
            swf: AppConfig.urlStartWith + 'lib/webuploader/Uploader.swf',
            server: AppConfig.urlStartWith + 'fmshared/file/upload',
            //1024 * 1024 为1M
            chunkSize: nChunkSize, //设置分段大小
            chunked: true, //对大文件是否设置分段
            chunkRetry: 1,
            threads: 1,
            fileSingleSizeLimit: me.fileSingleSizeLimit,//上传文件的最大值
            resize: false,
            formData: {
                savePath: me.savePath,//文件保存的业务路径
                compressMode: me.compressMode,//是否开启解压缩
                chunkSize: nChunkSize
            },
            pick: {
                //是不可以进行多先
                multiple: false,
                id: '#' + buttonId
            },
            accept: {
                //设置可上传的文件扩展名
                extensions: me.extensions
            }
        });
        me.uploader = uploader;

        //错误事件
        uploader.on('error', function (msg) {
            if (msg === 'F_DUPLICATE') {
                Fm.msg.info('文件重复添加');
            }
            else if (msg === 'Q_TYPE_DENIED') {
                Fm.msg.info('文件类型选择出错，请重试');
            }
            else if (msg === 'F_EXCEED_SIZE') {
                Fm.msg.info('文件过大，请压缩后再进行上传');
            }
            else {
                Fm.msg.info('出错' + msg);
            }
        });

        //进度条事件
        uploader.on('uploadProgress', function (file, percentage) {
            var process,
                percent = Math.floor(percentage * 100);

            if (me.progressBar) {

                me.progressBar.show();

                if (percent === 100) {
                    process = 1;
                } else {
                    process = percentage;
                }
                me.progressBar.setValue(process, '' + file.name + '　正在处理文件...');
            }
        });

        // 当有文件添加进来的时候
        uploader.on('fileQueued', function (file) {
            me.fireEvent('fileChange', file.name);

            if (me.currrentFile) {
                uploader.removeFile(me.currrentFile);
            }
            me.currrentFile = file;
            //后台已guid作为文件名
            guid = Fm.Common.Util.Guid().replace(/\s/g, '');
            
            if (dateSeparate) {
                //var date = new Date(Fm.Server.Config['NowDate']);
                //datePath = Ext.util.Format.date(date, 'Y-m-d');

                datePath = Fm.Common.Util.getNowDateStr('Y-m-d');
                uploader.option('formData', {
                    guid: guid,
                    datePath: datePath
                });
            } else {
                uploader.option('formData', {
                    guid: guid
                });
            }
            me.setValue(file.name);
            me.setRawValue(file.name);
            me.fileName = guid + '.' + file.name;

        });

        //成功事件
        uploader.on('uploadSuccess', function (file) {
            uploader.removeFile(file);
            me.currrentFile = null;
            me.setRawValue('');

            if (inBuiltProgressBar) {
                me.progressBar.hide();
            }

            Ext.Ajax.request({
                url: 'fmshared/file/UploadSuccess',
                method: 'post',
                params: { fileName: me.fileName, businessPath: me.savePath, datePath: datePath, compressMode: me.compressMode },
                success: function (res) {
                    var resText = Ext.util.JSON.decode(res.responseText);//获取服务端操作返回值
                    me.fireEvent('fileChange', null);

                    if (resText.IsSuccess) {
                        if (me.callback) {
                            me.callback(resText.Result);
                        }
                        me.fireEvent('uploadSuccess', resText.Result);
                    } else {
                        Fm.msg.info('附件上传失败');

                    }
                }
            });
        });

        //失败事件
        uploader.on('uploadError', function (file) {
            uploader.removeFile(file);
            me.fireEvent('fileChange', null);

            if (me.callback) {
                me.callback(null);
            }
            Fm.msg.info('附件上传失败');
        });
    },
    onDestroy: function () {
        var me = this;
        me.uploader.destroy();
        me.callParent();
    }
});
