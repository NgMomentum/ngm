
/**
 * @ngdoc module
 * @name material.components.virtualRepeat
 */

/*global
    msos: false,
    jQuery: false,
    Modernizr: false,
    _: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.v111.ui.repeater");
msos.require("ng.material.v111.core");

ng.material.v111.ui.repeater.version = new msos.set_version(17, 1, 5);


ng.material.v111.ui.repeater.NUM_EXTRA = 3;

function VirtualRepeatContainerController($$rAF, $mdUtil, $mdConstant, $parse, $rootScope, $window, $scope, $element, $attrs) {
    "use strict";

    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.$element = $element;
    this.$attrs = $attrs;

    this.size = 0;
    this.scrollSize = 0;
    this.scrollOffset = 0;
    this.horizontal = this.$attrs.hasOwnProperty('mdOrientHorizontal');
    this.repeater = null;
    this.autoShrink = this.$attrs.hasOwnProperty('mdAutoShrink');
    this.autoShrinkMin = parseInt(this.$attrs.mdAutoShrinkMin, 10) || 0;
    this.originalSize = null;
    this.offsetSize = parseInt(this.$attrs.mdOffsetSize, 10) || 0;
    this.oldElementSize = null;
    this.maxElementPixels = $mdConstant.ELEMENT_MAX_PIXELS;

    if (this.$attrs.mdTopIndex) {

        this.bindTopIndex = $parse(this.$attrs.mdTopIndex);
        this.topIndex = this.bindTopIndex(this.$scope);

        if (!angular.isDefined(this.topIndex)) {
            this.topIndex = 0;
            this.bindTopIndex.assign(this.$scope, 0);
        }

        this.$scope.$watch(
            this.bindTopIndex,
            angular.bind(
                this,
                function (newIndex) {
                    if (newIndex !== this.topIndex) {
                        this.scrollToIndex(newIndex);
                    }
                }
            )
        );
    } else {
        this.topIndex = 0;
    }

    this.scroller = $element[0].querySelector('.md-virtual-repeat-scroller');
    this.sizer = this.scroller.querySelector('.md-virtual-repeat-sizer');
    this.offsetter = this.scroller.querySelector('.md-virtual-repeat-offsetter');

    var boundUpdateSize = angular.bind(
            this,
            this.updateSize
        );

    $$rAF(
        angular.bind(
            this,
            function () {
                boundUpdateSize();

                var debouncedUpdateSize = $mdUtil.debounce(boundUpdateSize, 10, null, false),
                    jWindow = angular.element($window);

                if (!this.size) {
                    debouncedUpdateSize();
                }

                jWindow.on('resize', debouncedUpdateSize);

                $scope.$on(
                    '$destroy',
                    function () {
                        jWindow.off('resize', debouncedUpdateSize);
                    }
                );

                $scope.$emit('$md-resize-enable');
                $scope.$on('$md-resize', boundUpdateSize);
            }
        )
    );
}

VirtualRepeatContainerController.$inject = ['$$rAF', '$mdUtil', '$mdConstant', '$parse', '$rootScope', '$window', '$scope', '$element', '$attrs'];

VirtualRepeatContainerController.prototype.register = function (repeaterCtrl) {
    "use strict";

    this.repeater = repeaterCtrl;

    angular.element(
        this.scroller
    ).on(
        'scroll wheel touchmove touchend',
        angular.bind(this, this.handleScroll_)
    );
};

VirtualRepeatContainerController.prototype.isHorizontal = function () {
    "use strict";

    return this.horizontal;
};

VirtualRepeatContainerController.prototype.getSize = function () {
    "use strict";

    return this.size;
};

VirtualRepeatContainerController.prototype.setSize_ = function (size) {
    "use strict";

    var dimension = this.getDimensionName_();

    this.size = size;
    this.$element[0].style[dimension] = size + 'px';
};

VirtualRepeatContainerController.prototype.unsetSize_ = function () {
    "use strict";

    this.$element[0].style[this.getDimensionName_()] = this.oldElementSize;
    this.oldElementSize = null;
};

VirtualRepeatContainerController.prototype.updateSize = function () {
    "use strict";
    // If the original size is already determined, we can skip the update.
    if (this.originalSize) { return; }

    this.size = this.isHorizontal()
        ? this.$element[0].clientWidth
        : this.$element[0].clientHeight;

    this.handleScroll_();

    if (this.repeater) {
        this.repeater.containerUpdated();
    }
};

VirtualRepeatContainerController.prototype.getScrollSize = function () {
    "use strict";

    return this.scrollSize;
};

VirtualRepeatContainerController.prototype.getDimensionName_ = function () {
    "use strict";

    return this.isHorizontal() ? 'width' : 'height';
};

VirtualRepeatContainerController.prototype.sizeScroller_ = function (size) {
    "use strict";

    var dimension = this.getDimensionName_(),
        crossDimension = this.isHorizontal() ? 'height' : 'width',
        numChildren,
        sizerChild,
        i = 0;

    this.sizer.innerHTML = '';

    if (size < this.maxElementPixels) {
        this.sizer.style[dimension] = size + 'px';
    } else {
        this.sizer.style[dimension] = 'auto';
        this.sizer.style[crossDimension] = 'auto';

        // Divide the total size we have to render into N max-size pieces.
        numChildren = Math.floor(size / this.maxElementPixels);

        // Element template to clone for each max-size piece.
        sizerChild = document.createElement('div');
        sizerChild.style[dimension] = this.maxElementPixels + 'px';
        sizerChild.style[crossDimension] = '1px';

        for (i = 0; i < numChildren; i += 1) {
            this.sizer.appendChild(sizerChild.cloneNode(false));
        }

        sizerChild.style[dimension] = (size - (numChildren * this.maxElementPixels)) + 'px';
        this.sizer.appendChild(sizerChild);
    }
};

VirtualRepeatContainerController.prototype.autoShrink_ = function (size) {
    "use strict";

    var shrinkSize = Math.max(size, this.autoShrinkMin * this.repeater.getItemSize()),
        currentSize,
        _originalSize;

    if (this.autoShrink && shrinkSize !== this.size) {
        if (this.oldElementSize === null) {
            this.oldElementSize = this.$element[0].style[this.getDimensionName_()];
        }

        currentSize = this.originalSize || this.size;

        if (!currentSize || shrinkSize < currentSize) {

            if (!this.originalSize) {
                this.originalSize = this.size;
            }

            this.setSize_(shrinkSize);

        } else if (this.originalSize !== null) {

            this.unsetSize_();

            _originalSize = this.originalSize;

            this.originalSize = null;

            if (!_originalSize) { this.updateSize(); }

            this.setSize_(_originalSize || this.size);
        }

        this.repeater.containerUpdated();
    }
};

VirtualRepeatContainerController.prototype.setScrollSize = function (itemsSize) {
    "use strict";

    var size = itemsSize + this.offsetSize;

    if (this.scrollSize === size) { return; }

    this.sizeScroller_(size);
    this.autoShrink_(size);
    this.scrollSize = size;
};

VirtualRepeatContainerController.prototype.getScrollOffset = function () {
    "use strict";

    return this.scrollOffset;
};

VirtualRepeatContainerController.prototype.scrollTo = function (position) {
    "use strict";

    this.scroller[this.isHorizontal() ? 'scrollLeft' : 'scrollTop'] = position;
    this.handleScroll_();
};

VirtualRepeatContainerController.prototype.scrollToIndex = function (index) {
    "use strict";

    var itemSize = this.repeater.getItemSize(),
        itemsLength = this.repeater.itemsLength;

    if (index > itemsLength) {
        index = itemsLength - 1;
    }

    this.scrollTo(itemSize * index);
};

VirtualRepeatContainerController.prototype.resetScroll = function () {
    "use strict";

    this.scrollTo(0);
};


VirtualRepeatContainerController.prototype.handleScroll_ = function () {
    "use strict";

    var ltr = document.dir !== 'rtl' && document.body.dir !== 'rtl',
        offset,
        itemSize,
        numItems,
        transform,
        topIndex;

    if (!ltr && !this.maxSize) {
        this.scroller.scrollLeft = this.scrollSize;
        this.maxSize = this.scroller.scrollLeft;
    }

    offset = this.isHorizontal()
        ? (ltr ? this.scroller.scrollLeft : this.maxSize - this.scroller.scrollLeft)
        : this.scroller.scrollTop;

    if (offset === this.scrollOffset || offset > this.scrollSize - this.size) { return; }

    itemSize = this.repeater.getItemSize();

    if (!itemSize) { return; }

    numItems = Math.max(0, Math.floor(offset / itemSize) - ng.material.v111.ui.repeater.NUM_EXTRA);

    transform = (this.isHorizontal()
        ? 'translateX('
        : 'translateY(') + (!this.isHorizontal() || ltr
            ? (numItems * itemSize)
            : -(numItems * itemSize)) + 'px)';

    this.scrollOffset = offset;
    this.offsetter.style.webkitTransform = transform;
    this.offsetter.style.transform = transform;

    if (this.bindTopIndex) {

        topIndex = Math.floor(offset / itemSize);

        if (topIndex !== this.topIndex && topIndex < this.repeater.getItemCount()) {
            this.topIndex = topIndex;
            this.bindTopIndex.assign(this.$scope, topIndex);

            if (!this.$rootScope.$$phase) { this.$scope.$digest(); }
        }
    }

    this.repeater.containerUpdated();
};


function VirtualRepeatController($scope, $element, $attrs, $document, $rootScope, $$rAF, $mdUtil) {
    "use strict";

    this.$scope = $scope;
    this.$element = $element;
    this.$attrs = $attrs;
    this.$document = $document;
    this.$rootScope = $rootScope;
    this.$$rAF = $$rAF;

    this.onDemand = $mdUtil.parseAttributeBoolean($attrs.mdOnDemand);
    this.newStartIndex = 0;
    this.newEndIndex = 0;
    this.newVisibleEnd = 0;
    this.startIndex = 0;
    this.endIndex = 0;
    this.itemSize = $scope.$eval($attrs.mdItemSize) || null;

    this.isFirstRender = true;
    this.isVirtualRepeatUpdating_ = false;
    this.itemsLength = 0;
    this.unwatchItemSize_ = angular.noop;
    this.blocks = {};
    this.pooledBlocks = [];

    $scope.$on('$destroy', angular.bind(this, this.cleanupBlocks_));
}

VirtualRepeatController.$inject = ['$scope', '$element', '$attrs', '$document', '$rootScope', '$$rAF', '$mdUtil'];

VirtualRepeatController.prototype.link_ =
    function (container, transclude, repeatName, repeatListExpression, extraName) {
        "use strict";

        this.container = container;
        this.transclude = transclude;
        this.repeatName = repeatName;
        this.rawRepeatListExpression = repeatListExpression;
        this.extraName = extraName;
        this.sized = false;

        this.repeatListExpression = angular.bind(this, this.repeatListExpression_);

        this.container.register(this);
    };

VirtualRepeatController.prototype.cleanupBlocks_ = function () {
    "use strict";

    angular.forEach(this.pooledBlocks, function cleanupBlock(block) {
        block.element.remove();
    });
};

VirtualRepeatController.prototype.readItemSize_ = function () {
    "use strict";

    if (this.itemSize) {
        // itemSize was successfully read in a different asynchronous call.
        return;
    }

    this.items = this.repeatListExpression(this.$scope);
    this.parentNode = this.$element[0].parentNode;

    var block = this.getBlock_(0);

    if (!block.element[0].parentNode) {
        this.parentNode.appendChild(block.element[0]);
    }

    this.itemSize = block.element[0][
        this.container.isHorizontal() ? 'offsetWidth' : 'offsetHeight'
    ] || null;

    this.blocks[0] = block;
    this.poolBlock_(0);

    if (this.itemSize) {
        this.containerUpdated();
    }
};


function VirtualRepeatDirective($parse) {
    "use strict";

    return {
        controller: VirtualRepeatController,
        priority: 1000,
        require: ['mdVirtualRepeat', '^^mdVirtualRepeatContainer'],
        restrict: 'A',
        terminal: true,
        transclude: 'element',
        compile: function VirtualRepeatCompile($element_na, $attrs) {
            var expression = $attrs.mdVirtualRepeat,
                match = expression.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)\s*$/),
                repeatName = match[1],
                repeatListExpression = $parse(match[2]),
                extraName = $attrs.mdExtraName && $parse($attrs.mdExtraName);

            function VirtualRepeatLink($scope_na, $element_na, $attrs_na, ctrl, $transclude) {
                ctrl[0].link_(ctrl[1], $transclude, repeatName, repeatListExpression, extraName);
            }

            return VirtualRepeatLink;
        }
    };
}


function VirtualRepeatModelArrayLike(model) {
    "use strict";

    if (!_.isFunction(model.getItemAtIndex) ||
        !_.isFunction(model.getLength)) {
        throw new Error('When md-on-demand is enabled, the Object passed to md-virtual-repeat must implement ' +
            'functions getItemAtIndex() and getLength() ');
    }

    this.model = model;
}

VirtualRepeatModelArrayLike.prototype.$$includeIndexes = function (start, end) {
    "use strict";

    var i = 0;

    for (i = start; i < end; i += 1) {
        if (!this.hasOwnProperty(i)) {
            this[i] = this.model.getItemAtIndex(i);
        }
    }

    this.length = this.model.getLength();
};

VirtualRepeatController.prototype.repeatListExpression_ = function (scope) {
    "use strict";

    var repeatList = this.rawRepeatListExpression(scope),
        virtualList;

    if (this.onDemand && repeatList) {
        virtualList = new VirtualRepeatModelArrayLike(repeatList);
        virtualList.$$includeIndexes(this.newStartIndex, this.newVisibleEnd);
        return virtualList;
    }

    return repeatList;
};

VirtualRepeatController.prototype.containerUpdated = function () {
    "use strict";
    // If itemSize is unknown, attempt to measure it.
    if (!this.itemSize) {
        // Make sure to clean up watchers if we can (see #8178)
        if (this.unwatchItemSize_ && this.unwatchItemSize_ !== angular.noop) {
            this.unwatchItemSize_();
        }

        this.unwatchItemSize_ = this.$scope.$watchCollection(
            this.repeatListExpression,
            angular.bind(this, function (items) {
                if (items && items.length) {
                    this.readItemSize_();
                }
            }));

        if (!this.$rootScope.$$phase) { this.$scope.$digest(); }

        return;
    }

    if (!this.sized) {
        this.items = this.repeatListExpression(this.$scope);
    }

    if (!this.sized) {
        this.unwatchItemSize_();
        this.sized = true;
        this.$scope.$watchCollection(this.repeatListExpression,
            angular.bind(this, function (items, oldItems) {
                if (!this.isVirtualRepeatUpdating_) {
                    this.virtualRepeatUpdate_(items, oldItems);
                }
            }));
    }

    this.updateIndexes_();

    if (this.newStartIndex !== this.startIndex ||
        this.newEndIndex !== this.endIndex ||
        this.container.getScrollOffset() > this.container.getScrollSize()) {
        if (this.items instanceof VirtualRepeatModelArrayLike) {
            this.items.$$includeIndexes(this.newStartIndex, this.newEndIndex);
        }
        this.virtualRepeatUpdate_(this.items, this.items);
    }
};

VirtualRepeatController.prototype.getItemSize = function () {
    "use strict";

    return this.itemSize;
};

VirtualRepeatController.prototype.getItemCount = function () {
    "use strict";

    return this.itemsLength;
};

VirtualRepeatController.prototype.virtualRepeatUpdate_ = function (items, oldItems) {
    "use strict";

    this.isVirtualRepeatUpdating_ = true;

    var itemsLength = (items && items.length) ? items.length : 0,
        lengthChanged = false,
        previousScrollOffset,
        startIndex,
        i = 0,
        block,
        newStartBlocks = [],
        newEndBlocks = [],
        maxIndex;

    // If the number of items shrank, keep the scroll position.
    if (this.items && (itemsLength < this.items.length) && (this.container.getScrollOffset() !== 0)) {

        this.items = items;

        previousScrollOffset = this.container.getScrollOffset();

        this.container.resetScroll();
        this.container.scrollTo(previousScrollOffset);
    }

    if (itemsLength !== this.itemsLength) {
        lengthChanged = true;
        this.itemsLength = itemsLength;
    }

    this.items = items;

    if (items !== oldItems || lengthChanged) {
        this.updateIndexes_();
    }

    this.parentNode = this.$element[0].parentNode;

    if (lengthChanged) {
        this.container.setScrollSize(itemsLength * this.itemSize);
    }

    if (this.isFirstRender) {
        this.isFirstRender = false;

        startIndex = this.$attrs.mdStartIndex
            ? this.$scope.$eval(this.$attrs.mdStartIndex)
            : this.container.topIndex;

        this.container.scrollToIndex(startIndex);
    }

    // Detach and pool any blocks that are no longer in the viewport.
    Object.keys(this.blocks).forEach(function (blockIndex) {
        var index = parseInt(blockIndex, 10);

        if (index < this.newStartIndex || index >= this.newEndIndex) {
            this.poolBlock_(index);
        }
    }, this);

    this.browserCheckUrl = false;

    // Collect blocks at the top.
    for (i = this.newStartIndex; i < this.newEndIndex && this.blocks[i] == null; i += 1) {        // leave as is (null or undefined?)
        block = this.getBlock_(i);
        this.updateBlock_(block, i);
        newStartBlocks.push(block);
    }

    // Update blocks that are already rendered.
    for (i; this.blocks[i] != null; i += 1) {        // leave as is (null or undefined?)
        this.updateBlock_(this.blocks[i], i);
    }

    maxIndex = i - 1;

    // Collect blocks at the end.
    for (i; i < this.newEndIndex; i += 1) {
        block = this.getBlock_(i);
        this.updateBlock_(block, i);
        newEndBlocks.push(block);
    }

    // Attach collected blocks to the document.
    if (newStartBlocks.length) {
        this.parentNode.insertBefore(
            this.domFragmentFromBlocks_(newStartBlocks),
            this.$element[0].nextSibling
        );
    }
    if (newEndBlocks.length) {
        this.parentNode.insertBefore(
            this.domFragmentFromBlocks_(newEndBlocks),
            this.blocks[maxIndex] && this.blocks[maxIndex].element[0].nextSibling
        );
    }

    this.startIndex = this.newStartIndex;
    this.endIndex = this.newEndIndex;

    this.isVirtualRepeatUpdating_ = false;
};

VirtualRepeatController.prototype.getBlock_ = function (index) {
    "use strict";

    if (this.pooledBlocks.length) {
        return this.pooledBlocks.pop();
    }

    var block;

    this.transclude(
        angular.bind(
            this,
            function (clone, scope) {
                block = {
                    'element': clone,
                    'new': true,
                    'scope': scope
                };
    
                this.updateScope_(scope, index);
                this.parentNode.appendChild(clone[0]);
            }
        )
    );

    return block;
};

VirtualRepeatController.prototype.updateBlock_ = function (block, index) {
    "use strict";

    this.blocks[index] = block;

    if (!block['new'] && (block.scope.$index === index && block.scope[this.repeatName] === this.items[index])) {
        return;
    }

    block['new'] = false;

    // Update and digest the block's scope.
    this.updateScope_(block.scope, index);

    if (!this.$rootScope.$$phase) {
        block.scope.$digest();
    }
};

VirtualRepeatController.prototype.updateScope_ = function (scope, index) {
    "use strict";

    scope.$index = index;
    scope[this.repeatName] = this.items && this.items[index];

    if (this.extraName) { scope[this.extraName(this.$scope)] = this.items[index]; }
};

VirtualRepeatController.prototype.poolBlock_ = function (index) {
    "use strict";

    this.pooledBlocks.push(this.blocks[index]);
    this.parentNode.removeChild(this.blocks[index].element[0]);

    delete this.blocks[index];
};

VirtualRepeatController.prototype.domFragmentFromBlocks_ = function (blocks) {
    "use strict";

    var fragment = this.$document[0].createDocumentFragment();

    blocks.forEach(function (block) {
        fragment.appendChild(block.element[0]);
    });

    return fragment;
};

VirtualRepeatController.prototype.updateIndexes_ = function () {
    "use strict";

    var itemsLength = this.items ? this.items.length : 0,
        containerLength = Math.ceil(this.container.getSize() / this.itemSize);

    this.newStartIndex = Math.max(0, Math.min(
        itemsLength - containerLength,
        Math.floor(this.container.getScrollOffset() / this.itemSize)));

    this.newVisibleEnd = this.newStartIndex + containerLength + ng.material.v111.ui.repeater.NUM_EXTRA;
    this.newEndIndex = Math.min(itemsLength, this.newVisibleEnd);
    this.newStartIndex = Math.max(0, this.newStartIndex - ng.material.v111.ui.repeater.NUM_EXTRA);
};

function virtualRepeatContainerTemplate($element) {
    "use strict";

    return  '<div class="md-virtual-repeat-scroller">' +
            '<div class="md-virtual-repeat-sizer"></div>' +
            '<div class="md-virtual-repeat-offsetter">' +
            $element[0].innerHTML +
            '</div></div>';
}

function VirtualRepeatContainerDirective() {
    "use strict";

    return {
        controller: VirtualRepeatContainerController,
        template: virtualRepeatContainerTemplate,
        compile: function virtualRepeatContainerCompile($element, $attrs) {
            $element
                .addClass('md-virtual-repeat-container')
                .addClass($attrs.hasOwnProperty('mdOrientHorizontal') ?
                    'md-orient-horizontal' :
                    'md-orient-vertical');
        }
    };
}


angular.module(
    'ng.material.v111.ui.repeater',
    [
        'ng',
        'ng.material.v111.core'
    ]
).directive(
    'mdVirtualRepeatContainer',
    VirtualRepeatContainerDirective
).directive(
    'mdVirtualRepeat',
    ['$parse', VirtualRepeatDirective]
).directive(
    'mdOnDemand',
    function () {
		"use strict";
        return {
            restrict: 'A'
        };
    }
);
