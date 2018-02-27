(function (ng, undefined) {
  'use strict';
  ng.module('lrTypeaheadMultiSelect', [])
    .controller('lrTypeaheadCtrl', ['$q', function ($q) {
      var isLoading = false;
      var suggestions = [];
      var suggestionInput = '';
      var highlighted = null;

      var proto = {
        /**
         * add a value to the valueCollection
         * @param item - the value to add
         */
        addValue: function (item) {
          //only add new items
          if (this.valueCollection.indexOf(item) === -1) {
            this.valueCollection.push(item);
            suggestions = [];
            suggestionInput = '';
            highlighted = null;
          }
        },
        /**
         * remove a value from the valueCollection (or remove the last item)
         * @param item - the value to remove
         */
        removeValue: function removeValue (item) {
          var index = this.valueCollection.indexOf(item);
          if (index !== -1) {
            this.valueCollection.splice(index, 1);
          } else {
            this.valueCollection.pop();
          }
        },
        /**
         * update suggestions based on the input
         * @param input {String} - the suggestion input
         */
        suggest: function suggest (input) {
          var ctrl = this;
          ctrl.valueCollection = ctrl.valueCollection || 0;
          suggestionInput = input;
          suggestions = input ?
            function () {
              isLoading = true;
              $q.resolve(ctrl.suggester(input))
                .then(function (sugg) {
                  suggestions = sugg.filter(function (s) {
                    return ctrl.valueCollection.indexOf(s) === -1;
                  });
                  highlighted = suggestions.length ? suggestions[0] : null;
                })
                .finally(function () {
                  isLoading = false;
                })
            }() : [];
        },
        /**
         * tells whether a suggestion is currently highlighted
         * @param item - the suggestion to verify
         */
        isHighlighted: function isHiglighted (item) {
          return highlighted === item;
        },
        /**
         * highlight the next suggestion in the suggestion list
         */
        highlightPrevious: function highlightPrevious () {
          var index = suggestions.indexOf(highlighted);
          highlighted = index >= 0 && suggestions.length ? suggestions[index - 1] : highlighted;
        },
        /**
         * highlight the previous suggestion in the suggestion list
         */
        highlightNext: function highlightNext () {
          var index = suggestions.indexOf(highlighted);
          highlighted = index >= 0 && index + 1 < suggestions.length ? suggestions[index + 1] : highlighted;
        }
      };

      return Object.create(proto, {
        isLoading: {
          get: function () {
            return isLoading;
          }
        },
        suggestions: {
          get: function () {
            return suggestions;
          }
        },
        suggestionInput: {
          get: function () {
            return suggestionInput;
          }
        },
        highlighted: {
          get: function () {
            return highlighted;
          }
        },
        valueCollection: {
          value: [],
          writable: true
        }
      });
    }])
    .directive('lrTypeahead', function () {
      return {
        scope: true,
        bindToController: {
          valueCollection: '=lrTypeahead',
          suggester: '='
        },
        controller: 'lrTypeaheadCtrl',
        controllerAs: 'lrTypeaheadCtrl'
      }
    })
    .directive('lrSuggestionInput', ['$timeout', function ($timeout) {
      return {
        require: '^lrTypeahead',
        link: function (scope, element, attr, ctrl) {
          var editing = null;
          var strict = attr.strictMode !== 'false';
          element.bind('input', function () {
            if (editing !== null) {
              $timeout.cancel(editing);
            }
            editing = $timeout(function () {
              ctrl.suggest(element[0].value);
              editing = null;
            }, 200);
          });
          element.bind('keydown', function (event) {
            scope.$apply(function () {
              var key = event.keyCode;
              if (key === 13) {
                if (!strict || ctrl.suggestions[0]) {
                  ctrl.addValue(ctrl.highlighted || element[0].value);
                  element[0].value = '';
                  event.preventDefault();
                }
              } else if (key === 8 && !element[0].value) {
                ctrl.removeValue();
              } else if (key === 40) {
                ctrl.highlightNext();
              } else if (key === 38) {
                ctrl.highlightPrevious();
              }
            })
          });
        }
      }
    }]);
})(angular);
