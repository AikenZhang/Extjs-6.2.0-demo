/* ***********************************************
 * author :  fei85
 * function: 
 * history:  created by fei85 2016/9/21 9:44:15 
 * ***********************************************/
Ext.override(Ext.view.Table, {
    //设置表格内容可复制
    enableTextSelection: true,
    //listeners: {
    //    'refresh':
    //},
    initComponent: function () {
        var me = this;

        //增加单元格单击复制功能
        if (AppConfig.enableGridClickCopy) {
            var ua = navigator.userAgent.toLowerCase(),
                isIE = (!!window.ActiveXObject || "ActiveXObject" in window),
                isIE8 = isIE && ua.indexOf("msie") > -1 && parseInt(ua.match(/msie ([\d.]+)/)[1]) === 8.0;
            if (isIE8) {
                me.on('cellclick', function (view, item) {
                    if (me.ownerCt && !me.ownerCt.notEnabledCopy) {
                        if (window.clipboardData) {
                            window.clipboardData.setData("Text", Ext.String.trim(item.innerText || item.textContent || ''));
                        }
                    }
                });
            } else {
                var ver = parseInt(Ext.versions.extjs.major.toString() + Ext.versions.extjs.minor.toString() + Ext.versions.extjs.pad.toString(), 10);
                var _obj = ver < 620 ? {
                    text: function (item) {
                        return Ext.String.trim(item.innerText || item.textContent || '');
                    }
                } : {
                    target: function (item) {
                        return item;
                    }
                };

                me.on('refresh', function (view) {
                    if (me.ownerCt && !me.ownerCt.notEnabledCopy) {
                        setTimeout(function () {
                            var el = me.getEl();
                            if (el) {
                                var clipboard = new Clipboard(el.dom.querySelectorAll('.x-grid-cell-inner'), _obj);
                            }
                        }, 300);
                    }
                });
                var fn = function (records, index, nodes, eOpts) {
                    if (me.ownerCt && !me.ownerCt.notEnabledCopy) {
                        for (var i = 0; i < nodes.length; i++) {
                            var clipboard = new Clipboard(nodes[i].querySelectorAll('.x-grid-cell-inner'), _obj);
                        }
                    }
                }
                me.on('itemadd', fn);
                me.on('itemupdate', fn);
            }
        }
        me.callParent(arguments);
    },
    setActionableMode: function (enabled, position) {
        var me = this,
            navModel = me.getNavigationModel(),
            focusRow,
            focusCell,
            tabbableChildren,
            activeEl,
            actionables = me.grid.actionables,
            len = actionables.length,
            i,
            record,
            isActionable,
            lockingPartner,
            result;

        // No mode change.
        // ownerGrid's call will NOT fire mode change event upon false return.
        if (me.actionableMode === enabled) {
            // If we are actionable already at that positoin return false.
            // Test using mandatory passed position because we may not have an actionPosition if we are 
            // the lockingPartner of an actionable view that contained the action position.
            if (enabled && position.isEqual(me.actionPosition)) {
                return false;
            }
            result = false;
        }

        // If this View or its lockingPartner contains the current focus position, then make the tab bumpers tabbable
        // and move them to surround the focused row.
        if (enabled) {
            if (position && (position.view === me || (position.view === (lockingPartner = me.lockingPartner) && lockingPartner.actionableMode))) {
                position = position.clone();
                record = position.record;
                focusRow = me.all.item(position.rowIdx);

                // We're the focused side - attempt to see if ths focused cell is actionable
                if (!lockingPartner) {
                    //解决机构分组收缩报错的问题 SQ
                    if (!position.column) {
                        return false;
                    }
                    focusCell = Ext.fly(focusRow).down(position.column.getCellSelector());

                    // Inform all Actionables that we intend to activate this cell.
                    // If any return true, isActionable will be set
                    for (i = 0; i < len; i++) {
                        isActionable = isActionable || actionables[i].activateCell(position);
                    }
                }

                // If we have a lockingPartner that is actionable
                //  or if we find some elements we can restore to tabbability
                //  or a plugin declared it was actionable at this position:
                //      dive in and activate the row
                if (lockingPartner || focusCell.restoreTabbableState(/* skipSelf */ true).length || isActionable) {

                    // We are entering actionable mode.
                    // Tell all registered Actionables about this fact if they need to know.
                    for (i = 0; i < len; i++) {
                        if (actionables[i].activateRow) {
                            actionables[i].activateRow(focusRow);
                        }
                    }

                    // Only enter actionable mode if there is an already actionable locking partner,
                    // or there are tabbable children in current cell.
                    if (lockingPartner || (tabbableChildren = focusCell.findTabbableElements()).length) {

                        // Restore tabbabilty to all elements in this row
                        focusRow.restoreTabbableState(/* skipSelf */ true);

                        // If we are the locking partner of an actionable side, we are successful already
                        if (lockingPartner) {
                            me.actionableMode = true;
                            return result;
                        }

                        // If there are focusables in the actioned cell, we can enter actionable mode.
                        if (tabbableChildren) {
                            /**
                             * @property {Ext.dom.Element} actionRow
                             * Only valid when a view is in actionableMode. The currently actioned row
                             */
                            me.actionRow = focusRow;

                            me.actionableMode = me.ownerGrid.actionableMode = true;

                            // Clear current position on entry into actionable mode
                            navModel.setPosition();

                            navModel.actionPosition = me.actionPosition = position;

                            tabbableChildren[0].focus();

                            // Avoid falling through to returning false
                            return result;
                        }
                    }
                }
            }

            // Did not enter actionable mode.
            // ownerGrid's call will NOT fire mode change event upon false return.
            return false;
        } else {
            // Capture before exiting from actionable mode moves focus
            activeEl = Ext.fly(Ext.Element.getActiveElement());

            // We are exiting actionable mode.
            // Tell all registered Actionables about this fact if they need to know.
            for (i = 0; i < len; i++) {
                if (actionables[i].deactivate) {
                    actionables[i].deactivate();
                }
            }

            // If we had begun action (we may be a dormant lockingPartner), make any tabbables untabbable
            if (me.actionRow) {
                me.actionRow.saveTabbableState({
                    skipSelf: true,
                    includeSaved: false
                });
            }

            // Restore focus to the cell in which the user invoked exit actionable mode.
            if (me.el.contains(activeEl)) {
                navModel.setPosition(new Ext.grid.CellContext(me).setPosition(me.getRecord(activeEl) || 0, me.getHeaderByCell(activeEl.findParent(me.getCellSelector())) || 0));
            }
            me.actionableMode = me.ownerGrid.actionableMode = false;
            me.actionPosition = navModel.actionPosition = me.actionRow = null;
        }
    }
});