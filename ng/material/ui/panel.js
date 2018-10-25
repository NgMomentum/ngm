
/*global
    msos: false,
    angular: false,
    ng: false
*/

msos.provide("ng.material.ui.panel");
msos.require("ng.material.core.animator");
msos.require("ng.material.core.theming");
msos.require("ng.material.ui.backdrop");

ng.material.ui.panel.version = new msos.set_version(18, 9, 1);

// Load AngularJS-Material module specific CSS
ng.material.ui.panel.css = new msos.loader();
ng.material.ui.panel.css.load(msos.resource_url('ng', 'material/css/ui/panel.css'));


(function () {
    "use strict";

    var MD_PANEL_Z_INDEX = 80,
		MD_PANEL_HIDDEN = '_md-panel-hidden',
		FOCUS_TRAP_TEMPLATE = angular.element('<div class="_md-panel-focus-trap" tabindex="0"></div>'),
		_presets = {};

    function definePreset(name, preset) {
        if (!name || !preset) {
            throw new Error('mdPanelProvider: The panel preset definition is ' +
                'malformed. The name and preset object are required.');
        } else if (_presets.hasOwnProperty(name)) {
            throw new Error('mdPanelProvider: The panel preset you have requested ' +
                'has already been defined.');
        }

        // Delete any property on the preset that is not allowed.
        delete preset.id;
        delete preset.position;
        delete preset.animation;

        _presets[name] = preset;
    }

    function getAllPresets() {
        return angular.copy(_presets);
    }

    function clearPresets() {
        _presets = {};
    }

    function MdPanelService(presets, $rootElement, $rootScope, $injector, $window) {

        this._defaultConfigOptions = {
            bindToController: true,
            clickOutsideToClose: false,
            disableParentScroll: false,
            escapeToClose: false,
            focusOnOpen: true,
            fullscreen: false,
            hasBackdrop: false,
            propagateContainerEvents: false,
            transformTemplate: angular.bind(this, this._wrapTemplate),
            trapFocus: false,
            zIndex: MD_PANEL_Z_INDEX
        };

        this._config = {};
        this._presets = presets;
        this._$rootElement = $rootElement;
        this._$rootScope = $rootScope;
        this._$injector = $injector;
        this._$window = $window;
		this._$mdUtil = $injector.get('$mdUtil');
		this._$$mdAnimate = $injector.get('$$mdAnimate');
        this._trackedPanels = {};
        this._groups = Object.create(null);
        this.animation = MdPanelAnimation.animation;
        this.xPosition = MdPanelPosition.xPosition;
        this.yPosition = MdPanelPosition.yPosition;
        this.interceptorTypes = MdPanelRef.interceptorTypes;
        this.closeReasons = MdPanelRef.closeReasons;
        this.absPosition = MdPanelPosition.absPosition;
    }

	MdPanelService.$inject = ["presets", "$rootElement", "$rootScope", "$injector", "$window"];

    MdPanelService.prototype.create = function (preset, config) {
		var trackedPanel,
			panelRef;

        if (typeof preset === 'string') {
            preset = this._getPresetByName(preset);
        } else if (typeof preset === 'object' && (angular.isUndefined(config) || !config)) {
            config = preset;
            preset = {};
        }

        preset = preset || {};
        config = config || {};

        if (angular.isDefined(config.id) && this._trackedPanels[config.id]) {
            trackedPanel = this._trackedPanels[config.id];
            angular.extend(trackedPanel.config, config);
            return trackedPanel;
        }

        this._config = angular.extend(
			{
				id: config.id || 'panel_' + this._$mdUtil.nextUid(),
				scope: this._$rootScope.$new(true),
				attachTo: this._$rootElement
			},
			this._defaultConfigOptions,
			config,
			preset
		);

        // Create the panelRef and add it to the `_trackedPanels` object.
        panelRef = new MdPanelRef(this._config, this._$injector);

        this._trackedPanels[config.id] = panelRef;

        // Add the panel to each of its requested groups.
        if (this._config.groupName) {
            if (angular.isString(this._config.groupName)) {
                this._config.groupName = [this._config.groupName];
            }

            angular.forEach(
				this._config.groupName,
				function (group) { panelRef.addToGroup(group); }
			);
        }

        this._config.scope.$on(
			'$destroy',
			angular.bind(panelRef, panelRef.detach)
		);

        return panelRef;
    };

    MdPanelService.prototype.open = function (preset, config) {
        var panelRef = this.create(preset, config);

        return panelRef.open().then(
				function () { return panelRef; }
			);
    };

    MdPanelService.prototype._getPresetByName = function (preset) {
        if (!this._presets[preset]) {
            throw new Error('mdPanel: The panel preset configuration that you ' +
                'requested does not exist. Use the $mdPanelProvider to create a ' +
                'preset before requesting one.');
        }
        return this._presets[preset];
    };

    MdPanelService.prototype.newPanelPosition = function () {
        return new MdPanelPosition(this._$injector);
    };

    MdPanelService.prototype.newPanelAnimation = function () {
        return new MdPanelAnimation(this._$injector);
    };

    MdPanelService.prototype.newPanelGroup = function (groupName, config) {
        if (!this._groups[groupName]) {
            config = config || {};

            var group = {
                panels: [],
                openPanels: [],
                maxOpen: config.maxOpen > 0 ? config.maxOpen : Infinity
            };

            this._groups[groupName] = group;
        }

        return this._groups[groupName];
    };

    MdPanelService.prototype.setGroupMaxOpen = function (groupName, maxOpen) {
        if (this._groups[groupName]) {
            this._groups[groupName].maxOpen = maxOpen;
        } else {
            throw new Error('mdPanel: Group does not exist yet. Call newPanelGroup().');
        }
    };

    MdPanelService.prototype._openCountExceedsMaxOpen = function (groupName) {
        if (this._groups[groupName]) {
            var group = this._groups[groupName];
            return group.maxOpen > 0 && group.openPanels.length > group.maxOpen;
        }

        return false;
    };

    MdPanelService.prototype._closeFirstOpenedPanel = function (groupName) {
        this._groups[groupName].openPanels[0].close();
    };

    MdPanelService.prototype._wrapTemplate = function (origTemplate) {
        var template = origTemplate || '';

        return '' +
            '<div class="md-panel-outer-wrapper">' +
            '  <div class="md-panel _md-panel-offscreen">' + template + '</div>' +
            '</div>';
    };

    MdPanelService.prototype._wrapContentElement = function (contentElement) {
        var wrapper = angular.element('<div class="md-panel-outer-wrapper">');

        contentElement.addClass('md-panel _md-panel-offscreen');
        wrapper.append(contentElement);

        return wrapper;
    };

    function $getProvider() {
        return [
            '$rootElement', '$rootScope', '$injector', '$window',
            function ($rootElement, $rootScope, $injector, $window) {
                return new MdPanelService(_presets, $rootElement, $rootScope, $injector, $window);
            }
        ];
    }

    function MdPanelRef(config, $injector) {

        this._$q = $injector.get('$q');
        this._$mdCompiler = $injector.get('$mdCompiler');
        this._$mdConstant = $injector.get('$mdConstant');
		this._$mdUtil = $injector.get('$mdUtil');
		this._$$mdAnimate = $injector.get('$$mdAnimate');
        this._$mdTheming = $injector.get('$mdTheming');
        this._$rootScope = $injector.get('$rootScope');
        this._$animate = $injector.get('$animate');
        this._$mdPanel = $injector.get('$mdPanel');
        this._$log = $injector.get('$log');
        this._$window = $injector.get('$window');
        this.id = config.id;
        this.config = config;
        this.panelContainer = undefined;
        this.panelEl = undefined;
        this.isAttached = false;
        this._removeListeners = [];
        this._topFocusTrap = undefined;
        this._bottomFocusTrap = undefined;
        this._backdropRef = undefined;
        this._restoreScroll = null;
        this._interceptors = Object.create(null);
        this._compilerCleanup = null;
        this._restoreCache = {
            styles: '',
            classes: ''
        };
    }

    MdPanelRef.interceptorTypes = {
        CLOSE: 'onClose'
    };

    MdPanelRef.prototype.open = function () {
        var self = this;

		// Make sure it is an array
		if (angular.isString(self.config.groupName)) {
            self.config.groupName = [self.config.groupName];
        }

        return this._$q(
				function (resolve, reject) {
					var done = self._done(resolve, self),
						show = self._simpleBind(self.show, self),
						checkGroupMaxOpen = function () {
							if (self.config.groupName) {
								angular.forEach(
									self.config.groupName,
									function (group) {
										if (self._$mdPanel._openCountExceedsMaxOpen(group)) {
											self._$mdPanel._closeFirstOpenedPanel(group);
										}
									}
								);
							}
						};

					self.attach()
						.then(show)
						.then(checkGroupMaxOpen)
						.then(done)
						.catch(reject);
				},
				'ng_md_ui_panel_MdPanelRef_open'
			);
    };

    MdPanelRef.prototype.close = function (closeReason) {
        var self = this;

        return this._$q(
				function (resolve, reject) {
					self._callInterceptors(MdPanelRef.interceptorTypes.CLOSE).then(
						function () {
							var done = self._done(resolve, self),
								detach = self._simpleBind(self.detach, self),
								onCloseSuccess = self.config.onCloseSuccess || angular.noop;

							onCloseSuccess = angular.bind(self, onCloseSuccess, self, closeReason);

							self.hide()
								.then(detach)
								.then(done)
								.then(onCloseSuccess)
								.catch(reject);
						},
						reject
					);
				},
				'ng_md_ui_panel_MdPanelRef_close'
			);
    };

    MdPanelRef.prototype.attach = function () {

        if (this.isAttached && this.panelEl) {
            return this._$q.when(this._$q.defer('ng_md_ui_panel_attach_when'), this);
        }

        var self = this;

        return this._$q(
				function (resolve, reject) {
					var done = self._done(resolve, self),
						onDomAdded = self.config.onDomAdded || angular.noop,
						addListeners = function (response) {
							self.isAttached = true;
							self._addEventListeners();

							return response;
						};

					self._$q.all(self._$q.defer('ng_md_ui_panel_attach_all'), [
						self._createBackdrop(),
						self._createPanel()
							.then(addListeners)
							.catch(reject)
					]).then(onDomAdded)
						.then(done)
						.catch(reject);
				},
				'ng_md_ui_panel_MdPanelRef_attach'
			);
    };

    MdPanelRef.prototype.detach = function () {

        if (!this.isAttached) {
            return this._$q.when(this._$q.defer('ng_md_ui_panel_ref_when'), this);
        }

        var self = this,
			onDomRemoved = self.config.onDomRemoved || angular.noop,
			detachFn = function () {

				self._removeEventListeners();

				if (self._topFocusTrap && self._topFocusTrap.parentNode) {
					self._topFocusTrap.parentNode.removeChild(self._topFocusTrap);
				}

				if (self._bottomFocusTrap && self._bottomFocusTrap.parentNode) {
					self._bottomFocusTrap.parentNode.removeChild(self._bottomFocusTrap);
				}

				if (self._restoreCache.classes) {
					self.panelEl[0].className = self._restoreCache.classes;
				}

				// Either restore the saved styles or clear the ones set by mdPanel.
				self.panelEl[0].style.cssText = self._restoreCache.styles || '';

				self._compilerCleanup();
				self.panelContainer.remove();
				self.isAttached = false;

				return self._$q.when(self._$q.defer('ng_md_ui_panel_detach_when'), self);
			};

        if (this._restoreScroll) {
            this._restoreScroll();
            this._restoreScroll = null;
        }

        return this._$q(
				function (resolve, reject) {
					var done = self._done(resolve, self);

					self._$q.all(self._$q.defer('ng_md_ui_panel_detach_all'), [
						detachFn(),
						self._backdropRef ? self._backdropRef.detach() : true
					]).then(onDomRemoved)
						.then(done)
						.catch(reject);
				},
				'ng_md_ui_panel_detach'
			);
    };

    MdPanelRef.prototype.destroy = function () {
        var self = this;

        if (this.config.groupName) {
            angular.forEach(
				this.config.groupName,
				function (group) {
					self.removeFromGroup(group);
				}
			);
        }

        this.config.scope.$destroy();
        this.config.locals = null;
        this.config.onDomAdded = null;
        this.config.onDomRemoved = null;
        this.config.onRemoving = null;
        this.config.onOpenComplete = null;
        this._interceptors = null;
    };

    MdPanelRef.prototype.show = function () {

        if (!this.panelContainer) {
            return this._$q(
					function (resolve, reject) {
						reject('mdPanel: Panel does not exist yet. Call open() or attach().');
					},
					'ng_md_ui_panel_MdPanelRef_show_na'
				);
        }

        if (!this.panelContainer.hasClass(MD_PANEL_HIDDEN)) {
            return this._$q.when(this._$q.defer('ng_md_ui_panel_show_when'), this);
        }

        var self = this,
			animatePromise = function () {
				self.panelContainer.removeClass(MD_PANEL_HIDDEN);

				return self._animateOpen();
			};

        return this._$q(
				function (resolve, reject) {
					var done = self._done(resolve, self),
						onOpenComplete = self.config.onOpenComplete || angular.noop,
						addToGroupOpen = function () {
							if (self.config.groupName) {
								angular.forEach(
									self.config.groupName,
									function (group) {
										group = self._$mdPanel._groups[group];
										if (group) {
											group.openPanels.push(self);
										} else {
											msos.console.error('ng.material.ui.panel - MdPanelRef - show -> error, na group: ' + group + ', in array: ', self.config.groupName);
										}
									}
								);
							}
						};

					self._$q.all(self._$q.defer('ng_md_ui_panel_show_all'), [
						self._backdropRef ? self._backdropRef.show() : self,
						animatePromise().then(
							function () { self._focusOnOpen(); },
							reject
						)
					]).then(onOpenComplete)
						.then(addToGroupOpen)
						.then(done)
						.catch(reject);
				},
				'ng_md_ui_panel_MdPanelRef_show'
			);
    };

    MdPanelRef.prototype.hide = function () {
        if (!this.panelContainer) {
            return this._$q(
					function (resolve, reject) {
						reject('mdPanel: Panel does not exist yet. Call open() or attach().');
					},
					'ng_md_ui_panel_MdPanelRef_hide_na'
				);
        }

        if (this.panelContainer.hasClass(MD_PANEL_HIDDEN)) {
            return this._$q.when(this._$q.defer('ng_md_ui_panel_hide_when'), this);
        }

        var self = this;

        return this._$q(
				function (resolve, reject) {
					var done = self._done(resolve, self),
						onRemoving = self.config.onRemoving || angular.noop,
						hidePanel = function () {
							self.panelContainer.addClass(MD_PANEL_HIDDEN);
						},
						removeFromGroupOpen = function () {
							var index;

							if (self.config.groupName) {
                    
								angular.forEach(
									self.config.groupName,
									function (group) {
										group = self._$mdPanel._groups[group];
										if (group) {
											index = group.openPanels.indexOf(self);
											if (index > -1) { group.openPanels.splice(index, 1); }
										} else {
											msos.console.error('ng.material.ui.panel - MdPanelRef - hide -> error, na group: ' + group + ', in array: ', self.config.groupName);
										}
									}
								);
							}
						},
						focusOnOrigin = function () {
							var origin = self.config.origin;

							if (origin) { getElement(origin).focus(); }
						};

					self._$q.all(self._$q.defer('ng_md_ui_panel_hide_all'), [
						self._backdropRef ? self._backdropRef.hide() : self,
						self._animateClose()
							.then(onRemoving)
							.then(hidePanel)
							.then(removeFromGroupOpen)
							.then(focusOnOrigin)
							.catch(reject)
					]).then(done, reject);
				},
				'ng_md_ui_panel_MdPanelRef_hide'
			);
    };

    MdPanelRef.prototype.addClass = function (newClass, toElement) {

        this._$log.warn(
            'mdPanel: The addClass method is in the process of being deprecated. ' +
            'Full deprecation is scheduled for the AngularJS Material 1.2 release. ' +
            'To achieve the same results, use the panelContainer or panelEl ' +
            'JQLite elements that are referenced in MdPanelRef.');

        if (!this.panelContainer) {
            throw new Error('mdPanel: Panel does not exist yet. Call open() or attach().');
        }

        if (!toElement && !this.panelContainer.hasClass(newClass)) {
            this.panelContainer.addClass(newClass);
        } else if (toElement && !this.panelEl.hasClass(newClass)) {
            this.panelEl.addClass(newClass);
        }
    };

    MdPanelRef.prototype.removeClass = function (oldClass, fromElement) {
        this._$log.warn(
            'mdPanel: The removeClass method is in the process of being deprecated. ' +
            'Full deprecation is scheduled for the AngularJS Material 1.2 release. ' +
            'To achieve the same results, use the panelContainer or panelEl ' +
            'JQLite elements that are referenced in MdPanelRef.');

        if (!this.panelContainer) {
            throw new Error('mdPanel: Panel does not exist yet. Call open() or attach().');
        }

        if (!fromElement && this.panelContainer.hasClass(oldClass)) {
            this.panelContainer.removeClass(oldClass);
        } else if (fromElement && this.panelEl.hasClass(oldClass)) {
            this.panelEl.removeClass(oldClass);
        }
    };

    MdPanelRef.prototype.toggleClass = function (toggleClass, onElement) {
        this._$log.warn(
            'mdPanel: The toggleClass method is in the process of being deprecated. ' +
            'Full deprecation is scheduled for the AngularJS Material 1.2 release. ' +
            'To achieve the same results, use the panelContainer or panelEl ' +
            'JQLite elements that are referenced in MdPanelRef.');

        if (!this.panelContainer) {
            throw new Error('mdPanel: Panel does not exist yet. Call open() or attach().');
        }

        if (!onElement) {
            this.panelContainer.toggleClass(toggleClass);
        } else {
            this.panelEl.toggleClass(toggleClass);
        }
    };

    MdPanelRef.prototype._compile = function() {
        var self = this;

        return self._$mdCompiler.compile(self.config).then(
				function (compileData) {
					var config = self.config,
						panelEl;

					if (config.contentElement) {
						panelEl = compileData.element;

						self._restoreCache.styles = panelEl[0].style.cssText;
						self._restoreCache.classes = panelEl[0].className;

						self.panelContainer = self._$mdPanel._wrapContentElement(panelEl);
						self.panelEl = panelEl;
					} else {
						self.panelContainer = compileData.link(config.scope);
						self.panelEl = angular.element(
							self.panelContainer[0].querySelector('.md-panel')
						);
					}

					// Save a reference to the cleanup function from the compiler.
					self._compilerCleanup = compileData.cleanup;

					// Attach the panel to the proper place in the DOM.
					getElement(self.config.attachTo).append(self.panelContainer);

					return self;
				}
			);
    };

    MdPanelRef.prototype._createPanel = function () {
        var self = this;

        return this._$q(
				function (resolve, reject) {

					if (!self.config.locals) {
						self.config.locals = {};
					}

					self.config.locals.mdPanelRef = self;

					self._compile().then(
						function () {

							if (self.config.disableParentScroll) {
								self._restoreScroll = self._$mdUtil.disableScrollAround(
									null,
									self.panelContainer,
									{ disableScrollMask: true }
								);
							}

							// Add a custom CSS class to the panel element.
							if (self.config.panelClass) {
								self.panelEl.addClass(self.config.panelClass);
							}

							// Handle click and touch events for the panel container.
							if (self.config.propagateContainerEvents) {
								self.panelContainer.css('pointer-events', 'none');
								self.panelEl.css('pointer-events', 'all');
							}

							// Panel may be outside the $rootElement, tell ngAnimate to animate
							// regardless.
							if (self._$animate.pin) {
								self._$animate.pin(
									self.panelContainer,
									getElement(self.config.attachTo)
								);
							}

							self._configureTrapFocus();

							self._addStyles().then(
								function () {
									resolve(self);
								},
								reject
							);
						},
						reject
					);

				},
				'ng_md_ui_panel_MdPanelRef_createPanel'
			);
    };

    MdPanelRef.prototype._addStyles = function () {
        var self = this;

        return this._$q(
				function (resolve) {

					self.panelContainer.css('z-index', self.config.zIndex);
					self.panelEl.css('z-index', self.config.zIndex + 1);

					var hideAndResolve = function () {
							// Theme the element and container.
							self._setTheming();

							// Remove offscreen class and add hidden class.
							self.panelEl.removeClass('_md-panel-offscreen');
							self.panelContainer.addClass(MD_PANEL_HIDDEN);

							resolve(self);
						},
						positionConfig;

					if (self.config.fullscreen) {
						self.panelEl.addClass('_md-panel-fullscreen');
						hideAndResolve();

						return; // Don't setup positioning.
					}

					positionConfig = self.config.position;

					if (!positionConfig) {
						hideAndResolve();

						return; // Don't setup positioning.
					}

					// Wait for angular to finish processing the template
					self._$rootScope.$$postDigest(
						function () {

							self._updatePosition(true);

							// Theme the element and container.
							self._setTheming();

							resolve(self);
						}
					);
				},
				'ng_md_ui_panel_MdPanelRef_addStyles'
			);
    };

    MdPanelRef.prototype._setTheming = function () {
        this._$mdTheming(this.panelEl);
        this._$mdTheming(this.panelContainer);
    };

    MdPanelRef.prototype.updatePosition = function (position) {
        if (!this.panelContainer) {
            throw new Error('mdPanel: Panel does not exist yet. Call open() or attach().');
        }

        this.config.position = position;
        this._updatePosition();
    };

    MdPanelRef.prototype._updatePosition = function (init) {
        var positionConfig = this.config.position;

        if (positionConfig) {
            positionConfig._setPanelPosition(this.panelEl);

            // Hide the panel now that position is known.
            if (init) {
                this.panelEl.removeClass('_md-panel-offscreen');
                this.panelContainer.addClass(MD_PANEL_HIDDEN);
            }

            this.panelEl.css(
                MdPanelPosition.absPosition.TOP,
                positionConfig.getTop()
            );
            this.panelEl.css(
                MdPanelPosition.absPosition.BOTTOM,
                positionConfig.getBottom()
            );
            this.panelEl.css(
                MdPanelPosition.absPosition.LEFT,
                positionConfig.getLeft()
            );
            this.panelEl.css(
                MdPanelPosition.absPosition.RIGHT,
                positionConfig.getRight()
            );
        }
    };

    MdPanelRef.prototype._focusOnOpen = function() {
		var self = this;

        if (this.config.focusOnOpen) {
            this._$rootScope.$$postDigest(
				function () {
					var target = self._$mdUtil.findFocusTarget(self.panelEl) || self.panelEl;

					target.focus();
				}
			);
        }
    };

    MdPanelRef.prototype._createBackdrop = function () {
		var backdropAnimation,
			backdropConfig;

        if (this.config.hasBackdrop) {

            if (!this._backdropRef) {
                backdropAnimation = this._$mdPanel.newPanelAnimation()
                    .openFrom(this.config.attachTo)
                    .withAnimation({
                        open: '_md-opaque-enter',
                        close: '_md-opaque-leave'
                    });

                if (this.config.animation) {
                    backdropAnimation.duration(this.config.animation._rawDuration);
                }

                backdropConfig = {
                    animation: backdropAnimation,
                    attachTo: this.config.attachTo,
                    focusOnOpen: false,
                    panelClass: '_md-panel-backdrop',
                    zIndex: this.config.zIndex - 1
                };

                this._backdropRef = this._$mdPanel.create(backdropConfig);
            }

            if (!this._backdropRef.isAttached) { return this._backdropRef.attach(); }
        }

		return undefined;
    };

    MdPanelRef.prototype._addEventListeners = function () {
        this._configureEscapeToClose();
        this._configureClickOutsideToClose();
        this._configureScrollListener();
    };

    MdPanelRef.prototype._removeEventListeners = function () {

		if (this._removeListeners && this._removeListeners.length)  {
			this._removeListeners.forEach(
				function (removeFn) { removeFn(); }
			);
		}

        this._removeListeners = [];
    };

    MdPanelRef.prototype._configureEscapeToClose = function () {
		var self = this,
			parentTarget,
			keyHandlerFn;

        if (this.config.escapeToClose) {

            parentTarget = getElement(this.config.attachTo);

			keyHandlerFn = function (ev) {
				if (ev.keyCode === self._$mdConstant.KEY_CODE.ESCAPE) {
					ev.stopPropagation();
					ev.preventDefault();

					self.close(MdPanelRef.closeReasons.ESCAPE);
				}
			};

            // Add keydown listeners
            this.panelContainer.on('keydown', keyHandlerFn);
            parentTarget.on('keydown', keyHandlerFn);

            // Queue remove listeners function
            this._removeListeners.push(
				function () {
					self.panelContainer.off('keydown', keyHandlerFn);
					parentTarget.off('keydown', keyHandlerFn);
				}
			);
        }
    };

    MdPanelRef.prototype._configureClickOutsideToClose = function () {
		var self = this,
			target,
			sourceEl,
			mousedownHandler,
			mouseupHandler;

        if (this.config.clickOutsideToClose) {

            target = this.config.propagateContainerEvents ? angular.element(document.body) : this.panelContainer;

            mousedownHandler = function (ev) {
                sourceEl = ev.target;
            };

            mouseupHandler = function (ev) {
                if (self.config.propagateContainerEvents) {

                    if (sourceEl !== self.panelEl[0] && !self.panelEl[0].contains(sourceEl)) {
                        self.close();
                    }

                } else if (sourceEl === target[0] && ev.target === target[0]) {
                    ev.stopPropagation();
                    ev.preventDefault();

                    self.close(MdPanelRef.closeReasons.CLICK_OUTSIDE);
                }
            };

            // Add listeners
            target.on('mousedown', mousedownHandler);
            target.on('mouseup', mouseupHandler);

            // Queue remove listeners function
            this._removeListeners.push(
				function () {
					target.off('mousedown', mousedownHandler);
					target.off('mouseup', mouseupHandler);
				}
			);
        }
    };

    MdPanelRef.prototype._configureScrollListener = function () {
		var self = this,
			updatePosition,
			debouncedUpdatePosition,
			onScroll;

        if (!this.config.disableParentScroll) {

            updatePosition = angular.bind(this, this._updatePosition);
            debouncedUpdatePosition = _.throttle(updatePosition, 100);

            onScroll = function () { debouncedUpdatePosition(); };

            this._$window.addEventListener('scroll', onScroll, true);

            this._removeListeners.push(
				function () {
					self._$window.removeEventListener('scroll', onScroll, true);
				}
			);
        }
    };

    MdPanelRef.prototype._configureTrapFocus = function () {
		var element,
			focusHandler;

        this.panelEl.attr('tabIndex', '-1');

        if (this.config.trapFocus) {
            element = this.panelEl;

            this._topFocusTrap = FOCUS_TRAP_TEMPLATE.clone()[0];
            this._bottomFocusTrap = FOCUS_TRAP_TEMPLATE.clone()[0];

            focusHandler = function () { element.focus(); };

            this._topFocusTrap.addEventListener('focus', focusHandler);
            this._bottomFocusTrap.addEventListener('focus', focusHandler);

            // Queue remove listeners function
            this._removeListeners.push(this._simpleBind(
				function () {
					this._topFocusTrap.removeEventListener('focus', focusHandler);
					this._bottomFocusTrap.removeEventListener('focus', focusHandler);
				},
				this
			));

            element[0].parentNode.insertBefore(this._topFocusTrap, element[0]);
            element.after(this._bottomFocusTrap);
        }
    };

    MdPanelRef.prototype.updateAnimation = function (animation) {
        this.config.animation = animation;

        if (this._backdropRef) {
            this._backdropRef.config.animation.duration(animation._rawDuration);
        }
    };

    MdPanelRef.prototype._animateOpen = function () {

        this.panelContainer.addClass('md-panel-is-showing');

        var self = this,
			animationConfig = this.config.animation;

        if (!animationConfig) {
            // Promise is in progress, return it.
            this.panelContainer.addClass('_md-panel-shown');

            return this._$q.when(this._$q.defer('ng_md_ui_panel_animateOpen_when'), this);
        }

        return this._$q(
				function (resolve) {
					var done = self._done(resolve, self),
						warnAndOpen = function () {
							self._$log.warn(
								'mdPanel: MdPanel Animations failed. ' +
								'Showing panel without animating.'
							);
							done();
						};

					animationConfig.animateOpen(self.panelEl)
						.then(done, warnAndOpen);
				},
				'ng_md_ui_panel_animateOpen'
			);
    };

    MdPanelRef.prototype._animateClose = function () {
        var self = this,
			animationConfig = this.config.animation;

        if (!animationConfig) {
            this.panelContainer.removeClass('md-panel-is-showing');
            this.panelContainer.removeClass('_md-panel-shown');

            return this._$q.when(this._$q.defer('ng_md_ui_panel_animateClose_when'), this);
        }

        return this._$q(
				function (resolve) {
					var done = function () {
							self.panelContainer.removeClass('md-panel-is-showing');
							resolve(self);
						},
						warnAndClose = function () {
							self._$log.warn(
								'mdPanel: MdPanel Animations failed. ' +
								'Hiding panel without animating.'
							);
							done();
						};

					animationConfig.animateClose(self.panelEl)
						.then(done, warnAndClose);
				},
				'ng_md_ui_panel_animateClose'
			);
    };

    MdPanelRef.prototype.registerInterceptor = function (type, callback) {
        var error = null,
			interceptors;

        if (!angular.isString(type)) {
            error = 'Interceptor type must be a string, instead got ' + typeof type;
        } else if (!angular.isFunction(callback)) {
            error = 'Interceptor callback must be a function, instead got ' + typeof callback;
        }

        if (error) { throw new Error('MdPanel: ' + error); }

        interceptors = this._interceptors[type] = this._interceptors[type] || [];

        if (interceptors.indexOf(callback) === -1) {
            interceptors.push(callback);
        }

        return this;
    };

    MdPanelRef.prototype.removeInterceptor = function (type, callback) {
        var index = this._interceptors[type] ? this._interceptors[type].indexOf(callback) : -1;

        if (index > -1) {
            this._interceptors[type].splice(index, 1);
        }

        return this;
    };

    MdPanelRef.prototype.removeAllInterceptors = function (type) {
        if (type) {
            this._interceptors[type] = [];
        } else {
            this._interceptors = Object.create(null);
        }

        return this;
    };

    MdPanelRef.prototype._callInterceptors = function (type) {
        var self = this,
			$q = self._$q,
			interceptors = self._interceptors && self._interceptors[type] || [];

        return interceptors.reduceRight(
				function (promise, interceptor) {
					var isPromiseLike = interceptor && angular.isFunction(interceptor.then),
						response = isPromiseLike ? interceptor : null;

					return promise.then(
							function () {
								if (!response) {
									try {
										response = interceptor(self);
									} catch (e) {
										response = $q.reject($q.defer('ng_md_ui_panel_callInterceptors_reject'), e);
									}
								}

								return response;
							}
						);
				},
				$q.resolve($q.defer('ng_md_ui_panel_callInterceptors_resolve'), self)
			);
    };

    MdPanelRef.prototype._simpleBind = function (callback, self) {
        return function (value) {
            return callback.apply(self, value);
        };
    };

    MdPanelRef.prototype._done = function (callback, self) {
        return function () {
            callback(self);
        };
    };

    MdPanelRef.prototype.addToGroup = function (groupName) {

        if (!this._$mdPanel._groups[groupName]) {
            this._$mdPanel.newPanelGroup(groupName);
        }

        var group = this._$mdPanel._groups[groupName],
			index = group.panels.indexOf(this);

        if (index < 0) {
            group.panels.push(this);
        }
    };

    MdPanelRef.prototype.removeFromGroup = function (groupName) {

        if (!this._$mdPanel._groups[groupName]) {
            throw new Error('mdPanel: The group ' + groupName + ' does not exist.');
        }

        var group = this._$mdPanel._groups[groupName],
			index = group.panels.indexOf(this);

        if (index > -1) {
            group.panels.splice(index, 1);
        }
    };

    MdPanelRef.closeReasons = {
        CLICK_OUTSIDE: 'clickOutsideToClose',
        ESCAPE: 'escapeToClose',
    };


    function MdPanelPosition($injector) {

        this._$window = $injector.get('$window');
        this._isRTL = $injector.get('$mdUtil').bidi() === 'rtl';
        this._$mdConstant = $injector.get('$mdConstant');
        this._absolute = false;
        this._relativeToEl = undefined;
        this._top = '';
        this._bottom = '';
        this._left = '';
        this._right = '';
        this._translateX = [];
        this._translateY = [];
        this._positions = [];
        this._actualPosition = undefined;
    }

    MdPanelPosition.xPosition = {
        CENTER: 'center',
        ALIGN_START: 'align-start',
        ALIGN_END: 'align-end',
        OFFSET_START: 'offset-start',
        OFFSET_END: 'offset-end'
    };

    MdPanelPosition.yPosition = {
        CENTER: 'center',
        ALIGN_TOPS: 'align-tops',
        ALIGN_BOTTOMS: 'align-bottoms',
        ABOVE: 'above',
        BELOW: 'below'
    };

    MdPanelPosition.absPosition = {
        TOP: 'top',
        RIGHT: 'right',
        BOTTOM: 'bottom',
        LEFT: 'left'
    };

    MdPanelPosition.viewportMargin = 8;

    MdPanelPosition.prototype.absolute = function () {
        this._absolute = true;
        return this;
    };

    MdPanelPosition.prototype._setPosition = function (position, value) {
		var positions = '';

        if (position === MdPanelPosition.absPosition.RIGHT ||
            position === MdPanelPosition.absPosition.LEFT) {
            this._left = this._right = '';
        } else if (
            position === MdPanelPosition.absPosition.BOTTOM ||
            position === MdPanelPosition.absPosition.TOP) {
            this._top = this._bottom = '';
        } else {
            positions = Object.keys(MdPanelPosition.absPosition).join()
                .toLowerCase();

            throw new Error('mdPanel: Position must be one of ' + positions + '.');
        }

        this['_' + position] = angular.isString(value) ? value : '0';

        return this;
    };

    MdPanelPosition.prototype.top = function (top) {
        return this._setPosition(MdPanelPosition.absPosition.TOP, top);
    };

    MdPanelPosition.prototype.bottom = function (bottom) {
        return this._setPosition(MdPanelPosition.absPosition.BOTTOM, bottom);
    };

    MdPanelPosition.prototype.start = function (start) {
        var position = this._isRTL ? MdPanelPosition.absPosition.RIGHT : MdPanelPosition.absPosition.LEFT;
        return this._setPosition(position, start);
    };

    MdPanelPosition.prototype.end = function (end) {
        var position = this._isRTL ? MdPanelPosition.absPosition.LEFT : MdPanelPosition.absPosition.RIGHT;
        return this._setPosition(position, end);
    };

    MdPanelPosition.prototype.left = function (left) {
        return this._setPosition(MdPanelPosition.absPosition.LEFT, left);
    };

    MdPanelPosition.prototype.right = function (right) {
        return this._setPosition(MdPanelPosition.absPosition.RIGHT, right);
    };

    MdPanelPosition.prototype.centerHorizontally = function () {
        this._left = '50%';
        this._right = '';
        this._translateX = ['-50%'];

        return this;
    };

    MdPanelPosition.prototype.centerVertically = function () {
        this._top = '50%';
        this._bottom = '';
        this._translateY = ['-50%'];
        return this;
    };

    MdPanelPosition.prototype.center = function () {
        return this.centerHorizontally().centerVertically();
    };

    MdPanelPosition.prototype.relativeTo = function(element) {
        this._absolute = false;
        this._relativeToEl = getElement(element);
        return this;
    };

    MdPanelPosition.prototype.addPanelPosition = function (xPosition, yPosition) {
        if (!this._relativeToEl) {
            throw new Error('mdPanel: addPanelPosition can only be used with ' +
                'relative positioning. Set relativeTo first.');
        }

        this._validateXPosition(xPosition);
        this._validateYPosition(yPosition);

        this._positions.push({
            x: xPosition,
            y: yPosition,
        });

        return this;
    };

    MdPanelPosition.prototype._validateYPosition = function(yPosition) {

        if (yPosition === null || yPosition === undefined) { return; }

        var positionKeys = Object.keys(MdPanelPosition.yPosition) || [],
			positionValues = [],
			position,
			i = 0,
			key;

        for (i = 0; i < positionKeys.length; i += 1) {

			key = positionKeys[i];
            position = MdPanelPosition.yPosition[key];
            positionValues.push(position);

            if (position === yPosition) { return; }
        }

        throw new Error('mdPanel: Panel y position only accepts the following ' +
            'values:\n' + positionValues.join(' | ')
		);
    };

    MdPanelPosition.prototype._validateXPosition = function (xPosition) {

        if (xPosition === null || xPosition === undefined) { return; }

        var positionKeys = Object.keys(MdPanelPosition.xPosition) || [],
			positionValues = [],
			position,
			i = 0,
			key;

        for (i = 0; i < positionKeys.length; i += 1) {

			key = positionKeys[i];
            position = MdPanelPosition.xPosition[key];
            positionValues.push(position);

            if (position === xPosition) { return; }
        }

        throw new Error('mdPanel: Panel x Position only accepts the following ' +
            'values:\n' + positionValues.join(' | '));
    };

    function addUnits(value) {
        return angular.isNumber(value) ? value + 'px' : value;
    }

    MdPanelPosition.prototype.withOffsetX = function (offsetX) {
        this._translateX.push(addUnits(offsetX));
        return this;
    };

    MdPanelPosition.prototype.withOffsetY = function (offsetY) {
        this._translateY.push(addUnits(offsetY));
        return this;
    };

    MdPanelPosition.prototype.getTop = function () {
        return this._top;
    };

    MdPanelPosition.prototype.getBottom = function () {
        return this._bottom;
    };

    MdPanelPosition.prototype.getLeft = function () {
        return this._left;
    };

    MdPanelPosition.prototype.getRight = function () {
        return this._right;
    };

    MdPanelPosition.prototype.getTransform = function () {
        var translateX = this._reduceTranslateValues('translateX', this._translateX),
			translateY = this._reduceTranslateValues('translateY', this._translateY);

        return (translateX + ' ' + translateY).trim();
    };

    MdPanelPosition.prototype._setTransform = function (panelEl) {
        return panelEl.css(this._$mdConstant.CSS.TRANSFORM, this.getTransform());
    };

    MdPanelPosition.prototype._isOnscreen = function (panelEl) {
        var left = parseInt(this.getLeft()),
			top = parseInt(this.getTop()),
			prefixedTransform,
			offsets,
			right,
			bottom;

        if (this._translateX.length || this._translateY.length) {
            prefixedTransform = this._$mdConstant.CSS.TRANSFORM;
            offsets = getComputedTranslations(panelEl, prefixedTransform);
            left += offsets.x;
            top += offsets.y;
        }

        right = left + panelEl[0].offsetWidth;
        bottom = top + panelEl[0].offsetHeight;

        return (left >= 0) && (top >= 0) && (bottom <= this._$window.innerHeight) && (right <= this._$window.innerWidth);
    };

    MdPanelPosition.prototype.getActualPosition = function () {
        return this._actualPosition;
    };

    MdPanelPosition.prototype._reduceTranslateValues = function (translateFn, values) {
		return values.map(
			function (translation) {
				var translationValue = angular.isFunction(translation) ? addUnits(translation(this)) : translation;

				return translateFn + '(' + translationValue + ')';
			},
			this
		).join(' ');
	};


    MdPanelPosition.prototype._setPanelPosition = function (panelEl) {
		var i = 0;

        // Remove the "position adjusted" class in case it has been added before.
        panelEl.removeClass('_md-panel-position-adjusted');

        // Only calculate the position if necessary.
        if (this._absolute) {
            this._setTransform(panelEl);
            return;
        }

        if (this._actualPosition) {
            this._calculatePanelPosition(panelEl, this._actualPosition);
            this._setTransform(panelEl);
            this._constrainToViewport(panelEl);
            return;
        }

        for (i = 0; i < this._positions.length; i += 1) {

            this._actualPosition = this._positions[i];
            this._calculatePanelPosition(panelEl, this._actualPosition);
            this._setTransform(panelEl);

            if (this._isOnscreen(panelEl)) {
                return;
            }
        }

        this._constrainToViewport(panelEl);
    };

    MdPanelPosition.prototype._constrainToViewport = function	(panelEl) {
        var margin = MdPanelPosition.viewportMargin,
			initialTop = this._top,
			initialLeft = this._left,
			top,
			bottom,
			viewportHeight,
			left,
			right,
			viewportWidth;

        if (this.getTop()) {

            top = parseInt(this.getTop());
            bottom = panelEl[0].offsetHeight + top;
            viewportHeight = this._$window.innerHeight;

            if (top < margin) {
                this._top = margin + 'px';
            } else if (bottom > viewportHeight) {
                this._top = top - (bottom - viewportHeight + margin) + 'px';
            }
        }

        if (this.getLeft()) {

            left = parseInt(this.getLeft());
            right = panelEl[0].offsetWidth + left;
            viewportWidth = this._$window.innerWidth;

            if (left < margin) {
                this._left = margin + 'px';
            } else if (right > viewportWidth) {
                this._left = left - (right - viewportWidth + margin) + 'px';
            }
        }

        // Class that can be used to re-style the panel if it was repositioned.
        panelEl.toggleClass(
            '_md-panel-position-adjusted',
            this._top !== initialTop || this._left !== initialLeft
        );
    };

    MdPanelPosition.prototype._reverseXPosition = function (position) {
        if (position === MdPanelPosition.xPosition.CENTER) {
            return position;
        }

        var start = 'start',
			end = 'end';

        return position.indexOf(start) > -1 ? position.replace(start, end) : position.replace(end, start);
    };

    MdPanelPosition.prototype._bidi = function (position) {
        return this._isRTL ? this._reverseXPosition(position) : position;
    };

    MdPanelPosition.prototype._calculatePanelPosition = function (panelEl, position) {

        var panelBounds = panelEl[0].getBoundingClientRect(),
			panelWidth = Math.max(panelBounds.width, panelEl[0].clientWidth),
			panelHeight = Math.max(panelBounds.height, panelEl[0].clientHeight),
			targetBounds = this._relativeToEl[0].getBoundingClientRect(),
			targetLeft = targetBounds.left,
			targetRight = targetBounds.right,
			targetWidth = targetBounds.width,
			targetTop,
			targetBottom,
			targetHeight;

        switch (this._bidi(position.x)) {
            case MdPanelPosition.xPosition.OFFSET_START:
                this._left = targetLeft - panelWidth + 'px';
                break;
            case MdPanelPosition.xPosition.ALIGN_END:
                this._left = targetRight - panelWidth + 'px';
                break;
            case MdPanelPosition.xPosition.CENTER:
                var left = targetLeft + (0.5 * targetWidth) - (0.5 * panelWidth);
                this._left = left + 'px';
                break;
            case MdPanelPosition.xPosition.ALIGN_START:
                this._left = targetLeft + 'px';
                break;
            case MdPanelPosition.xPosition.OFFSET_END:
                this._left = targetRight + 'px';
                break;
        }

        targetTop = targetBounds.top;
        targetBottom = targetBounds.bottom;
        targetHeight = targetBounds.height;

        switch (position.y) {
            case MdPanelPosition.yPosition.ABOVE:
                this._top = targetTop - panelHeight + 'px';
                break;
            case MdPanelPosition.yPosition.ALIGN_BOTTOMS:
                this._top = targetBottom - panelHeight + 'px';
                break;
            case MdPanelPosition.yPosition.CENTER:
                var top = targetTop + (0.5 * targetHeight) - (0.5 * panelHeight);
                this._top = top + 'px';
                break;
            case MdPanelPosition.yPosition.ALIGN_TOPS:
                this._top = targetTop + 'px';
                break;
            case MdPanelPosition.yPosition.BELOW:
                this._top = targetBottom + 'px';
                break;
        }
    };

    function MdPanelAnimation($injector) {

		this._$mdUtil = $injector.get('$mdUtil');
		this._$$mdAnimate = $injector.get('$$mdAnimate');
        this._openFrom = undefined;
        this._closeTo = undefined;
        this._animationClass = '';
        this._openDuration = undefined;
        this._closeDuration = undefined;
        this._rawDuration = undefined;
    }

    MdPanelAnimation.animation = {
        SLIDE: 'md-panel-animate-slide',
        SCALE: 'md-panel-animate-scale',
        FADE: 'md-panel-animate-fade'
    };

    MdPanelAnimation.prototype.openFrom = function (openFrom) {
        // Check if 'openFrom' is an Event.
        openFrom = openFrom.target ? openFrom.target : openFrom;

        this._openFrom = this._getPanelAnimationTarget(openFrom);

        if (!this._closeTo) {
            this._closeTo = this._openFrom;
        }

        return this;
    };

    MdPanelAnimation.prototype.closeTo = function (closeTo) {
        this._closeTo = this._getPanelAnimationTarget(closeTo);
        return this;
    };

    MdPanelAnimation.prototype.duration = function (duration) {

        function toSeconds(value) {
            if (angular.isNumber(value)) { return value / 1000; }
        }

        if (duration) {
            if (angular.isNumber(duration)) {
                this._openDuration = this._closeDuration = toSeconds(duration);
            } else if (angular.isObject(duration)) {
                this._openDuration = toSeconds(duration.open);
                this._closeDuration = toSeconds(duration.close);
            }
        }

        // Save the original value so it can be passed to the backdrop.
        this._rawDuration = duration;

        return this;
    };

    MdPanelAnimation.prototype._getPanelAnimationTarget = function (location) {

        if (angular.isDefined(location.top) || angular.isDefined(location.left)) {
            return {
                element: undefined,
                bounds: {
                    top: location.top || 0,
                    left: location.left || 0
                }
            };
        } else {
            return this._getBoundingClientRect(getElement(location));
        }
    };

    MdPanelAnimation.prototype.withAnimation = function	(cssClass) {
        this._animationClass = cssClass;
        return this;
    };


    MdPanelAnimation.prototype.animateOpen = function (panelEl) {
        var animator = this._$$mdAnimate(this._$mdUtil),
			animationOptions = {},
			panelTransform,
			openFrom,
			openTo,
			openSlide,
			openScale;

        this._fixBounds(panelEl);

        panelTransform = panelEl[0].style.transform || '';

        openFrom = animator.toTransformCss(panelTransform);
          openTo = animator.toTransformCss(panelTransform);

        switch (this._animationClass) {
            case MdPanelAnimation.animation.SLIDE:
                // Slide should start with opacity: 1.
                panelEl.css('opacity', '1');

                animationOptions = {
                    transitionInClass: '_md-panel-animate-enter'
                };

                openSlide = animator.calculateSlideToOrigin(panelEl, this._openFrom) || '';
                 openFrom = animator.toTransformCss(openSlide + ' ' + panelTransform);
                break;

            case MdPanelAnimation.animation.SCALE:
                animationOptions = {
                    transitionInClass: '_md-panel-animate-enter'
                };

                openScale = animator.calculateZoomToOrigin(panelEl, this._openFrom) || '';
                 openFrom = animator.toTransformCss(openScale + ' ' + panelTransform);
                break;

            case MdPanelAnimation.animation.FADE:
                animationOptions = {
                    transitionInClass: '_md-panel-animate-enter'
                };
                break;

            default:
                if (angular.isString(this._animationClass)) {
                    animationOptions = {
                        transitionInClass: this._animationClass
                    };
                } else {
                    animationOptions = {
                        transitionInClass: this._animationClass.open,
                        transitionOutClass: this._animationClass.close
                    };
                }
        }

        animationOptions.duration = this._openDuration;

        return animator.translate3d(panelEl, openFrom, openTo, animationOptions);
    };

    MdPanelAnimation.prototype.animateClose = function (panelEl) {
        var animator = this._$$mdAnimate(this._$mdUtil),
			reverseAnimationOptions = {},
			panelTransform = panelEl[0].style.transform || '',
			closeFrom = animator.toTransformCss(panelTransform),
			closeTo = animator.toTransformCss(panelTransform),
			closeSlide,
			closeScale;

        switch (this._animationClass) {
            case MdPanelAnimation.animation.SLIDE:
                // Slide should start with opacity: 1.
                panelEl.css('opacity', '1');
                reverseAnimationOptions = {
                    transitionInClass: '_md-panel-animate-leave'
                };

                closeSlide = animator.calculateSlideToOrigin(panelEl, this._closeTo) || '';
                   closeTo = animator.toTransformCss(closeSlide + ' ' + panelTransform);
                break;

            case MdPanelAnimation.animation.SCALE:
                reverseAnimationOptions = {
                    transitionInClass: '_md-panel-animate-scale-out _md-panel-animate-leave'
                };

                closeScale = animator.calculateZoomToOrigin(panelEl, this._closeTo) || '';
                closeTo = animator.toTransformCss(closeScale + ' ' + panelTransform);
                break;

            case MdPanelAnimation.animation.FADE:
                reverseAnimationOptions = {
                    transitionInClass: '_md-panel-animate-fade-out _md-panel-animate-leave'
                };
                break;

            default:
                if (angular.isString(this._animationClass)) {
                    reverseAnimationOptions = {
                        transitionOutClass: this._animationClass
                    };
                } else {
                    reverseAnimationOptions = {
                        transitionInClass: this._animationClass.close,
                        transitionOutClass: this._animationClass.open
                    };
                }
        }

        reverseAnimationOptions.duration = this._closeDuration;

        return animator.translate3d(panelEl, closeFrom, closeTo, reverseAnimationOptions);
    };

    MdPanelAnimation.prototype._fixBounds = function (panelEl) {
        var panelWidth = panelEl[0].offsetWidth,
			panelHeight = panelEl[0].offsetHeight;

		if (this._openFrom) {
			if (this._openFrom.bounds.height === null || this._openFrom.bounds.height === undefined) {
				this._openFrom.bounds.height = panelHeight;
			}
			if (this._openFrom.bounds.width === null || this._openFrom.bounds.width === undefined) {
				this._openFrom.bounds.width = panelWidth;
			}
		}

		if (this._closeTo) {
			if (this._closeTo.bounds.height === null || this._closeTo.bounds.height === undefined) {
				this._closeTo.bounds.height = panelHeight;
			}
			if (this._closeTo.bounds.width === null || this._closeTo.bounds.width === undefined) {
				this._closeTo.bounds.width = panelWidth;
			}
		}

    };

    MdPanelAnimation.prototype._getBoundingClientRect = function (element) {
        if (element instanceof angular.element) {
            return {
                element: element,
                bounds: element[0].getBoundingClientRect()
            };
        }
    };

    function getElement(el) {
        var queryResult = angular.isString(el) ? document.querySelector(el) : el;

        return angular.element(queryResult);
    }

    function getComputedTranslations(el, property) {
        var transform = getComputedStyle(el[0] || el)[property],
			openIndex = transform.indexOf('('),
			closeIndex = transform.lastIndexOf(')'),
			output = {
				x: 0,
				y: 0
			},
			parsedValues;

        if (openIndex > -1 && closeIndex > -1) {
            parsedValues = transform
                .substring(openIndex + 1, closeIndex)
                .split(', ')
                .slice(-2);

            output.x = parseInt(parsedValues[0]);
            output.y = parseInt(parsedValues[1]);
        }

        return output;
    }

    function MdPanelProvider() {

        return {
            'definePreset': definePreset,
            'getAllPresets': getAllPresets,
            'clearPresets': clearPresets,
            '$get': $getProvider()
        };
    }


	angular.module(
		'ng.material.ui.panel',
		[
			'ng',
			'ng.material.core',
			'ng.material.core.animator',
			'ng.material.core.theming',
			'ng.material.ui.backdrop'
		]
	).provider(
		'$mdPanel',
		MdPanelProvider
	);

}());