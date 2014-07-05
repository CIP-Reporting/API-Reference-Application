/*
 * CIP Reporting API Client Application
 *
 * Copyright (c) 2013 CIP Reporting
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms are permitted
 * provided that the above copyright notice and this paragraph are
 * duplicated in all such forms and that any documentation,
 * advertising materials, and other materials related to such
 * distribution and use acknowledge that the software was developed
 * by CIP Reporting.  The name of CIP Reporting may not be used to 
 * endorse or promote products derived from this software without 
 * specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND WITHOUT ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, WITHOUT LIMITATION, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
 *
 */
(function(window, undefined) {

  if (typeof CIPAPI == 'undefined') CIPAPI = {};
  CIPAPI.main = {};
  
  var log = log4javascript.getLogger("CIPAPI.main");

  // Global map references
  CIPAPI.main.map = null;
  
  log.debug("Attempting to contact parent frame");
  if (typeof parent != 'undefined' && typeof parent.registerChildAPI == 'function') {
    parent.registerChildAPI(CIPAPI);
    log.debug("Parent contacted successfully");
  } else {
    log.debug("Failed to contact parent");
  }

  // Navigating away from main, have my children clean up after themselves
  $(document).on('cipapi-unbind', function() {
    log.debug("Cleaning up maps");
    if (CIPAPI.main.map !== null) {
      CIPAPI.main.map.destroy();
      CIPAPI.main.map = null;
    }

    log.debug("Cleaning up my children");
    $(document).trigger('cipapi-unbind-main');
    $('div#main-content-area > *').remove();
  });

  $(document).on('cipapi-handle-main', function(event, info) {
    $('div#container').html('<div id="main-content-area"></div>');
    
    // Draw me some map
    CIPAPI.main.map = CIPAPI.components.map('main-content-area', 25);
    
    $(document).trigger('application-ready');
  });
  
  $(document).on('cipapi-set-map-point', function(event) {
    if (CIPAPI.main.map !== null) {
      for (var i=1; i<arguments.length; i++) {
        (function (point) {
          var marker = CIPAPI.main.map.setMarker(point.latitude, point.longitude, point.description);
          marker.events.register("mouseover", marker, function(evt) {
            document.getElementById('main-content-area').style.cursor = 'pointer';
          });
          
          marker.events.register("mouseout", marker, function(evt) {
            document.getElementById('main-content-area').style.cursor = 'default';
          });

          marker.events.register("mousedown", marker, function(evt) {
            $(document).trigger('cips-ui-callback', point);
          });
        })(arguments[i]);
      }
    }
  });
  
})(window);
