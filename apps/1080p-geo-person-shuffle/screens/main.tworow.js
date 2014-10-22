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
  if (typeof CIPAPI.main == 'undefined') CIPAPI.main = {};
  if (typeof CIPAPI.main.tworow == 'undefined') CIPAPI.main.tworow = {};

  var log = log4javascript.getLogger("CIPAPI.main.tworow");
  
  var lastShuffle = $.now();
  
  // Global map references
  CIPAPI.main.tworow.map0 = null;
  CIPAPI.main.tworow.map1 = null;

  // Actual number of real rows rendered  
  CIPAPI.main.tworow.rows = 0;
  
  // Unbind any globals for memory cleanup
  $(document).on('cipapi-unbind-main', function(event, info) {
    log.debug("Cleaning up maps");
    
    if (CIPAPI.main.tworow.map0 !== null) {
      CIPAPI.main.tworow.map0.destroy();
      CIPAPI.main.tworow.map0 = null;
    }
    
    if (CIPAPI.main.tworow.map1 !== null) {
      CIPAPI.main.tworow.map1.destroy();
      CIPAPI.main.tworow.map1 = null;
    }
  });

  // On change interval pass the event into the two row handler (if one exists)
  $(document).on('cipapi-timing-1sec', function(event, info) {
    // If paused, do nothing...
    if ($('a#view-layout-play span.glyphicon-pause').length > 0) {
      return;
    }

    var timingEvent = undefined === CIPAPI.config.twoRowInterval ? 'cipapi-timing-10sec' : CIPAPI.config.twoRowInterval;
    if (!CIPAPI.timing.shouldFire(lastShuffle, timingEvent)) {
      return; // Not the right time...
    }
    
    // On initialization this holds off the rotation for a defined number of passes to avoid rotating into the second
    // page before initialized.  We are racing against the 5 second inverval, it could fire immidiately.
    if (CIPAPI.main.tworow.rotateDebounce > 0) {
      CIPAPI.main.tworow.rotateDebounce--;
      return;
    }
    
    showNext();
    lastShuffle = $.now();
  });

  // Manual next and previous buttons
  $(document).on('cipapi-update-main-next', function() { showNext(); });
  $(document).on('cipapi-update-main-prev', function() { showPrev(); });

  function showNext() {
    if (CIPAPI.main.tworow.rows == 2) return; // Nothing to cyle
    
    $('div.tworow div.active').each(function() {
      var active = $(this);
      var next = active.next();
      
      // At the end?
      if (next.length == 0) {
        next = active.siblings().first();
      }
      
      // Swap em out!
      setMovableMarkerByElement(next.get());
      active.animate({ height: "hide" }, CIPAPI.config.visualEasingTimer, CIPAPI.config.visualEaseOut, function() { active.removeClass('active'); });
      next.hide().addClass('active').animate({ height: "show" }, CIPAPI.config.visualEasingTimer, CIPAPI.config.visualEaseIn);
    });
  }
  
  function showPrev() {
    if (CIPAPI.main.tworow.rows == 2) return; // Nothing to cyle
    
    $('div.tworow div.active').each(function() {
      var active = $(this);
      var prev = active.prev();
      
      // At the end?
      if (prev.length == 0) {
        prev = active.siblings().last();
      }
      
      // Swap em out!
      setMovableMarkerByElement(prev.get());
      active.animate({ height: "hide" }, CIPAPI.config.visualEasingTimer, CIPAPI.config.visualEaseOut, function() { active.removeClass('active'); });
      prev.hide().addClass('active').animate({ height: "show" }, CIPAPI.config.visualEasingTimer, CIPAPI.config.visualEaseIn);
    });
  }

  function setMovableMarkerByElement(elem) {
    var child = $(elem);
    var row = child.attr('data-row');
    var latitude = child.attr('data-latitude');
    var longitude = child.attr('data-longitude');

    if (row == '0' && CIPAPI.main.tworow.map0 !== null) {
      CIPAPI.main.tworow.map0.setMovableMarker(latitude, longitude);
    }

    if (row == '1' && CIPAPI.main.tworow.map1 !== null) {
      CIPAPI.main.tworow.map1.setMovableMarker(latitude, longitude);
    }
  }
  
  $(document).on('cipapi-update-main-tworow', function(event, info) {
    var html = '' +
      '<div class="tworow">' +
      '  <div class="row">' +
      '    <div class="col-lg-8" id="tworow-row-0"></div>' +
      '    <div class="col-lg-4"><div class="tworow-map" id="tworow-map-0"></div></div>' +
      '  </div>' +
      '  <div class="row">' +
      '    <div class="col-lg-8" id="tworow-row-1"></div>' +
      '    <div class="col-lg-4"><div class="tworow-map" id="tworow-map-1"></div></div>' +
      '  </div>' +
      '</div>';

    $('div#main-content-area').html(html);
    $('h1.view-description').text(info.metadata.description);
    CIPAPI.main.tworow.rotateDebounce = 1;
    
    // Draw me some map
    CIPAPI.main.tworow.map0 = CIPAPI.components.map('tworow-map-0', 25);
    CIPAPI.main.tworow.map1 = CIPAPI.components.map('tworow-map-1', 25);

    var firstTwo = 2;
    function renderRow(offset, response, content) {
      content.attr('data-latitude',  response.data.item[0].data.latitude);
      content.attr('data-longitude', response.data.item[0].data.longitude);

      // Initialize the first two!
      if (firstTwo > 0) {
        setMovableMarkerByElement(content.get());
        firstTwo--;
      }
      
      var credentials = CIPAPI.credentials.get();
      if (response.data.item[0].data.media_total > 0 && response.data.item[0].data.media_first.match(/^image/i)) {
        content.append('<div class="tworow-photo"><img data-scale="best-fit" src="' + credentials.host + response.data.item[0].data.media_link + '/1?token=' + CIPAPI.me.token + '" /></div>');
      } else {
        // No image available!      
        content.append('<div class="tworow-photo"><img data-scale="best-fit" data-src="lib/holder.js/600x460/auto/#777:#ccc/text:No Image Available"></div>')
        Holder.run();
      }
      
      // Auto-size the images just added
      content.find('div.tworow-photo img').bind('load', function() { $(this).imageScale(); });
      
      var textArea = $('<div class="textarea"></div>');
      
      var name = $.trim((response.data.item[0].data.first_name + ' ' +
        response.data.item[0].data.middle_name + ' ' +
        response.data.item[0].data.last_name).replace(/\s+/, ' '));
        
      var h2 = $('<h2></h2>');
      textArea.append(h2);
      h2.text(name);
      
      var fields = CIPAPI.main.getValuesAsArrays(response.data.item[0].data);
      for (var i=0; i<fields.length; i++) {
        var p = $('<p></p>');
        textArea.append(p);
        p.text(fields[i]);
      }
      
      content.append(textArea);
    }
    
    function tryRenderRow() {
      // Since the divs are not in sequential order (interleved between two div rows) we have to iterate and hunt for the
      // lowest offset each time so that the loading happens in the order of the shuffle.
      var bestNode = null;
      $('div.tworow div[data-loaded="false"]').each(function(i) {
        if (bestNode === null) {
          bestNode = $(this);
          return;
        }
        
        var thisNode = $(this);
        var thisOffset = parseInt(thisNode.attr('data-offset'), 10);
        var bestOffset = parseInt(bestNode.attr('data-offset'), 10);
        
        if (thisOffset < bestOffset) {
          bestNode = thisNode;
        }
      });

      // Render the best node found (if any)      
      if (bestNode !== null) {
        var offset = bestNode.attr('data-offset');
        var url = bestNode.attr('data-url');
        
        log.debug("Loading best node (" + offset + ")");

        CIPAPI.rest.GET({
          url: url,
          success: function(response) {
            // Inject data from the outer search results
            var distance = parseInt(info.data.item[offset].data.distance, 10);
            response.data.item[0].data.distance = distance < 0 || distance > 12500 ? 'Unknown' : distance;
            
            if (parseInt(response.data.item[0].data.weight, 10) > 0) {
              response.data.item[0].data.weight += ' Lbs';
            }
            
            if (response.data.item[0].data.race == 'Unknown') {
              response.data.item[0].data.race = '';
            }
            
            response.data.item[0].data.reports = info.data.item[offset].data.reports;
            renderRow(offset, response, bestNode);
            
            bestNode.attr('data-loaded', 'true');
            
            // Kick the next one off
            setTimeout(tryRenderRow, 100);
          }
        });
      };
    }
    
    // Kick off the actual initialization
    CIPAPI.main.tworow.rows = info.data.item.length - (info.data.item.length % 2);
    log.debug('Number of items: ' + CIPAPI.main.tworow.rows);
    for (var i=0; i<CIPAPI.main.tworow.rows; i++) {
      // Put an ordered sequential place holder in to hold the future content (comes back out of order usually)
      $('#tworow-row-' + (i & 1)).append('<div id="column_item_' + i + '"' + (i < 2 ? ' class="active" ' : ' ') +
          'data-loaded="false" ' +
          'data-url="' + info.data.item[i].link + '" ' +
          'data-offset="' + i + '"' +
          'data-row="' + (i & 1) + '"' +
        '></div>');
    }
    
    // Kick off the person loading
    tryRenderRow(); // Render first node
  });

})(window);
