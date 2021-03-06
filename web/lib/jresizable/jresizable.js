﻿(function ($, window, document, undefined) {
    var EVENT_NAMESPACE = ".jresizable_event",
        CACHE_KEY = "jresizable_cache";

    //销毁
    function destroy($elems) {
        if (!$elems || $elems.length <= 0) return;

        $elems.each(function () {
            var $node = $(this).find(".resizable-node").first();
            if (!$node || $node.length <= 0) return true;

            var cache = $.data($node.get(0), CACHE_KEY);
            if (!cache) return true;

            var edge = cache.edge,
                position = $(this).position(),
                width = $(this).outerWidth() - 2 * edge,
                height = $(this).outerHeight() - 2 * edge;
            $node.removeClass("resizable-node").css({
                "position": "absolute",
                "left": position.left + edge,
                "top": position.top + edge,
                "width": width,
                "height": height
            });
            $node.unwrap();
        });
    }

    var Resizable = function (elements, options) {
        this.$elements = elements;
        this.options = options;
    };

    Resizable.prototype = {
        init: function () {
            var that = this;
            return that.$elements.each(function (index) {
                var cache = that.cacheData(this);
                if (!cache.disabled) {
                    that.handle(this);
                }
            });
        },
        cacheData: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY);
            if (!cache) {
                cache = $.extend({}, $.fn.jresizable.defaults, that.options || {});
            } else {
                cache = $.extend(cache, that.options || {});
            }
            $(element).parent().off(EVENT_NAMESPACE);
            $(element).off(EVENT_NAMESPACE);
            $(document).off(EVENT_NAMESPACE);
            $.data(element, CACHE_KEY, cache);
            return cache;
        },
        handle: function (element) {
            var that = this,
                $parent = $(element).parent(),
                cache = $.data(element, CACHE_KEY);
            if (cache.mode === "region") {
                if (!$parent.is(".resizable")) {
                    that.renderDOM(element);
                }
            } else if (cache.mode === "single") {
                if (!cache.multi) {
                    destroy(cache.$container.find(".resizable").not($parent));
                }
                if ($parent.is(".resizable")) {
                    destroy($parent);
                } else {
                    that.renderDOM(element);
                }
            } else {
            }
        },
        renderDOM: function (element) {
            var that = this,
                cache = $.data(element, CACHE_KEY),
                edge = cache.edge,
                color = cache.color,
                $resizable = $('<div class="resizable"></div>');
            $resizable.css({
                "position": "absolute",
                "left": $(element).position().left - edge,
                "top": $(element).position().top - edge,
                "z-index": $(element).css("z-index"),
                "width": $(element).outerWidth() + 2 * edge,
                "height": $(element).outerHeight() + 2 * edge,
                "border": edge + "px dotted " + color
            });
            $(element).wrap($resizable);
            $(element).addClass("resizable-node").css({
                "position": "absolute",
                "left": 0,
                "top": 0,
                "width": "100%",
                "height": "100%"
            });
            that.bindEvents($(element).parent(), element);
        },
        bindEvents: function ($resizable, element) {
            var that = this;

            $resizable.bind("mousemove" + EVENT_NAMESPACE, {target: $resizable, element: element}, function (event) {
                if ($.fn.jresizable.isResizing) return;

                var target = event.data.target,
                    direction = that.getDirection(event, event.data.element);
                if (!direction) {
                    target.css("cursor", "move");
                } else {
                    target.css("cursor", direction + "-resize");
                }
            });

            $resizable.bind("mouseleave" + EVENT_NAMESPACE, {target: $resizable}, function (event) {
                event.data.target.css("cursor", "");
            });

            $resizable.bind("mousedown" + EVENT_NAMESPACE, {target: $resizable, element: element}, function (event) {
                var target = event.data.target,
                    direction = that.getDirection(event, event.data.element);
                if (!direction) {
                    target.draggable("enable");
                    return;
                }
                target.draggable("disable");
                var attachData = {
                    element: event.data.element,
                    target: target,
                    direction: direction,
                    startLeft: that.getCssValue(target, "left"),
                    startTop: that.getCssValue(target, "top"),
                    left: that.getCssValue(target, "left"),
                    top: that.getCssValue(target, "top"),
                    startX: event.pageX,
                    startY: event.pageY,
                    startWidth: target.outerWidth(),
                    startHeight: target.outerHeight(),
                    width: target.outerWidth(),
                    height: target.outerHeight()
                };

                $(document).bind("mousedown" + EVENT_NAMESPACE, attachData, function (event) {
                    $.fn.jresizable.isResizing = true;
                    var cache = $.data(event.data.element, CACHE_KEY);
                    if (cache.onStart) {
                        cache.onStart.call(event.data.target, event);
                    }
                });

                $(document).bind("mousemove" + EVENT_NAMESPACE, attachData, function (event) {
                    that.resize(event);
                    that.applyResize(event);
                    var cache = $.data(event.data.element, CACHE_KEY);
                    if (cache.onResize.call(event.data.target, event) !== false) {
                        that.applyResize(event);
                    }
                });

                $(document).bind("mouseup" + EVENT_NAMESPACE, attachData, function (event) {
                    $.fn.jresizable.isResizing = false;
                    that.resize(event);
                    that.applyResize(event);
                    var cache = $.data(event.data.element, CACHE_KEY);
                    if (cache.onStop) {
                        cache.onStop.call(event.data.target, event);
                    }
                    $(document).off(EVENT_NAMESPACE);
                });
            });

            //拖动功能，此处存在draggable插件的依赖
            var cache = $.data(element, CACHE_KEY),
                position = $resizable.position();
            $resizable.draggable({
                cancel: ".title",
                start: function (event, ui) {
                    position = ui.position;
                },
                drag: function (event, ui) {
                    var left = ui.position.left - position.left,
                        top = ui.position.top - position.top,
                        $elems = cache.$container.find(".resizable").not($resizable);
                    $elems.each(function () {
                        var temp = $(this).position();
                        $(this).css({
                            "left": temp.left + left,
                            "top": temp.top + top
                        });
                    });
                    position = ui.position;
                }
            });
        },
        getDirection: function (event, element) {
            var direction = "",
                target = event.data.target,
                offset = target.offset(),
                width = target.outerWidth(),
                height = target.outerHeight(),
                edge = $.data(element, CACHE_KEY).edge;
            if (event.pageY > offset.top && event.pageY < offset.top + edge) {
                direction += "n";
            } else if (event.pageY < offset.top + height && event.pageY > offset.top + height - edge) {
                direction += "s";
            }
            if (event.pageX > offset.left && event.pageX < offset.left + edge) {
                direction += "w";
            } else if (event.pageX < offset.left + width && event.pageX > offset.left + width - edge) {
                direction += "e";
            }
            var handles = $.fn.jresizable.defaults.handles.split(",");
            for (var i = 0; i < handles.length; i++) {
                var handle = handles[i].replace(/(^\s*)|(\s*$)/g, "");
                if (handle === "all" || handle === direction) {
                    return direction;
                }
            }
            return "";
        },
        getCssValue: function ($resizable, key) {
            var value = parseInt($resizable.css(key));
            if (isNaN(value)) return 0;
            else return value;
        },
        resize: function (event) {
            var resizeData = event.data;
            if (resizeData.direction.indexOf("e") !== -1) {
                resizeData.width = resizeData.startWidth + event.pageX - resizeData.startX;
            }
            if (resizeData.direction.indexOf("s") !== -1) {
                resizeData.height = resizeData.startHeight + event.pageY - resizeData.startY;
            }
            if (resizeData.direction.indexOf("w") !== -1) {
                resizeData.width = resizeData.startWidth - event.pageX + resizeData.startX;
                resizeData.left = resizeData.startLeft + resizeData.startWidth - resizeData.width;
            }
            if (resizeData.direction.indexOf("n") !== -1) {
                resizeData.height = resizeData.startHeight - event.pageY + resizeData.startY;
                resizeData.top = resizeData.startTop + resizeData.startHeight - resizeData.height;
            }
        },
        applyResize: function (event) {
            var resizeData = event.data;
            resizeData.target.css({
                "left": resizeData.left,
                "top": resizeData.top,
                "width": resizeData.width,
                "height": resizeData.height
            });
        }
    };

    $.fn.jresizable = function (options) {
        if (typeof options === "string") {
            var args = Array.prototype.slice.call(arguments, 1);
            return $.fn.jresizable.methods[options](this, args);
        }
        return new Resizable(this, options).init();
    };

    $.fn.jresizable.defaults = {
        disabled: false,
        mode: "region",//"region"表示框选模式，"single"表示单击模式
        multi: false,
        $container: $("#workspace"),
        handles: "n,e,s,w,ne,se,sw,nw,all",
        color: "gray",
        edge: 5,
        onStart: function (e) {
        },
        onResize: function (e) {
        },
        onStop: function (e) {
        }
    };

    $.fn.jresizable.methods = {
        options: function (elements) {
            return $.data(elements[0], CACHE_KEY);
        },
        enable: function (elements) {
            return $(elements).each(function () {
                $(this).jresizable({disabled: false});
            });
        },
        disable: function (elements) {
            return $(elements).each(function () {
                $(this).jresizable({disabled: true});
            });
        },
        destroy: function (elements) {
            $(elements).each(function () {
                var $parent = $(this).parent();
                if ($parent.is(".resizable")) {
                    destroy($parent);
                }
            });
        }
    };

    $.fn.jresizable.isResizing = false;

})(jQuery, window, document);