/* ***********************************************
 * author :  柏昆
 * function: 客户端业务计算方法
 * history:  created by 柏昆  
 * ***********************************************/
Ext.ns('Fm.Common').Core = {
    Shared: {
        getForData: function (data) {
            var getarray = function (data, _text) {
                if (!data) {
                    return;
                }
                var cg = [];
                for (var i = 0; i < data.length; i++) {
                    if (Ext.isArray(data[i].Value)) {
                        cg[i] = {
                            text: data[i].Text,
                            leaf: false,
                            checked: false,
                            children: getarray(data[i].Value, data[i].Text)
                        };
                    } else {
                        var childen = [];
                        for (var j = 0; j < data.length; j++) {
                            childen[j] = {
                                GroupRuleBit: _text + '|' + data[j].RuleBit,
                                RuleBit: data[j].RuleBit,
                                value: data[j].RuleBit,
                                text: data[j].Name,
                                Id: data[j].Id,
                                leaf: true,
                                checked: false
                            };
                        }
                        return childen;
                    }
                }
                return cg;
            };
            return getarray(data);

        }
    }
}