
/**
 * @ngdoc module
 * @name material.components.gridlist
 */

/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.gridlist");
msos.require("ng.material.core.media");

ng.material.ui.gridlist.version = new msos.set_version(18, 7, 12);

// Load AngularJS-Material module specific CSS
ng.material.ui.gridlist.css = new msos.loader();
ng.material.ui.gridlist.css.load(msos.resource_url('ng', 'material/css/ui/gridlist.css'));

ng.material.ui.gridlist.specific_attributes = [
	'mdCols', 'mdColsXs', 'mdColsSm', 'mdColsMd', 'mdColsGtMd',
	'mdColspan', 'mdColspanSm', 'mdColspanXs', 'mdColspanGtSm',
	'mdRowspan', 'mdRowHeightGtMd', 'mdRowHeight', 'mdRowspanGtSm',
	'mdGutter', 'mdGutterGtSm', 'mdGutterGtMd', 'mdGutterMd'
];


function GridListController($mdUtil) {
	"use strict";

	this.layoutInvalidated = false;
	this.tilesInvalidated = false;
	this.$timeout_ = $mdUtil.nextTick;
	this.layoutDelegate = angular.noop;
}

GridListController.prototype = {
	invalidateTiles: function () {
		"use strict";
		this.tilesInvalidated = true;
		this.invalidateLayout();
	},
	invalidateLayout: function () {
		"use strict";
		if (this.layoutInvalidated) {
			return;
		}
		this.layoutInvalidated = true;
		this.$timeout_(angular.bind(this, this.layout));
	},
	layout: function () {
		"use strict";
		try {
			this.layoutDelegate(this.tilesInvalidated);
		} finally {
			this.layoutInvalidated = false;
			this.tilesInvalidated = false;
		}
	}
};

function GridListDirective($interpolate, $mdConstant, $mdGridLayout, $mdMedia) {
	"use strict";

	function postLink(scope, element, attrs, ctrl) {

		element.addClass('_md'); // private md component indicator for styling

		// Apply semantics
		element.attr('role', 'list');

		// Provide the controller with a way to trigger layouts.
		ctrl.layoutDelegate = layoutDelegate;

		var invalidateLayout = angular.bind(ctrl, ctrl.invalidateLayout),
			unwatchAttrs = watchMedia(),
			lastLayoutProps,
			startSymbol,
			endSymbol,
			UNIT,
			POSITION,
			DIMENSION;

		scope.$on('$destroy', unwatchMedia);

		function watchMedia() {
			var mediaName;

			for (mediaName in $mdConstant.MEDIA) {
				$mdMedia(mediaName); // initialize
				$mdMedia.getQuery($mdConstant.MEDIA[mediaName])
					.addListener(invalidateLayout);
			}

			return $mdMedia.watchResponsiveAttributes(
				['md-cols', 'md-row-height', 'md-gutter'], attrs, layoutIfMediaMatch
			);
		}

		function unwatchMedia() {
			var mediaName;

			ctrl.layoutDelegate = angular.noop;

			unwatchAttrs();

			for (mediaName in $mdConstant.MEDIA) {
				$mdMedia.getQuery($mdConstant.MEDIA[mediaName])
					.removeListener(invalidateLayout);
			}
		}

		function layoutIfMediaMatch(mediaName) {
			if (mediaName === null || mediaName === undefined) {
				ctrl.invalidateLayout();
			} else if ($mdMedia(mediaName)) {
				ctrl.invalidateLayout();
			}
		}

		function layoutDelegate(tilesInvalidated) {
			var tiles = getTileElements(),
				props = {
					tileSpans: getTileSpans(tiles),
					colCount: getColumnCount(),
					rowMode: getRowMode(),
					rowHeight: getRowHeight(),
					gutter: getGutter()
				},
				performance;

			if (!tilesInvalidated && angular.equals(props, lastLayoutProps)) {
				return;
			}

			performance =
				$mdGridLayout(props.colCount, props.tileSpans, tiles)
				.map(
					function (tilePositions, rowCount) {
						return {
							grid: {
								element: element,
								style: getGridStyle(
									props.colCount,
									rowCount,
									props.gutter,
									props.rowMode,
									props.rowHeight
								)
							},
							tiles: tilePositions.map(
								function (ps, i) {
									return {
										element: angular.element(tiles[i]),
										style: getTileStyle(
											ps.position,
											ps.spans,
											props.colCount,
											rowCount,
											props.gutter,
											props.rowMode,
											props.rowHeight
										)
									};
								}
							)
						};
					}
				).reflow().performance();

			// Report layout
			scope.mdOnLayout({
				$event: {
					performance: performance
				}
			});

			lastLayoutProps = props;
		}

		startSymbol = $interpolate.startSymbol();
		endSymbol = $interpolate.endSymbol();

		function expr(exprStr) {
			return startSymbol + exprStr + endSymbol;
		}

		UNIT = $interpolate(expr('share') + '% - (' + expr('gutter') + ' * ' + expr('gutterShare') + ')');
		POSITION = $interpolate('calc((' + expr('unit') + ' + ' + expr('gutter') + ') * ' + expr('offset') + ')');
		DIMENSION = $interpolate('calc((' + expr('unit') + ') * ' + expr('span') + ' + (' + expr('span') + ' - 1) * ' + expr('gutter') + ')');

		function getTileStyle(position, spans, colCount, rowCount, gutter, rowMode, rowHeight) {
			var hShare = (1 / colCount) * 100,
				hGutterShare = (colCount - 1) / colCount,
				hUnit = UNIT(
					{
						share: hShare,
						gutterShare: hGutterShare,
						gutter: gutter
					}
				),
				ltr = document.dir != 'rtl' && document.body.dir != 'rtl',
				style = ltr ? {
					left: POSITION(
						{
							unit: hUnit,
							offset: position.col,
							gutter: gutter
						}
					),
					width: DIMENSION(
						{
							unit: hUnit,
							span: spans.col,
							gutter: gutter
						}
					),
					paddingTop: '',
					marginTop: '',
					top: '',
					height: ''
				} : {
					right: POSITION(
						{
							unit: hUnit,
							offset: position.col,
							gutter: gutter
						}
					),
					width: DIMENSION(
						{
							unit: hUnit,
							span: spans.col,
							gutter: gutter
						}
					),
					paddingTop: '',
					marginTop: '',
					top: '',
					height: ''
				},
				vShare,
				vUnit,
				vGutterShare;

			switch (rowMode) {
				case 'fixed':
					style.top = POSITION(
						{
							unit: rowHeight,
							offset: position.row,
							gutter: gutter
						}
					);
					style.height = DIMENSION(
						{
							unit: rowHeight,
							span: spans.row,
							gutter: gutter
						}
					);
					break;
				case 'ratio':
					vShare = hShare / rowHeight;

					vUnit = UNIT({
						share: vShare,
						gutterShare: hGutterShare,
						gutter: gutter
					});

					style.paddingTop = DIMENSION(
						{
							unit: vUnit,
							span: spans.row,
							gutter: gutter
						}
					);
					style.marginTop = POSITION(
						{
							unit: vUnit,
							offset: position.row,
							gutter: gutter
						}
					);
					break;
				case 'fit':
					vGutterShare = (rowCount - 1) / rowCount;
					vShare = (1 / rowCount) * 100;

					vUnit = UNIT(
						{
							share: vShare,
							gutterShare: vGutterShare,
							gutter: gutter
						}
					);

					style.top = POSITION(
						{
							unit: vUnit,
							offset: position.row,
							gutter: gutter
						}
					);
					style.height = DIMENSION(
						{
							unit: vUnit,
							span: spans.row,
							gutter: gutter
						}
					);
					break;
			}

			return style;
		}

		function getGridStyle(colCount, rowCount, gutter, rowMode, rowHeight) {
			var style = {},
				hGutterShare,
				hShare,
				vShare,
				vUnit;

			switch (rowMode) {
				case 'fixed':
					style.height = DIMENSION({
						unit: rowHeight,
						span: rowCount,
						gutter: gutter
					});

					style.paddingBottom = '';
					break;

				case 'ratio':
					// rowHeight is width / height
					hGutterShare = colCount === 1 ? 0 : (colCount - 1) / colCount;
					hShare = (1 / colCount) * 100;
					vShare = hShare * (1 / rowHeight);

					vUnit = UNIT(
						{
							share: vShare,
							gutterShare: hGutterShare,
							gutter: gutter
						}
					);

					style.height = '';
					style.paddingBottom = DIMENSION({
						unit: vUnit,
						span: rowCount,
						gutter: gutter
					});
					break;

				case 'fit':
					// noop, as the height is user set
					break;
			}

			return style;
		}

		function getTileElements() {
			return [].filter.call(
				element.children(),
				function (ele) {
					return ele.tagName == 'MD-GRID-TILE' && !ele.$$mdDestroyed;
				}
			);
		}

		function getTileSpans(tileElements) {

			return [].map.call(
				tileElements,
				function (ele) {
					var ctrl = angular.element(ele).controller('mdGridTile');

					return {
						row: parseInt($mdMedia.getResponsiveAttribute(ctrl.$attrs, 'md-rowspan'), 10) || 1,
						col: parseInt($mdMedia.getResponsiveAttribute(ctrl.$attrs, 'md-colspan'), 10) || 1
					};
				}
			);
		}

		function getColumnCount() {
			var colCount = parseInt($mdMedia.getResponsiveAttribute(attrs, 'md-cols'), 10);

			if (isNaN(colCount)) {
				throw 'md-grid-list: md-cols attribute was not found, or contained a non-numeric value';
			}

			return colCount;
		}

		function getGutter() {
			return applyDefaultUnit($mdMedia.getResponsiveAttribute(attrs, 'md-gutter') || 1);
		}

		function getRowHeight() {
			var rowHeight = $mdMedia.getResponsiveAttribute(attrs, 'md-row-height'),
				whRatio;

			if (!rowHeight) {
				throw 'md-grid-list: md-row-height attribute was not found';
			}

			switch (getRowMode()) {
				case 'fixed':
					return applyDefaultUnit(rowHeight);
				case 'ratio':
					whRatio = rowHeight.split(':');
					return parseFloat(whRatio[0]) / parseFloat(whRatio[1]);
				case 'fit':
					return 0; // N/A
			}
		}

		function getRowMode() {
			var rowHeight = $mdMedia.getResponsiveAttribute(attrs, 'md-row-height');

			if (!rowHeight) {
				throw 'md-grid-list: md-row-height attribute was not found';
			}

			if (rowHeight === 'fit') {
				return 'fit';
			} else if (rowHeight.indexOf(':') !== -1) {
				return 'ratio';
			} else {
				return 'fixed';
			}
		}

		function applyDefaultUnit(val) {
			return /\D$/.test(val) ? val : val + 'px';
		}
	}

	return {
		restrict: 'E',
		controller: ["$mdUtil", GridListController],
		scope: {
			mdOnLayout: '&'
		},
		link: postLink
	};
}

function GridLayoutFactory($mdUtil) {
	"use strict";

	function GridTileAnimator(grid, tiles) {
		grid.element.css(grid.style);

		tiles.forEach(
			function (t) {
				t.element.css(t.style);
			}
		);
	}

	var defaultAnimator = GridTileAnimator;

	function calculateGridFor(colCount, tileSpans) {
		var curCol = 0,
			curRow = 0,
			spaceTracker = newSpaceTracker();

		function reserveSpace(spans, i) {
			if (spans.col > colCount) {
				throw 'md-grid-list: Tile at position ' + i + ' has a colspan ' +
					'(' + spans.col + ') that exceeds the column count ' +
					'(' + colCount + ')';
			}

			var start = 0,
				end = 0;

			while (end - start < spans.col) {
				if (curCol >= colCount) {
					nextRow();
					continue;
				}

				start = spaceTracker.indexOf(0, curCol);
				if (start === -1 || (end = findEnd(start + 1)) === -1) {
					start = end = 0;
					nextRow();
					continue;
				}

				curCol = end + 1;
			}

			adjustRow(start, spans.col, spans.row);
			curCol = start + spans.col;

			return {
				col: start,
				row: curRow
			};
		}

		function nextRow() {
			curCol = 0;
			curRow += 1;
			adjustRow(0, colCount, -1);
		}

		function adjustRow(from, cols, by) {
			var i = 0;

			for (i = from; i < from + cols; i += 1) {
				spaceTracker[i] = Math.max(spaceTracker[i] + by, 0);
			}
		}

		function findEnd(start) {
			var i;

			for (i = start; i < spaceTracker.length; i += 1) {
				if (spaceTracker[i] !== 0) {
					return i;
				}
			}

			if (i === spaceTracker.length) {
				return i;
			}
		}

		function newSpaceTracker() {
			var tracker = [],
				i = 0;

			for (i = 0; i < colCount; i += 1) {
				tracker.push(0);
			}

			return tracker;
		}

		return {
			positioning: tileSpans.map(
				function (spans, i) {
					return {
						spans: spans,
						position: reserveSpace(spans, i)
					};
				}
			),
			rowCount: curRow + Math.max.apply(Math, spaceTracker)
		};
	}

	function GridLayout(colCount, tileSpans) {
		var self,
			layoutInfo,
			gridStyles,
			layoutTime,
			mapTime,
			reflowTime;

		layoutTime = $mdUtil.time(
			function () {
				layoutInfo = calculateGridFor(colCount, tileSpans);
			}
		);

		self = {
			layoutInfo: function () {
				return layoutInfo;
			},
			map: function (updateFn) {
				mapTime = $mdUtil.time(
					function () {
						var info = self.layoutInfo();
						gridStyles = updateFn(info.positioning, info.rowCount);
					}
				);

				return self;
			},
			reflow: function (animatorFn) {
				reflowTime = $mdUtil.time(
					function () {
						var animator = animatorFn || defaultAnimator;

						animator(gridStyles.grid, gridStyles.tiles);
					}
				);

				return self;
			},
			performance: function () {
				return {
					tileCount: tileSpans.length,
					layoutTime: layoutTime,
					mapTime: mapTime,
					reflowTime: reflowTime,
					totalTime: layoutTime + mapTime + reflowTime
				};
			}
		};

		return self;
	}

	GridLayout.animateWith = function (customAnimator) {
		defaultAnimator = !angular.isFunction(customAnimator) ? GridTileAnimator : customAnimator;
	};

	return GridLayout;
}

function GridTileDirective($mdMedia) {
	"use strict";

	function postLink(scope, element, attrs, gridCtrl) {
		// Apply semantics
		element.attr('role', 'listitem');

		// If our colspan or rowspan changes, trigger a layout
		var unwatchAttrs = $mdMedia.watchResponsiveAttributes(['md-colspan', 'md-rowspan'],
			attrs, angular.bind(gridCtrl, gridCtrl.invalidateLayout));

		// Tile registration/deregistration
		gridCtrl.invalidateTiles();

		scope.$on(
			'$destroy',
			function ng_md_ui_gridlist_GTD_postlink_on() {
				element[0].$$mdDestroyed = true;
				unwatchAttrs();
				gridCtrl.invalidateLayout();
			}
		);

		if (angular.isDefined(scope.$parent.$index)) {
			scope.$watch(
				function () {
					return scope.$parent.$index;
				},
				function indexChanged(newIdx, oldIdx) {
					if (newIdx === oldIdx) {
						return;
					}
					gridCtrl.invalidateTiles();
				}
			);
		}
	}

	return {
		restrict: 'E',
		require: '^mdGridList',
		template: '<figure ng-transclude></figure>',
		transclude: true,
		scope: {},
		// Simple controller that exposes attributes to the grid directive
		controller: ["$attrs", function ng_md_ui_gridlist_GTD_ctrl($attrs) {
			this.$attrs = $attrs;
		}],
		link: postLink
	};
}

function GridTileCaptionDirective() {
	"use strict";

    return {
        template: '<figcaption ng-transclude></figcaption>',
        transclude: true
    };
}

function generate_gridlist_attr_dirs() {
	"use strict";

	var i = 0,
		gridlist_module = angular.module('ng.material.ui.gridlist'),
		gl_attrs = ng.material.ui.gridlist.specific_attributes;

	for (i = 0; i < gl_attrs.length; i += 1) {
		gridlist_module.directive(
			gl_attrs[i],
			angular.restrictADir
		);
	}
}


angular.module(
	'ng.material.ui.gridlist',
	[
		'ng',
		'ng.material.core',
		'ng.material.core.media'
	]
).directive(
	'mdGridList',
	["$interpolate", "$mdConstant", "$mdGridLayout", "$mdMedia", GridListDirective]
).directive(
	'mdGridTile',
	["$mdMedia", GridTileDirective]
).directive(
	'mdGridTileFooter',
	GridTileCaptionDirective
).directive(
	'mdGridTileHeader',
	GridTileCaptionDirective
).factory(
	'$mdGridLayout',
	["$mdUtil", GridLayoutFactory]
);

generate_gridlist_attr_dirs();
