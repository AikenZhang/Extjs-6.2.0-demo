/* ***********************************************
 * author :  何泽立
 * function: 重写拖拽 触发无效的移动时隐藏代理删除缓存目标
 * history:  created by 何泽立 2015/10/08
 * ***********************************************/

Ext.override(Ext.dd.DragSource, {
    onInvalidDrop: function (target, e, id) {
        this.hideProxy();
        delete this.cachedTarget;
    }
});
