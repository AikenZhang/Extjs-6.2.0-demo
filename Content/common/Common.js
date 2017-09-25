///* ***********************************************
// * author :  ***
// * function: 通知
// * history:  created by FeiLong 2015/5/11 16:31:57 
// * ***********************************************/
Ext.ns('Fm').msg = {
    show: function (msg, title) {

        setTimeout(function () {
            Ext.toast({
                title: title,
                html: msg,
                closable: true,
                align: 'br',
                frame: false,
                slideInDuration: 300,
                minHeight: 80,
                width: 400,
                minWidth: 400
            });
        }, 50);
    },
    info: function (msg, title) {
        Fm.msg.show('<span>' + (msg || '') + '</span>', title || '提示');
    },
    notify: function (msg, title) {
        Fm.msg.show('<span>' + (msg || '') + '</span>', title || '通知');
    },
    warn: function (msg, title) {
        Fm.msg.show('<span style="color:rgb(246, 252, 5)">' + (msg || '') + '</span>', title || '警告');
    },
    error: function (msg, title) {
        if (msg) {
            Fm.msg.show('<span style="color:#ff0000">' + (msg || '') + '</span>', title || '错误');
        }
    }
};

Ext.ns('Fm').Array = {
    /**
     * ***
     * 模拟异步多线程循环
     * arr: 原始数组 
     * eachFn: 循环方法 参数 1:单条数据 2:下标
     * backFn: 循环完成回调函数
     */
    eachSync: function (arr, eachFn, backFn, sCount) {
        //数组总长度
        var arrLength = arr.length;
        //单次循环次数
        var singleCount = sCount || 200;
        //完成线程数
        var compLength = 0;
        //总线程数
        var allLengh = Math.ceil(arrLength / singleCount);
        //是否跳出循环
        var isBreak = false;

        //小于1不循环
        if (arrLength < 1) {
            if (backFn) {
                backFn();
            }
            return;
        }
        //总长度不足一次或只有一次的情况 直接循环
        if (arrLength <= singleCount) {
            for (var i = 0; i < arrLength; i++) {
                var rel = eachFn(arr[i], i);
                if (rel === false) {
                    break;
                }
            }
            if (backFn) {
                backFn();
            }
            return;
        }

        //单个线程循环
        var runFn = function (theardIndex) {
            var _s = theardIndex * singleCount;
            var _e = (theardIndex === allLengh - 1) ? arrLength : (_s + singleCount);
            for (var i = _s; i < _e; i++) {
                var rel = eachFn(arr[i], i);
                if (isBreak || rel === false) {
                    isBreak = true;
                    break;
                }
            }
        }

        //线程函数
        var startFn = function (theardIndex) {
            return function () {
                runFn(theardIndex);
                compLength++;
            }
        };

        if (Ext && Ext.Deferred) {
            var fns = [];
            for (var i = 0; i < allLengh; i++) {
                fns.push(startFn(i))
            }
            Ext.Deferred.parallel(fns).then(backFn || function () { });
        } else {
            //开启线程
            for (var i = 0; i < allLengh; i++) {
                setTimeout(startFn(i), i * 5);
            }

            //监听 完成后调用回调函数
            var listen = setInterval(function () {
                if (compLength === allLengh && compLength != 0) {
                    clearInterval(listen);
                    if (backFn) {
                        //setTimeout(function () {
                        backFn();
                        //}, 50);
                    }
                }
            }, 50);
        }
    },

    //数组分组
    group: function (arr, field) {
        var groups = {};
        Ext.Array.forEach(arr, function (item) {
            if (groups[item[field]]) {
                groups[item[field]].push(item);
            } else {
                groups[item[field]] = [item];
            }
        });
        return groups;
    },

    /**
     * 何泽立
     * 建立层级数据列表
     * arr: 原始数组 
     * field: 节点标识
     * fieldParebt: 父节点标识
     * root: 根节点
     * istree: 是否添加leaf节点标记(判断节点是否为叶子节点 leaf)
     * checkfield: 判断节点是否被选中(通过checkfield列设置节点checked是否选中属性)
     * fn: 装饰方法 传入依次遍历的节点，返回false移除该节点
     */
    tier: function (arr, field, fieldParent, root, istree, checkfield, fn) {
        var getChild = function (item) {
            var nodes = [];
            for (var i = 0; i < arr.length; i++) {
                var node = arr.shift();
                if (item[field] === node[fieldParent]) {
                    nodes.push(node); i--;
                } else {
                    arr.push(node);
                }
            }
            for (var i = 0; i < nodes.length; i++) {
                getChild(nodes[i]);
                if (fn && fn(nodes[i]) === false) {
                    nodes = Ext.Array.removeAt(nodes, i);
                    i--;
                }
            }
            if (checkfield) {
                item.checked = item[checkfield];
            }
            if (nodes.length > 0) {
                item.children = nodes;
            }
            else if (istree) {
                item.leaf = true;
            }
        }
        getChild(root);
        return root;
    }
};