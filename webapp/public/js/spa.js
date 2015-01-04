/*
 * spa.js
 * Root namespace module
 */

/*global $, spa */
var spa = (function () {
    var initModule = function ($container) {
        spa.data.initModule();
        spa.model.initModule();
        spa.shell.initModule($container);
    };
    
    return { initModule: initModule };
}());

