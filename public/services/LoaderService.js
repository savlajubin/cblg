/* @Service  : Loader
 * @Creator  : Jubin Savla
 * @created  : 04 November 2015
 * @purpose  : Loader Services provider (for Showing Loading animation)
 */

angular.module('LoaderService', [])
        .service('LoadingInterceptor', ['$q', '$rootScope', '$log', 'cfpLoadingBar',
            function ($q, $rootScope, $log, cfpLoadingBar) {
                'use strict';

                //Put Backend url for which you don't want to show Loader
                var rejectedUrl = [
                    '/whitelabelsettings',
                    '/api_user/signIn',
                    '/api_user/register_lgn',
                    '/api_user/forgot_password',
                    '/api_user/get_roleId',
                    '/phoneAgent/livecalls'
                ];

                var xhrCreations = 0;
                var xhrResolutions = 0;

                function isLoading() {
                    return xhrResolutions < xhrCreations;
                }

                function updateStatus() {
                    //$rootScope.xhrLoading = isLoading();

                    if (isLoading() && cfpLoadingBar.status() == 1) {
                        cfpLoadingBar.complete();
                    } else if (isLoading() && !cfpLoadingBar.status()) {
                        cfpLoadingBar.start();
                    } else if (isLoading()) {
                        cfpLoadingBar.set(xhrResolutions / xhrCreations);
                    }
                }

                return {
                    request: function (config) {
                        if (rejectedUrl.indexOf(config.url) == -1) {
                            xhrCreations++;
                            updateStatus();
                        }
                        return config;
                    },
                    requestError: function (rejection) {
                        if (rejectedUrl.indexOf(rejection.config.url) == -1) {
                            xhrResolutions++;
                            updateStatus();
                            $log.error('Request error:', rejection);
                        }
                        return $q.reject(rejection);
                    },
                    response: function (response) {
                        if (rejectedUrl.indexOf(response.config.url) == -1) {
                            xhrResolutions++;
                            updateStatus();
                        }
                        return response;
                    },
                    responseError: function (rejection) {
                        if (rejectedUrl.indexOf(rejection.config.url) == -1) {
                            xhrResolutions++;
                            updateStatus();
                            $log.error('Response error:', rejection);
                        }
                        return $q.reject(rejection);
                    }
                };
            }])
        .config(['$httpProvider', function ($httpProvider) {
                $httpProvider.interceptors.push('LoadingInterceptor');
            }]);


/**************************HTML Template*************************
 <style>
 div#ajaxLoaderDiv {
 position: fixed;
 background-color: rgba(50,50,50,0.75);
 top: 50%;
 left: 50%;
 z-index: 1;
 padding: 10px;
 border-radius: 5px;
 border: 1px solid rgba(75,75,75,0.15);
 height: 72px;
 width: 72px;
 margin-left: -36px;
 margin-top: -36px;
 }
 div#ajaxLoaderDiv1 {
 position: absolute;
 background-color: rgba(50,50,50,0.5);
 top: 0;
 left: 0;
 z-index: 1;
 height: 100%;
 width: 100%;
 }
 div#ajaxLoaderinnerDiv {
 position: fixed;
 background-color: rgba(50,50,50,0.75);
 top: 50%;
 left: 50%;
 z-index: 1;
 padding: 10px;
 border-radius: 5px;
 border: 1px solid rgba(75,75,75,0.15);
 height: 72px;
 width: 72px;
 margin-left: -36px;
 margin-top: -36px;
 }
 div#middle{
 position: relative;
 }
 nav.navbar-default{z-index: 2;}
 </style>
 <div id="ajaxLoaderDiv1" data-ng-if="xhrLoading">
 <div id="ajaxLoaderinnerDiv">
 <i class="fa fa-spinner fa-pulse" style="color: #fff;font-size: 50px;"></i>
 </div>
 </div>
 *****************************************************************************/





/*
 * angular-loading-bar
 *
 * intercepts XHR requests and creates a loading bar.
 * Based on the excellent nprogress work by rstacruz (more info in readme)
 *
 * (c) 2013 Wes Cruver
 * License: MIT
 */


(function () {

    'use strict';

// Alias the loading bar for various backwards compatibilities since the project has matured:
//angular.module('angular-loading-bar', ['cfp.loadingBarInterceptor']);
//angular.module('chieffancypants.loadingBar', ['cfp.loadingBarInterceptor']);



    /**
     * Loading Bar
     *
     * This service handles adding and removing the actual element in the DOM.
     * Generally, best practices for DOM manipulation is to take place in a
     * directive, but because the element itself is injected in the DOM only upon
     * XHR requests, and it's likely needed on every view, the best option is to
     * use a service.
     */
    angular.module('cfp.loadingBar', [])
            .provider('cfpLoadingBar', function () {

                this.autoIncrement = true;
                this.includeSpinner = false;//true;
                this.includeBar = true;
                this.latencyThreshold = 100;
                this.startSize = 0.02;
                this.parentSelector = 'body';
                this.spinnerTemplate = '<div id="loading-bar-spinner"><div class="spinner-icon"></div></div>';
                this.loadingBarTemplate = '<div id="loading-bar"><div class="bar"><div class="peg"></div></div></div>';

                this.$get = ['$injector', '$document', '$timeout', '$rootScope', function ($injector, $document, $timeout, $rootScope) {
                        var $animate;
                        var $parentSelector = this.parentSelector,
                                loadingBarContainer = angular.element(this.loadingBarTemplate),
                                loadingBar = loadingBarContainer.find('div').eq(0),
                                spinner = angular.element(this.spinnerTemplate);

                        var incTimeout,
                                completeTimeout,
                                started = false,
                                status = 0;

                        var autoIncrement = this.autoIncrement;
                        var includeSpinner = this.includeSpinner;
                        var includeBar = this.includeBar;
                        var startSize = this.startSize;

                        /**
                         * Inserts the loading bar element into the dom, and sets it to 2%
                         */
                        function _start() {
                            if (!$animate) {
                                $animate = $injector.get('$animate');
                            }

                            $timeout.cancel(completeTimeout);

                            // do not continually broadcast the started event:
                            if (started) {
                                return;
                            }

                            var document = $document[0];
                            var parent = document.querySelector ?
                                    document.querySelector($parentSelector)
                                    : $document.find($parentSelector)[0]
                                    ;

                            if (!parent) {
                                parent = document.getElementsByTagName('body')[0];
                            }

                            var $parent = angular.element(parent);
                            var $after = parent.lastChild && angular.element(parent.lastChild);

                            $rootScope.$broadcast('cfpLoadingBar:started');
                            started = true;

                            if (includeBar) {
                                $animate.enter(loadingBarContainer, $parent, $after);
                            }

                            if (includeSpinner) {
                                $animate.enter(spinner, $parent, loadingBarContainer);
                            }
                            _set(startSize);
                        }

                        /**
                         * Set the loading bar's width to a certain percent.
                         *
                         * @param n any value between 0 and 1
                         */
                        function _set(n) {
                            if (!started) {
                                return;
                            }
                            var pct = (n * 100) + '%';
                            loadingBar.css('width', pct);
                            status = n;

                            // increment loadingbar to give the illusion that there is always
                            // progress but make sure to cancel the previous timeouts so we don't
                            // have multiple incs running at the same time.
                            if (autoIncrement) {
                                $timeout.cancel(incTimeout);
                                incTimeout = $timeout(function () {
                                    _inc();
                                }, 250);
                            }
                        }

                        /**
                         * Increments the loading bar by a random amount
                         * but slows down as it progresses
                         */
                        function _inc() {
                            if (_status() >= 1) {
                                return;
                            }

                            var rnd = 0;

                            // TODO: do this mathmatically instead of through conditions

                            var stat = _status();
                            if (stat >= 0 && stat < 0.25) {
                                // Start out between 3 - 6% increments
                                rnd = (Math.random() * (5 - 3 + 1) + 3) / 100;
                            } else if (stat >= 0.25 && stat < 0.65) {
                                // increment between 0 - 3%
                                rnd = (Math.random() * 3) / 100;
                            } else if (stat >= 0.65 && stat < 0.9) {
                                // increment between 0 - 2%
                                rnd = (Math.random() * 2) / 100;
                            } else if (stat >= 0.9 && stat < 0.99) {
                                // finally, increment it .5 %
                                rnd = 0.005;
                            } else {
                                // after 99%, don't increment:
                                rnd = 0;
                            }

                            var pct = _status() + rnd;
                            _set(pct);
                        }

                        function _status() {
                            return status;
                        }

                        function _completeAnimation() {
                            status = 0;
                            started = false;
                        }

                        function _complete() {
                            if (!$animate) {
                                $animate = $injector.get('$animate');
                            }

                            _set(1);
                            $timeout.cancel(completeTimeout);

                            // Attempt to aggregate any start/complete calls within 500ms:
                            completeTimeout = $timeout(function () {
                                var promise = $animate.leave(loadingBarContainer, _completeAnimation);
                                if (promise && promise.then) {
                                    promise.then(_completeAnimation);
                                }
                                $animate.leave(spinner);
                                $rootScope.$broadcast('cfpLoadingBar:completed');
                            }, 500);
                        }

                        return {
                            start: _start,
                            set: _set,
                            status: _status,
                            inc: _inc,
                            complete: _complete,
                            autoIncrement: this.autoIncrement,
                            includeSpinner: this.includeSpinner,
                            latencyThreshold: this.latencyThreshold,
                            parentSelector: this.parentSelector,
                            startSize: this.startSize
                        };


                    }];     //
            });       // wtf javascript. srsly
})();