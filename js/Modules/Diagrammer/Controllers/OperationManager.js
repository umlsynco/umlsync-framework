define(['marionette',
        'Views/framework'
    ],
    function (Marionette, Framework) {
        var ApplicationManager = Marionette.Controller.extend({
            initialize: function (options) {
                // start - umlsync
                this.queueLimit = 24; // Limit for count of operations.
                this.diagram = options.diagram;
                this.queue = new Array();
                this.revertedQueue = new Array();
                this.started = false;
                this.count = 0;
                this.processing = false;
                // skip all operations report
                // during diagram loading
                this.skipall = true;
                // Position which is equal to original
                this.savedPosition = 0;
                // last reported modificatoin state
                this.lastReportedState = false;

                // end-umlsync

                var manager = this;
                this.diagram = options.diagram; // Reference on diagram
                this.diagram.on("update", function () {
                    manager.onChange(arguments);
                });

                // Operation manager specific

                // Cached removed models
                this.removedElements = new Array();
                this.removedConnectors = new Array();

                // Stack of operations
                this.oprationsStack = new Array();
                // Current position in stack
                this.position = 0;
            },
            onChange: function (context) {
				// Save the context ???
				// and trigger modified if needed
                this.trigger("modified", true);
            },
            // Ctrl-Z
            undo: function () {
            },
            // Ctrl-Y
            redo: function () {
            },

            // =========================================== UMLSYNC
            //
            // Trigger start reporting after diagram load completion
            //
            startReporting: function () {
                this.skipall = false;
            },
            //
            // @return true if position was not equal to the last saved position
            //
            _hasModification: function (newReported) {
                // New state overwite the stable state
                if (newReported && this.queue.length == this.savedPosition) {
                    this.savedPosition = -1;
                }
                return (this.savedPosition == -1) || (this.queue.length != this.savedPosition);
            },
            //
            // Trigger hasModificationChange event
            //
            notifyObserver: function (newReported) {
                // report state change
                if (this.lastReportedState != this._hasModification(newReported)) {
                    this.lastReportedState = this._hasModification(newReported);
                    this.diagram._onModified(this.lastReportedState);
                }
            },
            //
            // ????????????
            //
            saveNewPosition: function () {
                this.savedPosition = this.queue.length;
                this.lastReportedState = false;
            },
            //
            // Start multiple operation report
            //
            startTransaction: function () {
                // if it is diagram load state, then skip all notifications
                if (this.skipall)
                    return;
                // depth count to prevent unexpected exit from reporting
                this.count++;
                if (this.started) {
                    return;
                }
                this.started = true;
                this.working = {};
                this.working_stack = new Array();
            },
            //
            // On multiple action complete
            //
            stopTransaction: function () {
                // diagram load
                if (this.skipall)
                    return;

                // ASSERT to check transaction has been started
                if (!this.started) {
                    alert("Transaction was not started");
                    return;
                }

                this.count--;

                // check the depth before transaction finalization
                if (this.count > 0) {
                    return;
                }

                // Commit all changes
                this._commitQueue();

                this.started = false;
            },
            //
            // Commit all reports to the queue
            //
            _commitQueue: function () {
                if (Object.keys(this.working).length > 0) {
                    this.queue.push({step: this.working, stack: this.working_stack}); // Add to the queue
                    var q = this.revertedQueue.splice(0, this.revertedQueue.length); // Revert queue
                    for (var s in q) {
                        var step = q[s].step;
                        for (var sub in step) {
                            // Check if some added element was reverted
                            if (step[sub]["add"]) {
                                var start = step[sub]["add"]["start"];
                                if (start) {
                                    this.diagram.removeElement(sub); // FINAL REMOVE, NOT RESTORABLE
                                } else {
                                    // FINAL REMOVE, NOT RESTORABLE
                                    if (start != undefined) this.diagram.removeConnectorById(sub);
                                }
                            }
                        }
                    }
                }

                this.notifyObserver(true);

                while (this.queue.length > this.queueLimit) {
                    var item = this.queue.shift();
                    var step = item.step;
                    for (var sub in step) {
                        // Check if some added element was reverted
                        if (step[sub]["remove"]) {
                            var start = step[sub]["remove"]["start"];
                            if (start) {
                                this.diagram.removeElement(sub); // FINAL REMOVE, NOT RESTORABLE
                            } else {
                                // FINAL REMOVE, NOT RESTORABLE
                                if (start != undefined)
                                    this.diagram.removeConnectorById(sub);
                            }
                        }
                    }
                    delete step;
                    delete item;
                    // It is not possible to return to original state
                    // if too many operations were done
                    if (this.savedPosition != -1)
                        this.savedPosition--;
                }

                delete this.working; // Clean the current working copy !!!
                delete this.working_stack; // Clean stack too
            },
            /*
             * type : drag, resize, remove, add
             * euid : element unique id
             * options: element options which changed
             */
            reportStart: function (type, euid, options) {
                if (this.skipall)
                    return;

                if (this.processing)
                    return;
                this.working[euid] = this.working[euid] || {};
                this.working[euid][type] = this.working[euid][type] || {};
                this.working[euid][type]["start"] = $.extend({}, this.working[euid][type]["start"], options);
                this.working_stack.push({id: euid, type: type});
            },
            reportStop: function (type, euid, options) {
                if (this.skipall)
                    return;

                if (this.processing)
                    return;
                this.working[euid] = this.working[euid] || {};
                this.working[euid][type] = this.working[euid][type] || {};
                this.working[euid][type]["stop"] = $.extend({}, this.working[euid][type]["stop"], options);
            },
            reportShort: function (type, euid, before, after) {
                if (this.skipall)
                    return;

                if (this.processing)
                    return;
                $.log("reportShort: " + euid + " OP " + type);
                this.working_stack = this.working_stack || new Array();
                this.working = this.working || {};
                this.working[euid] = this.working[euid] || {};
                this.working[euid][type] = this.working[euid][type] || {};
                this.working[euid][type]["stop"] = this.working[euid][type]["stop"] || after;
                this.working[euid][type]["start"] = this.working[euid][type]["start"] || before; // Prevent options overwrite

                this.working_stack.push({id: euid, type: type});

                // Push the result if it is not transaction
                if (!this.started) {
                    this._commitQueue();
                }
            },
            revertOperation: function () {
                if (this.skipall)
                    return;

                if (this.queue.length == 0) {
                    return; // nothing to revert !!!
                }

                function _getMethodName(prefix, string) {
                    return prefix + string.charAt(0).toUpperCase() + string.slice(1);
                }

                this.processing = true;

                var item = this.queue.pop();
                if (item) {
                    this.revertedQueue.push(item);

                    var op = item.step;

                    for (var o = item.stack.length - 1; o >= 0; --o) { // elements
                        var i = item.stack[o].id; // euid

                        var e = this.diagram.elements[i]; // it could be element or connector
                        if (e == undefined) e = this.diagram.connectors[i];

                        var j = item.stack[o].type;
                        { // types of operation
                            var start = op[i][j]["start"];
                            if (j == "remove") {
                                this.diagram.restoreItem(i);
                            } else if (j == "add") {
                                if (start) {
                                    this.diagram.removeElement(i);
                                } else {
                                    this.diagram.removeConnectorById(i);
                                }
                            }
                            else if (j == "option") {// CSS
                                e._setOptions(start); // revert to original state
                            }
                            else if (j == "recon") {// CSS
                                e.from = start.fromId;
                                e.toId = start.toId;
                            }
                            else if (j == "drop") {// CSS
                                if (e) {
                                    if (start) {
                                        var prev = this.diagram.elements[start];
                                        prev._dropped[i] = i;
                                    }
                                    if (op[i][j]["stop"]) {
                                        var next = this.diagram.elements[op[i][j]["stop"]]
                                        delete next._dropped[i];
                                    }
                                }
                            }
                            else if (j[0] == '+') {  // ADD
                                var f = j.substr(1, j.length - 1),
                                    u = _getMethodName("rm", f);   // rm is oposite for add
                                if (e[u]) {
                                    e[u](start);
                                } else { // No method for item processing
                                    f += 's';
                                    var tmp = e[f].splice(start.idx, 1);
                                    delete tmp;
                                }
                            }
                            else if (j[0] == '-') {  // REMOVE
                                var f = j.substr(1, j.length - 1),
                                    u = _getMethodName("add", f);   // rm is oposite for add
                                if (e[u]) {
                                    e[u](start);
                                } else {
                                    e[f + 's'].splice(start.idx, 0, start.value);
                                }
                            }
                            else if (j[0] == '#') {  // DRAGGABLE
                                var f = j.substr(1, j.length - 1),
                                    u = _getMethodName("move", f);

                                if (e[u]) {
                                    e[u](start);
                                } else {
                                    if (start.idx) {
                                        e[f + 's'][start.idx] = start.value;
                                    } else {
                                        $("#" + i + " " + j).css({left: start.left, top: start.top});
                                    }
                                }
                            }
                            else if (j[0] == '%') {  // SORTABLE
                                var f = j.substr(1, j.length - 1),
                                    u = _getMethodName("move", f);   // up/down item
                                var stop = op[i][j]["stop"];
                                if (e[u]) {
                                    e[u](start, stop);
                                }
                            }
                            else if (j[0] == '~') {  // EDITABLE
                                var f = j.substr(1, j.length - 1);
                                if (start.idx) {
                                    e[f][start.idx] = start.value;
                                } else {
                                    $("#" + i + " #" + f).html(start);
                                    if (e) e.options[f] = start; // for connector's labels the "e" variable could be undefined !!!
                                }
                            }
                        }
                    }
                    this.diagram.draw();
                }
                this.processing = false;

                this.notifyObserver(false);
            },
            repeatOperation: function () {
                if (this.skipall)
                    return;

                this.processing = true;
                var item = this.revertedQueue.pop();

                function _getMethodName(prefix, string) {
                    return prefix + string.charAt(0).toUpperCase() + string.slice(1);
                }

                if (item) {
                    this.queue.push(item);
                    var op = item.step;
                    for (var o = item.stack.length - 1; o >= 0; --o) { // elements
                        var i = item.stack[o].id; // euid

                        var e = this.diagram.elements[i];
                        if (e == undefined) e = this.diagram.connectors[i];

                        var j = item.stack[o].type;
                        var stop = op[i][j]["stop"];
                        var start = op[i][j]["start"];
                        { // types of operation
                            if (j == "remove") {
                                if (start) {
                                    this.diagram.removeElement(i);
                                } else {
                                    if (start != undefined)
                                        this.diagram.removeConnectorById(i);
                                }
                            } else if (j == "add") {
                                this.diagram.restoreItem(i);
                            } else if (j == "option") {
                                e._setOptions(stop); // revert to original state
                            }
                            else if (j == "recon") {// CSS
                                e.from = stop.fromId;
                                e.toId = stop.toId;
                            }
                            else if (j == "drop") {// CSS
                                if (e) {
                                    if (stop) {
                                        var prev = this.diagram.elements[stop];
                                        prev._dropped[i] = i;
                                    }
                                    if (op[i][j]["start"]) {
                                        var next = this.diagram.elements[op[i][j]["start"]]
                                        delete next._dropped[i];
                                    }
                                }
                            }
                            else if (j[0] == '+') {
                                var f = j.substr(1, j.length - 1),
                                    u = _getMethodName("add", f);   // rm is oposite for add
                                if (e[u]) {
                                    e[u](start);
                                } else {
                                    e[f + 's'].splice(stop.idx, 0, stop.value);
                                }
                            } else if (j[0] == '-') {
                                var f = j.substr(1, j.length - 1),
                                    u = _getMethodName("rm", f);   // rm is oposite for add
                                if (e[u]) {
                                    e[u](start);
                                } else { // No method for item processing
                                    f += 's';
                                    //var item = e[f].splice(start.idx, 1);
                                }
                            } else if (j[0] == '#') {
                                var f = j.substr(1, j.length - 1),
                                    u = _getMethodName("move", f);

                                if (e[u]) {
                                    e[u](stop);
                                } else {
                                    if (stop.idx) {
                                        e[f + 's'][stop.idx] = stop.value;
                                    } else {
                                        $("#" + i + " " + j).css({left: stop.left, top: stop.top});
                                    }
                                }
                            }
                            else if (j[0] == '%') {  // SORTABLE
                                var f = j.substr(1, j.length - 1),
                                    u = _getMethodName("move", f);   // up/down item
                                var start = op[i][j]["start"];
                                if (e[u]) {
                                    e[u](stop, start);
                                }
                            }
                            else if (j[0] == '~') {
                                var f = j.substr(1, j.length - 1);
                                if (stop.idx) {
                                    if (e[f]) {
                                        e[f][stop.idx] = stop.value;
                                    } else {
                                        $("#" + i + " #" + f).html(stop.value);
                                    }
                                } else {
                                    $("#" + i + " #" + f).html(stop);
                                    if (e) e.options[f] = stop;
                                }
                            }
                        }
                    }
                }
                this.processing = false;
                this.diagram.draw();

                this.notifyObserver(false);
            }

        });
        return ApplicationManager;
    }
);




