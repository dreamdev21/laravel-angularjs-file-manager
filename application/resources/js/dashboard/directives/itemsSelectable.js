'use strict';

angular.module('pixie.dashboard')

.directive('itemsSelectable', ['$rootScope', 'selectedItems', function($rootScope, selectedItems) {

    $.widget('ui.itemsSelectable', $.ui.mouse, {
        options: {
            el: null,
            tolerance: 'touch'
        },
        _mouseStart: function(e) {
            this.box.appendTo(this.options.el.find('.user-items'));

            this.opos = [e.pageX, e.pageY];

            this.box.css({
                left: e.pageX,
                top: e.pageY,
                width: 0,
                height: 0
            });

            this.items.each(function() {
                var $this = $(this),
                    pos = $this.offset();
                $.data(this, 'selectable-item', {
                    element: this,
                    $element: $this,
                    left: pos.left,
                    top: pos.top,
                    right: pos.left + $this.outerWidth(),
                    bottom: pos.top + $this.outerHeight(),
                    startselected: false,
                    selected: $this.hasClass('selected'),
                    selecting: $this.hasClass('selecting'),
                    unselecting: $this.hasClass('unselecting')
                });
            });

            this.items.filter('.selected').each(function() {
                var selectee = $.data(this, 'selectable-item');
                selectee.startselected = true;
                if (!event.metaKey && !event.ctrlKey) {
                    selectee.$element.removeClass('selected');
                    selectee.selected = false;
                    selectee.$element.addClass('unselecting');
                    selectee.unselecting = true;
                }
            });
        },
        _mouseDrag: function(e) {
            var tmp,
                options = this.options,
                x1 = this.opos[0],
                y1 = this.opos[1],
                x2 = e.pageX,
                y2 = e.pageY;

            if (x1 > x2) { tmp = x2; x2 = x1; x1 = tmp; }
            if (y1 > y2) { tmp = y2; y2 = y1; y1 = tmp; }
            this.box.css({ left: x1 - this.options.leftOffset, top: y1 - this.options.topOffset, width: x2 - x1, height: y2 - y1 });

            this.items.each(function() {
                var selectee = $.data(this, 'selectable-item'),
                    hit = false;

                if (options.tolerance === "touch") {
                    hit = ( !(selectee.left > x2 || selectee.right < x1 || selectee.top > y2 || selectee.bottom < y1) );
                } else if (options.tolerance === "fit") {
                    hit = (selectee.left > x1 && selectee.right < x2 && selectee.top > y1 && selectee.bottom < y2);
                }

                if (hit) {
                    // SELECT
                    if (selectee.selected) {
                        selectee.$element.removeClass('selected');
                        selectee.selected = false;
                    }
                    if (selectee.unselecting) {
                        selectee.$element.removeClass('selecting');
                        selectee.unselecting = false;
                    }
                    if (!selectee.selecting) {
                        selectee.$element.addClass('selecting');
                        selectee.selecting = true;
                    }
                } else {
                    // UNSELECT
                    if (selectee.selecting) {
                        if ((e.metaKey || e.ctrlKey) && selectee.startselected) {
                            selectee.$element.removeClass('selecting');
                            selectee.selecting = false;
                            selectee.$element.addClass('selected');
                            selectee.selected = true;
                        } else {
                            selectee.$element.removeClass('selecting');
                            selectee.selecting = false;
                            if (selectee.startselected) {
                                selectee.$element.addClass('unselecting');
                                selectee.unselecting = true;
                            }
                        }
                    }
                    if (selectee.selected) {
                        if (!e.metaKey && !e.ctrlKey && !selectee.startselected) {
                            selectee.$element.removeClass('selected');
                            selectee.selected = false;

                            selectee.$element.addClass('unselecting');
                            selectee.unselecting = true;
                        }
                    }
                }
            });

            return false;
        },
        _mouseStop: function() {
            this.box.remove();

            $('.unselecting', this.element[0]).each(function() {
                var selectee = $.data(this, "selectable-item");
                selectee.$element.removeClass('unselected');
                selectee.unselecting = false;
                selectee.startselected = false;
                selectedItems.deselect(selectee.element.dataset.id, selectee.element.dataset.type);
            });

            var selected = $('.selecting', this.element[0]);

            $rootScope.$apply(function() {
                selected.each(function() {
                    var selectee = $.data(this, "selectable-item");
                    selectee.$element.removeClass('selecting').addClass('selected');
                    selectee.selecting = false;
                    selectee.selected = true;
                    selectee.startselected = true;
                    selectedItems.set(selectee.element.dataset.id, selectee.element.dataset.type);
                });
            });
        },
        _mouseCapture: function() {
            this.box = $('<div class="select-box"></div>');
            this.items = this.options.el.find('.user-item');

            this.items.each(function() {
                $(this).removeClass('selected');
                selectedItems.deselect(this.dataset.id, this.dataset.type);
            });

            return true;
        },
        _init: function() {
            return this._mouseInit();
        },
        _destroy: function() {
            return this._mouseDestroy();
        }
    });

    return {
        link: function($scope, el) {
            el.itemsSelectable({
                el: el,
                leftOffset: $('#left-col').width(),
                topOffset: $('.navbar').height()
            })
        }
    };
}]);
