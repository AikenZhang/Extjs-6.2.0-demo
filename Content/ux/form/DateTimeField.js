/* ***********************************************
 * author :  ***
 * function: 月份选择控件
 * history:  created by *** 2015/6/9 15:12:18 
 * ***********************************************/
Ext.define('Fm.ux.form.TimePicker', {
    extend: 'Ext.picker.Date',
    requires: ['Ext.form.field.Number'],
    hideOnSelect: false,
    todayText: '现在',
    okText: '确定',
    okTip: '确定选择时间',
    getRefItems: function () {
        var me = this,
            result = me.callParent();

        if (me.TimeContainer) {
            result.push(me.TimeContainer);
        }

        return result;
    },
    beforeDestroy: function () {
        var me = this;
        if (me.rendered) {
            Ext.destroy(
                me.okBtn
            );
        }
        me.callParent();
    },
    _toTime: function () {
        var me = this;
        if (me.TimeContainer) {
            me.TimeContainer.down('combo[itemId=hours]').focus()
        }
    },
    initEvents: function () {
        var me = this,
            pickerField = me.pickerField,
            eDate = Ext.Date,
            day = eDate.DAY;
        me.keyNavConfig = Ext.apply(me.keyNavConfig, {
            down: function (e) {
                me.update(eDate.add(me.activeDate, day, 7));
            },
            pageDown: function (e) {
                me.showNextMonth();
            },
            space: function (e) {
                var me = this;
                if (me.TimeContainer) {
                    me.TimeContainer.down('combo[itemId=hours]').focus()
                    return false;
                }
                // return false;
            },
            tab: function () {
                return false;
            }
        });
        me.callParent();
    },
    beforeRender: function () {
        var me = this,
            today = Ext.Date.format(new Date(), me.format);

        var getStore = function (endNum) {
            return Ext.create('Ext.data.Store', {
                fields: ['Text', 'Value'],
                data: (function () {
                    var d = [];
                    for (var i = 0; i < endNum; i++) {
                        var _text = i.toString();
                        if (_text.length === 1) {
                            _text = '0' + _text;
                        }
                        d.push({ Text: _text, Value: i });
                    }
                    return d;
                })()
            });
        };
        me.TimeContainer = Ext.create('Ext.container.Container', {
            scope: me,
            ownerCt: me,
            ownerLayout: me.getComponentLayout(),
            layout: 'column',
            ariaRole: 'presentation',
            padding: '0 0 0 15',
            defaults: {
                xtype: 'combo',
                editable: false,
                //allowDecimals: false,
                //allowNegative: false,
                enableKeyEvents: true,
                //repeatTriggerClick: false,
                displayField: 'Text',
                valueField: 'Value',
                showClearTriggers: false,
                width: 40
            },
            items: [
                {
                    value: me.pickerField.lastValue == null ? new Date().getHours() : Ext.Date.format(me.pickerField.lastValue, 'H'),//new Date().getHours(),:i:s
                    //minValue: 0,
                    //maxValue: 23,
                    listeners: {
                        keydown: function (me, e, eOpts) {
                            if (e.getKey() == Ext.event.Event.SPACE) {
                                me.next().next().focus();
                            }
                        }
                    },
                    store: getStore(24),
                    itemId: 'hours', name: 'time'
                }, { xtype: 'label', text: ':', width: 6 },
                {
                    value: me.pickerField.lastValue == null ? new Date().getMinutes() : Ext.Date.format(me.pickerField.lastValue, 'i'),//new Date().getHours(),:i:s
                    //minValue: 0,
                    //maxValue: 59,
                    store: getStore(60),
                    listeners: {
                        keydown: function (me, e, eOpts) {
                            if (e.getKey() == Ext.event.Event.SPACE) {
                                me.next().next().focus();
                            }
                        }
                    },
                    itemId: 'minutes', name: 'time'
                }, { xtype: 'label', text: ':', width: 6 },
                {
                    value: me.pickerField.lastValue == null ? new Date().getSeconds() : Ext.Date.format(me.pickerField.lastValue, 's'),//new Date().getHours(),:i:s
                    //minValue: 0,
                    //maxValue: 59,
                    store: getStore(60),
                    listeners: {
                        keydown: function (me, e, eOpts) {
                            if (e.getKey() == Ext.event.Event.SPACE) {
                                me.next().focus();
                            }
                        }
                    },
                    itemId: 'seconds', name: 'time'
                }, {
                    ui: 'default-toolbar',
                    xtype: 'button',
                    text: '确认',
                    width: 45,
                    handler: me.selectTime,
                    scope: me, name: 'time'
                }
            ],
            listeners: {
                render: function () {
                    var comp = me.TimeContainer;
                    //comp.getEl().swallowEvent(['click', 'mousedown', 'mousemove', 'mouseup', 'dblclick', 'contextmenu', 'mouseover', 'mouseout'], false);
                },

            }
        });
        me.callParent();
    },
    setValue: function (value) {
        // If passed a null value just pass in a new date object.
        if (!Ext.isDate(value)) {
            value = Ext.Date.parse(value || new Date(), this.format);
        }
        this.value = value;
        return this.update(this.value);
    },
    getTimeSp: function () {
        var me = this;
        if (me.TimeContainer) {
            var h = parseInt(me.TimeContainer.down('combo[itemId=hours]').getValue(), 10) * 60 * 60;
            var m = parseInt(me.TimeContainer.down('combo[itemId=minutes]').getValue(), 10) * 60;
            var s = parseInt(me.TimeContainer.down('combo[itemId=seconds]').getValue(), 10);
            return h + m + s;
        }
        return 0;
    },
    /**
     * Respond to a date being clicked in the picker
     * @private
     * @param {Ext.event.Event} e
     * @param {HTMLElement} t
     */
    handleDateClick: function (e, t) {
        var me = this,
            handler = me.handler;
        e.stopEvent();
        if (!me.disabled && t.dateValue && !Ext.fly(t.parentNode).hasCls(me.disabledCellCls)) {
            var _v = Ext.Date.add(new Date(t.dateValue), Ext.Date.SECOND, me.getTimeSp());
            me.setValue(_v);
            //me.fireEvent('select', me, me.value);
            if (handler) {
                handler.call(me.scope || me, me, me.value);
            }
            // event handling is turned off on hide
            // when we are using the picker in a field
            // therefore onSelect comes AFTER the select
            // event.
            me.onSelect();
        }
    },
    /**
     * Sets the current value to today.
     * @return {Ext.picker.Date} this
     */
    selectToday: function () {
        var me = this,
            btn = me.todayBtn,
            handler = me.handler;

        if (btn && !btn.disabled) {
            me.setValue(new Date());
            me.fireEvent('select', me, me.value);
            if (handler) {
                handler.call(me.scope || me, me, me.value);
            }
            me.onSelect();
        }
        return me;
    },

    /**
     * Update the contents of the picker for a new month
     * @private
     * @param {Date} date The new date
     */
    fullUpdate: function (date) {
        var me = this,
            cells = me.cells.elements,
            textNodes = me.textNodes,
            disabledCls = me.disabledCellCls,
            eDate = Ext.Date,
            i = 0,
            extraDays = 0,
            newDate = +eDate.clearTime(date, true),
            today = +eDate.clearTime(new Date()),
            min = me.minDate ? eDate.clearTime(me.minDate, true) : Number.NEGATIVE_INFINITY,
            max = me.maxDate ? eDate.clearTime(me.maxDate, true) : Number.POSITIVE_INFINITY,
            ddMatch = me.disabledDatesRE,
            ddText = me.disabledDatesText,
            ddays = me.disabledDays ? me.disabledDays.join('') : false,
            ddaysText = me.disabledDaysText,
            format = me.format,
            days = eDate.getDaysInMonth(date),
            firstOfMonth = eDate.getFirstDateOfMonth(date),
            startingPos = firstOfMonth.getDay() - me.startDay,
            previousMonth = eDate.add(date, eDate.MONTH, -1),
            ariaTitleDateFormat = me.ariaTitleDateFormat,
            prevStart, current, disableToday, tempDate, setCellClass, html, cls,
            formatValue, value;

        if (startingPos < 0) {
            startingPos += 7;
        }

        days += startingPos;
        prevStart = eDate.getDaysInMonth(previousMonth) - startingPos;
        current = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), prevStart, me.initHour);

        //if (me.showToday) {
        //    tempDate = eDate.clearTime(new Date());
        //    disableToday = (tempDate < min || tempDate > max ||
        //        (ddMatch && format && ddMatch.test(eDate.dateFormat(tempDate, format))) ||
        //        (ddays && ddays.indexOf(tempDate.getDay()) !== -1));

        //    if (!me.disabled) {
        //        me.todayBtn.setDisabled(disableToday);
        //    }
        //}

        setCellClass = function (cellIndex, cls) {
            var cell = cells[cellIndex],
                describedBy = [];

            // Cells are not rendered with ids
            if (!cell.hasAttribute('id')) {
                cell.setAttribute('id', me.id + '-cell-' + cellIndex);
            }

            // store dateValue number as an expando
            value = +eDate.clearTime(current, true);
            cell.firstChild.dateValue = value;

            cell.setAttribute('aria-label', eDate.format(current, ariaTitleDateFormat));

            // Here and below we can't use title attribute instead of data-qtip
            // because JAWS will announce title value before cell content
            // which is not what we need. Also we are using aria-describedby attribute
            // and not placing the text in aria-label because some cells may have
            // compound descriptions (like Today and Disabled day).
            cell.removeAttribute('aria-describedby');
            cell.removeAttribute('data-qtip');

            if (value === today) {
                cls += ' ' + me.todayCls;
                describedBy.push(me.id + '-todayText');
            }

            if (value === newDate) {
                me.activeCell = cell;
                me.eventEl.dom.setAttribute('aria-activedescendant', cell.id);
                cell.setAttribute('aria-selected', true);
                cls += ' ' + me.selectedCls;
                me.fireEvent('highlightitem', me, cell);
            }
            else {
                cell.setAttribute('aria-selected', false);
            }

            if (value < min) {
                cls += ' ' + disabledCls;
                describedBy.push(me.id + '-ariaMinText');
                cell.setAttribute('data-qtip', me.minText);
            }
            else if (value > max) {
                cls += ' ' + disabledCls;
                describedBy.push(me.id + '-ariaMaxText');
                cell.setAttribute('data-qtip', me.maxText);
            }
            else if (ddays && ddays.indexOf(current.getDay()) !== -1) {
                cell.setAttribute('data-qtip', ddaysText);
                describedBy.push(me.id + '-ariaDisabledDaysText');
                cls += ' ' + disabledCls;
            }
            else if (ddMatch && format) {
                formatValue = eDate.dateFormat(current, format);
                if (ddMatch.test(formatValue)) {
                    cell.setAttribute('data-qtip', ddText.replace('%0', formatValue));
                    describedBy.push(me.id + '-ariaDisabledDatesText');
                    cls += ' ' + disabledCls;
                }
            }

            if (describedBy.length) {
                cell.setAttribute('aria-describedby', describedBy.join(' '));
            }

            cell.className = cls + ' ' + me.cellCls;
        };

        me.eventEl.dom.setAttribute('aria-busy', 'true');

        for (; i < me.numDays; ++i) {
            if (i < startingPos) {
                html = (++prevStart);
                cls = me.prevCls;
            } else if (i >= days) {
                html = (++extraDays);
                cls = me.nextCls;
            } else {
                html = i - startingPos + 1;
                cls = me.activeCls;
            }
            textNodes[i].innerHTML = html;
            current.setDate(current.getDate() + 1);
            setCellClass(i, cls);
        }

        me.eventEl.dom.removeAttribute('aria-busy');

        me.monthBtn.setText(Ext.Date.format(date, me.monthYearFormat));
    },

    /**
     * Update the contents of the picker
     * @private
     * @param {Date} date The new date
     * @param {Boolean} forceRefresh True to force a full refresh
     */
    update: function (date, forceRefresh) {
        var me = this,
            active = me.activeDate;

        if (me.rendered) {
            me.activeDate = date;
            if (!forceRefresh && active && me.el &&
                    active.getMonth() === date.getMonth() &&
                    active.getFullYear() === date.getFullYear()) {
                me.selectedUpdate(date, active);
            } else {
                me.fullUpdate(date, active);
            }
        }
        return me;
    },
    /**
     * Update the selected cell
     * @private
     * @param {Date} date The new date
     */
    selectedUpdate: function (date) {
        var me = this,
            t = date.getTime(),
            cells = me.cells,
            cls = me.selectedCls,
            c,
            cLen = cells.getCount(),
            cell;

        me.eventEl.dom.setAttribute('aria-busy', 'true');

        cell = me.activeCell;

        if (cell) {
            Ext.fly(cell).removeCls(cls);
            cell.setAttribute('aria-selected', false);
        }

        for (c = 0; c < cLen; c++) {
            cell = cells.item(c);
            if (me.textNodes[c].dateValue === Ext.Date.clearTime(new Date(t)).getTime()) {
                me.activeCell = cell.dom;
                me.eventEl.dom.setAttribute('aria-activedescendant', cell.dom.id);
                cell.dom.setAttribute('aria-selected', true);
                cell.addCls(cls);
                me.fireEvent('highlightitem', me, cell);
                break;
            }
        }

        me.eventEl.dom.removeAttribute('aria-busy');

        if (me.TimeContainer) {
            me.TimeContainer.down('combo[itemId=hours]').setValue(date.getHours());
            me.TimeContainer.down('combo[itemId=minutes]').setValue(date.getMinutes());
            me.TimeContainer.down('combo[itemId=seconds]').setValue(date.getSeconds());
        }
    },
    selectTime: function (button, e) {
        if (e.getKey() == Ext.event.Event.SPACE) {
            button.up().up().focus();
            return;
        }
        var me = this,
            btn = me.okText,
            handler = me.handler,
            t = me.activeDate;
        if (btn && !btn.disabled) {
            var _v = Ext.Date.add(Ext.Date.clearTime(new Date(t)), Ext.Date.SECOND, me.getTimeSp());
            me.setValue(_v);
            me.fireEvent('select', me, me.value);
            if (handler) {
                handler.call(me.scope || me, me, me.value);
            }
            me.onSelect();
        }
        return me;
    },
    /**
     * @cfg
     * @inheritdoc
     */
    renderTpl: [
        '<div id="{id}-innerEl" data-ref="innerEl" role="presentation">',
            '<div class="{baseCls}-header">',
                '<div id="{id}-prevEl" data-ref="prevEl" class="{baseCls}-prev {baseCls}-arrow" role="presentation" title="{prevText}"></div>',
                '<div id="{id}-middleBtnEl" data-ref="middleBtnEl" class="{baseCls}-month" role="heading">{%this.renderMonthBtn(values, out)%}</div>',
                '<div id="{id}-nextEl" data-ref="nextEl" class="{baseCls}-next {baseCls}-arrow" role="presentation" title="{nextText}"></div>',
            '</div>',
            '<table role="grid" id="{id}-eventEl" data-ref="eventEl" class="{baseCls}-inner" cellspacing="0" tabindex="0">',
                '<thead>',
                    '<tr role="row">',
                        '<tpl for="dayNames">',
                            '<th role="columnheader" class="{parent.baseCls}-column-header" aria-label="{.}">',
                                '<div role="presentation" class="{parent.baseCls}-column-header-inner">{.:this.firstInitial}</div>',
                            '</th>',
                        '</tpl>',
                    '</tr>',
                '</thead>',
                '<tbody>',
                    '<tr role="row">',
                        '<tpl for="days">',
                            '{#:this.isEndOfWeek}',
                            '<td role="gridcell">',
                                '<div hidefocus="on" class="{parent.baseCls}-date"></div>',
                            '</td>',
                        '</tpl>',
                    '</tr>',
                '</tbody>',
            '</table>',
            '<div id="{id}-footerEl22" data-ref="footerEl" class="{baseCls}-footer">{%this.renderTimeField(values, out)%}</div>',
            '<tpl if="showToday">',
                '<div id="{id}-footerEl" data-ref="footerEl" role="presentation" class="{baseCls}-footer">{%this.renderTodayBtn(values, out)%}</div>',
            '</tpl>',
            // These elements are used with Assistive Technologies such as screen readers
            //'<div id="{id}-okText" class="' + Ext.baseCSSPrefix + 'hidden-clip">{okText}.</div>',
            '<div id="{id}-todayText" class="' + Ext.baseCSSPrefix + 'hidden-clip">{todayText}.</div>',
            '<div id="{id}-ariaMinText" class="' + Ext.baseCSSPrefix + 'hidden-clip">{ariaMinText}.</div>',
            '<div id="{id}-ariaMaxText" class="' + Ext.baseCSSPrefix + 'hidden-clip">{ariaMaxText}.</div>',
            '<div id="{id}-ariaDisabledDaysText" class="' + Ext.baseCSSPrefix + 'hidden-clip">{ariaDisabledDaysText}.</div>',
            '<div id="{id}-ariaDisabledDatesText" class="' + Ext.baseCSSPrefix + 'hidden-clip">{ariaDisabledDatesText}.</div>',
        '</div>',
        {
            firstInitial: function (value) {
                return Ext.picker.Date.prototype.getDayInitial(value);
            },
            isEndOfWeek: function (value) {
                // convert from 1 based index to 0 based
                // by decrementing value once.
                value--;
                var end = value % 7 === 0 && value !== 0;
                return end ? '</tr><tr role="row">' : '';
            },
            renderTodayBtn: function (values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.todayBtn.getRenderTree(), out);
            },
            renderMonthBtn: function (values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.monthBtn.getRenderTree(), out);
            },
            renderTimeField: function (values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.TimeContainer.getRenderTree(), out);
            }
        }
    ],
    privates: {
        // Do the job of a container layout at this point even though we are not a Container.
        // TODO: Refactor as a Container.
        finishRenderChildren: function () {
            var me = this;

            me.callParent();
            me.TimeContainer.finishRender();
        }
    }
});

Ext.define('Fm.ux.form.DateTimeField', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.datetimefield',
    requires: ['Ext.form.field.Date'],
    format: 'Y-m-d H:i:s',
    createPicker: function () {
        var me = this,
            format = Ext.String.format,
            pickerConfig;

        pickerConfig = {
            pickerField: me,
            floating: true,
            preventRefocus: false,
            hidden: true,
            minDate: me.minValue,
            maxDate: me.maxValue,
            disabledDatesRE: me.disabledDatesRE,
            disabledDatesText: me.disabledDatesText,
            ariaDisabledDatesText: me.ariaDisabledDatesText,
            disabledDays: me.disabledDays,
            disabledDaysText: me.disabledDaysText,
            ariaDisabledDaysText: me.ariaDisabledDaysText,
            format: me.format,
            showToday: false,//me.showToday,
            startDay: me.startDay,
            minText: format(me.minText, me.formatDate(me.minValue)),
            ariaMinText: format(me.ariaMinText, me.formatDate(me.minValue, me.ariaFormat)),
            maxText: format(me.maxText, me.formatDate(me.maxValue)),
            ariaMaxText: format(me.ariaMaxText, me.formatDate(me.maxValue, me.ariaFormat)),
            listeners: {
                scope: me,
                select: me.onSelect
            },
            keyNavConfig: {
                esc: function () {
                    me.inputEl.focus();
                    me.collapse();
                }
            }
        };

        me.originalCollapse = me.collapse;
        pickerConfig.listeners.show = {
            fn: function () {
                this.picker.el.on({
                    mousedown: function () {
                        this.collapse = Ext.emptyFn;
                    },
                    mouseup: function () {
                        this.collapse = this.originalCollapse;
                    },
                    scope: this
                });
            }
        }
        // Create floating Picker BoundList. It will acquire a floatParent by looking up
        // its ancestor hierarchy (Pickers use their pickerField property as an upward link)
        // for a floating component.
        me.picker = new Fm.ux.form.TimePicker(pickerConfig);
        return me.picker;
    }
});