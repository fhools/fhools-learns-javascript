/*
 * spa.shell.js
 * Shell module for SPA
*/

/* global $, spa */

spa.shell = (function () {
    // ----------------- Begin Module Scope Variables ----------------------------
    var
        configMap = {
            // Define map used by uriAnchor for validation
            anchor_schema_map : {
                chat : { opened : true, closed : true }
            },
            
            // HTML for main SPA shell layout
            main_html : String()
                + '<div class="spa-shell-head">'
                    + '<div class="spa-shell-head-logo"></div>'
                    + '<div class="spa-shell-head-acct"></div>'
                    + '<div class="spa-shell-head-search"></div>'
                + '</div>'
                + '<div class="spa-shell-main">'
                    + '<div class="spa-shell-main-nav"></div>'
                    + '<div class="spa-shell-main-content"></div>'
                + '</div>'
                + '<div class="spa-shell-foot"></div>'
                + '<div class="spa-shell-modal"></div>',
            
            // Chat configuration items
            chat_extend_time : 300,
            chat_retract_time : 300,
            chat_extend_height : 450,
            chat_retract_height : 15,
            chat_extended_title : 'Click to retract',
            chat_retracted_title : 'Click to extend',
            resize_interval : 200
        },
        
        // State variables for SPA
        stateMap = { 
            anchor_map : {},
            resize_idto : undefined
        },
        jqueryMap = {},
        
        copyAnchorMap, changeAnchorPart, onHashchange,
        setJqueryMap, setChatAnchor, onClickChat, onResize, initModule;
    
    // ----------------- End Module Scope Variables ------------------------------
    
    // ------------------ Begin Utility Methods -----------------------------------
    copyAnchorMap = function () {
        // Utilize jQuery's extend utility to make deep copy of anchor_map
        return $.extend(true, {}, stateMap.anchor_map);
    };
    
    // ------------------ End Utility Methods -------------------------------------
    
    
    // ------------------ Begin DOM Methods ---------------------------------------
    setJqueryMap = function () {
        var $container = stateMap.$container;
        jqueryMap = { 
            $container : $container,
        };
    };
    
    // changeAnchorPart
    // Args:
    //      arg_map - Map describing what part of the URI anchor we want changed.
    // Returns:
    //      true - the Anchor portion of the URI was updated
    //      false - the Anchor portion of the URI could not be updated or needed not be updated
    // Action:
    //      The stateMap.anchor_map is updated by:
    //      1. Copying the map
    //      2. Modify the key-values in map using arg_map argument
    //      3. Attempts to change the URI using uriAnchor
    //      4. Returns true/false
    changeAnchorPart = function (arg_map) {
        var
            anchor_map_revise = copyAnchorMap(),
            bool_return = true,
            key_name, key_name_dep;
        
        KEYVAL:
        for (key_name in arg_map) {
            if (arg_map.hasOwnProperty(key_name)) {
                // All dependent keys in uriAnchor start with '_'
                if (key_name.indexOf('_') === 0) {
                    continue KEYVAL; 
                }
                
                anchor_map_revise[key_name] = arg_map[key_name];
                
                key_name_dep = '_' + key_name;
                if (arg_map[key_name_dep]) {
                    anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
                } else {
                    delete anchor_map_revise[key_name_dep];
                    delete anchor_map_revise['_s' + key_name_dep];
                }
            }
        }
        
        try {
            $.uriAnchor.setAnchor(anchor_map_revise);
        } catch (error) {
            $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
            bool_return = false;
        }
        
        return bool_return;
    }
    
            
                
    // ------------------- End DOM Methods ----------------------------------------
    
    // ------------------- Begin Event Handlers -----------------------------------
    onHashchange = function (event) {
        var // The '_s' prefix is uriAnchor's convention of storing the 
            // 'string representation' of a key.
            _s_chat_previous, _s_chat_proposed,
            s_chat_proposed,
            is_ok = true,
            anchor_map_previous = copyAnchorMap(),
            anchor_map_proposed;
            
        try {
            anchor_map_proposed = $.uriAnchor.makeAnchorMap();
        } catch (error) {
            $.uriAnchor.setAnchor(anchor_map_previous, null, true);
            return false;
        }
        stateMap.anchor_map = anchor_map_proposed;
        
        _s_chat_previous = anchor_map_previous._s_chat;
        _s_chat_proposed = anchor_map_proposed._s_chat;
        
        if (!anchor_map_previous 
            || _s_chat_previous !== _s_chat_proposed) {
            
            s_chat_proposed = anchor_map_proposed.chat;
            switch(_s_chat_proposed) {
                    case 'opened' :
                        is_ok = spa.chat.setSliderPosition('opened');
                        break;
                    case 'closed' :
                        is_ok = spa.chat.setSliderPosition('closed');
                        break;
                    default :
                        spa.chat.setSliderPosition('closed')
                        delete anchor_map_proposed.chat;
                        $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
            }
        }
        
        if (!is_ok) {
            if (anchor_map_previous) {
                $.uriAnchor.setAnchor(anchor_map_previous, null, true);
                stateMap.anchor_map = anchor_map_previous;
            } else {
                delete anchor_map_proposed.chat;
                $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
            }
        }
        
        return false;
    }
    
    onResize = function () {
        
        // onResize will set timer for 200 milliseconds, this gets checked first thing
        // to make sure we throttle how many times we call onResize
        if (stateMap.resize_idto) { return true; }
        
        spa.chat.handleResize();
        // set the resize timer, 200 ms later it will clear itself to handler further resize
        // events
        stateMap.resize_idto = setTimeout(function () { stateMap.resize_idto = undefined; },
                                          configMap.resize_interval);
        
        return true;
    }
    setChatAnchor = function (position_type) {
        return changeAnchorPart({
            chat: position_type 
        });
    };
    
    // ------------------- End Event Handlers -------------------------------------
    
    // ------------------- Begin Public Methods -----------------------------------
    initModule = function ( $container ) {
        stateMap.$container = $container;
        $container.html( configMap.main_html );
        setJqueryMap();
            
        $.uriAnchor.configModule({
            schema_map : configMap.anchor_schema_map
        });
        
        // configure and initialize feature modules
        spa.chat.configModule({
            set_chat_anchor : setChatAnchor,
            chat_model : spa.model.chat,
            people_model : spa.model.people_model
        });
        
        spa.chat.initModule(jqueryMap.$container);
        
        $(window)
            .bind('hashchange', onHashchange)
            .bind('resize', onResize)
            .trigger('hashchange');
    };
    
    return { initModule : initModule };
    // ------------------- End Public Methods -------------------------------------
}());

