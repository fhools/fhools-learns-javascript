/*
 * spa.js
 * Root namespace module
 */

/*global $, spa */
var spa = (function () {
    var initModule = function ($container) {
        spa.shell.initModule( $container );
    };
    
    return { initModule: initModule };
}());

