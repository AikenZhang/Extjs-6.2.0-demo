/* ***********************************************
 * author :  fei85
 * function: 思维导图控件 https://github.com/hizzgdev/jsmind
 * history:  created by fei85 2016/11/7 14:02:46 
 {
    xtype: 'mindmap',
    width: 600,
    height: 600,
    jmData: [
        { "id": "root", "isroot": true, "topic": "jsMind" },

        { "id": "sub1", "parentid": "root", "topic": "sub1", "background-color": "#0000ff" },
        { "id": "sub11", "parentid": "sub1", "topic": "sub11" },
        { "id": "sub12", "parentid": "sub1", "topic": "sub12" },
        { "id": "sub13", "parentid": "sub1", "topic": "sub13" },

        { "id": "sub2", "parentid": "root", "topic": "sub2" },
        { "id": "sub21", "parentid": "sub2", "topic": "sub21" },
        { "id": "sub22", "parentid": "sub2", "topic": "sub22", "foreground-color": "#33ff33" },

        { "id": "sub3", "parentid": "root", "topic": "sub3" },
    ]
}
 * ***********************************************/
Ext.define("Fm.ux.MindMap", {
    extend: 'Ext.container.Container',
    alias: ['widget.mindmap'],
    twoWayBindable: ['jmData'],
    defaultBindProperty: 'jmData',
    publishes: ['jmDataChange'],
    config: {
        jmData: []
    },
    jmOptions: {
    },
    onRender: function () {
        var me = this;
        me.callParent();
        me.toolTip = Ext.create('Ext.menu.Menu', {
            items: [
                {
                    xtype: 'container',
                    minWidth: 100,
                    minHeight: 50,
                    padding: 5,
                    style: { 
                        color: '#555'
                    },
                    html: 'tooltip'
                }
            ]
        });
        me.showJm();
    },
    showJm: function () {
        var me = this,
            innerCtId = me.getId() + '-innerCt',
            mind,
            options;

        if (!me.jmData || me.jmData.length < 1) {
            return;
        }

        mind = {
            "meta": {
                "name": me.getId(),
                "author": "mjl",
                "version": "1.0",
            },
            "format": "node_array",
            "data": me.jmData
        };

        options = Ext.apply({
            editable: false,
            theme: 'greensea',
            container: innerCtId,
            support_html: true,
            default_event_handle: {
                enable_mousedown_handle: true,
                enable_click_handle: true,
                enable_dblclick_handle: false
            },
            view: {
                line_color: ['#ff0000', '#00ff08', '#0014ff', '#ffa500', '#683489', '#136987', '#456852']
            }
        }, me.jmOptions);

        var jm = me.jm = new jsMind(options);
        jm.show(mind);

        var el = me.getEl(),
            nodes = el.query('jmnode');

        el.on('contextmenu', function (e) {
            e.stopEvent();
        });

        for (var i = 0; i < nodes.length; i++) {
            var nodeEl = Ext.get(nodes[i]);
            nodeEl.on('contextmenu', function (e) {
                me.fireEvent('contextMenu', me.jm.get_selected_node(), e);
            });
            nodeEl.on('click', function (e) {
                me.fireEvent('nodeClick', me.jm.get_selected_node(), e);
            });
            nodeEl.on('mouseover', function (e, nElement) {
                var nodeid = me.jm.view.get_binded_nodeid(nElement),
                    _node = me.jm.get_node(nodeid);
                if (_node.data.toolTip) {
                    me.toolTip.down('container').setConfig({ html: _node.data.toolTip });
                    me.toolTip.showAt(e.getPoint());
                } else {
                    me.toolTip.down('container').setConfig({ html: '' });
                }
            });
            nodeEl.on('mouseout', function (e, nElement) {
                me.toolTip.hide();
            });
        }
    },
    setJmData: function (data) {
        var me = this;
        me.jmData = data;

        if (me.rendered) {
            me.showJm();
        }
    },
    getJmData: function () {
        var me = this,
            mind_data = me.jm.get_data('node_array');

        me.jmData = mind_data.data;

        return me.jmData;
    }
});