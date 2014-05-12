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
  if (typeof CIPAPI.main.fourcolumn == 'undefined') CIPAPI.main.fourcolumn = {};

  var log = log4javascript.getLogger("CIPAPI.main.fourcolumn");
  
  // Global map references
  CIPAPI.main.fourcolumn.map0 = null;
  CIPAPI.main.fourcolumn.map1 = null;
  CIPAPI.main.fourcolumn.map2 = null;
  CIPAPI.main.fourcolumn.map3 = null;

  // Actual number of real columns rendered  
  CIPAPI.main.fourcolumn.cols = 0;
  
  // Unbind any globals for memory cleanup
  $(document).on('cipapi-unbind-main', function(event, info) {
    log.debug("Cleaning up maps");
    
    if (CIPAPI.main.fourcolumn.map0 !== null) {
      CIPAPI.main.fourcolumn.map0.destroy();
      CIPAPI.main.fourcolumn.map0 = null;
    }
    
    if (CIPAPI.main.fourcolumn.map1 !== null) {
      CIPAPI.main.fourcolumn.map1.destroy();
      CIPAPI.main.fourcolumn.map1 = null;
    }
    
    if (CIPAPI.main.fourcolumn.map2 !== null) {
      CIPAPI.main.fourcolumn.map2.destroy();
      CIPAPI.main.fourcolumn.map2 = null;
    }
    
    if (CIPAPI.main.fourcolumn.map3 !== null) {
      CIPAPI.main.fourcolumn.map3.destroy();
      CIPAPI.main.fourcolumn.map3 = null;
    }
  });

  // On change interval pass the event into the 4 column handler (if one exists)
  $(document).on('cipapi-timer-tick', function(event, info) {
    // If paused, do nothing...
    if ($('a#view-layout-play span.glyphicon-pause').length > 0) {
      return;
    }

    var desiredTick = undefined === CIPAPI.config.fourColumnInterval ? 'cipapi-timing-15sec' : CIPAPI.config.fourColumnInterval;
    if (desiredTick != info) {
      return; // Not the right time...
    }
    
    // On initialization this holds off the rotation for a defined number of passes to avoid rotating into the second
    // page before initialized.  We are racing against the 5 second inverval, it could fire immidiately.
    if (CIPAPI.main.fourcolumn.rotateDebounce > 0) {
      CIPAPI.main.fourcolumn.rotateDebounce--;
      return;
    }
    
    showNext();
  });

  // Manual next and previous buttons
  $(document).on('cipapi-update-main-next', function() { showNext(); });
  $(document).on('cipapi-update-main-prev', function() { showPrev(); });

  function showNext() {
    if (CIPAPI.main.fourcolumn.cols == 4) return; // Nothing to cycle
    
    $('div#fourcolumn-columns div.active').each(function() {
      var active = $(this);
      var next = active.next();
      
      // At the end?
      if (next.length == 0) {
        next = active.siblings().first();
      }
      
      // Swap em out!
      next.find('div.col-lg-3').each(function(i, elem) { setMovableMarkerByElement(elem); });
      active.animate({ height: "hide" }, CIPAPI.config.visualEasingTimer, CIPAPI.config.visualEaseOut, function() { active.removeClass('active'); });
      next.hide().addClass('active').animate({ height: "show" }, CIPAPI.config.visualEasingTimer, CIPAPI.config.visualEaseIn);
    });
  }
  
  function showPrev() {
    if (CIPAPI.main.fourcolumn.cols == 4) return; // Nothing to cycle
    
    $('div#fourcolumn-columns div.active').each(function() {
      var active = $(this);
      var prev = active.prev();
      
      // At the beginning?
      if (prev.length == 0) {
        prev = active.siblings().last();
      }
      
      // Swap em out!
      prev.find('div.col-lg-4').each(function(i, elem) { setMovableMarkerByElement(elem); });
      active.animate({ height: "hide" }, CIPAPI.config.visualEasingTimer, CIPAPI.config.visualEaseOut, function() { active.removeClass('active'); });
      prev.hide().addClass('active').animate({ height: "show" }, CIPAPI.config.visualEasingTimer, CIPAPI.config.visualEaseIn);
    });
  }

  function setMovableMarkerByElement(elem) {
    var child = $(elem);
    var column = child.attr('data-column');
    var latitude = child.attr('data-latitude');
    var longitude = child.attr('data-longitude');

    if (column == '0' && CIPAPI.main.fourcolumn.map0 !== null) {
      CIPAPI.main.fourcolumn.map0.setMovableMarker(latitude, longitude);
    }
    
    if (column == '1' && CIPAPI.main.fourcolumn.map1 !== null) {
      CIPAPI.main.fourcolumn.map1.setMovableMarker(latitude, longitude);
    }
    
    if (column == '2' && CIPAPI.main.fourcolumn.map2 !== null) {
      CIPAPI.main.fourcolumn.map2.setMovableMarker(latitude, longitude);
    }
    
    if (column == '3' && CIPAPI.main.fourcolumn.map3 !== null) {
      CIPAPI.main.fourcolumn.map3.setMovableMarker(latitude, longitude);
    }
  }
  
  $(document).on('cipapi-update-main-fourcolumn', function(event, info) {
    var html = '' +
      '<div class="fourcolumn">' +
      '  <div class="row">' +
      '    <div class="col-lg-3"><div class="fourcolumn-map" id="fourcolumn-map-0"></div></div>' +
      '    <div class="col-lg-3"><div class="fourcolumn-map" id="fourcolumn-map-1"></div></div>' +
      '    <div class="col-lg-3"><div class="fourcolumn-map" id="fourcolumn-map-2"></div></div>' +
      '    <div class="col-lg-3"><div class="fourcolumn-map" id="fourcolumn-map-3"></div></div>' +
      '  </div>' +
      '  <div id="fourcolumn-columns"></div>' +
      '</div>';

    $('div#main-content-area').html(html);
    $('h1.view-description').text(info.metadata.description);
    CIPAPI.main.fourcolumn.rotateDebounce = 1;
    
    // Draw me some map
    CIPAPI.main.fourcolumn.map0 = CIPAPI.components.map('fourcolumn-map-0', 25);
    CIPAPI.main.fourcolumn.map1 = CIPAPI.components.map('fourcolumn-map-1', 25);
    CIPAPI.main.fourcolumn.map2 = CIPAPI.components.map('fourcolumn-map-2', 25);
    CIPAPI.main.fourcolumn.map3 = CIPAPI.components.map('fourcolumn-map-3', 25);

    var firstFour = 4;
    function renderColumn(offset, response, content) {
      content.attr('data-latitude',  response.data.item[0].data.latitude);
      content.attr('data-longitude', response.data.item[0].data.longitude);

      // Initialize the first four!
      if (firstFour > 0) {
        setMovableMarkerByElement(content.get());
        firstFour--;
      }

      var credentials = CIPAPI.credentials.get();
      if (response.data.item[0].data.media_total > 0 && response.data.item[0].data.media_first.match(/^image/i)) {
        content.append('<div class="fourcolumn-photo"><img data-scale="best-fit" src="' + credentials.host + response.data.item[0].data.media_link + '/1?token=' + CIPAPI.me.token + '" /></div>');
      } else {
        // No image available!      
        content.append('<div class="fourcolumn-photo"><img data-scale="best-fit" data-src="lib/holder.js/450x512/auto/#777:#ccc/text:No Image Available"></div>')
        Holder.run();
      }
      
      // Auto-size the images just added
      content.find('div.fourcolumn-photo img').bind('load', function() { $(this).imageScale(); });
      
      var name = $.trim((response.data.item[0].data.first_name + ' ' +
        response.data.item[0].data.middle_name + ' ' +
        response.data.item[0].data.last_name).replace(/\s+/, ' '));
      
      var contentArea = $('<div class="fourcolumn-content"></div>');
      
      var h2 = $('<h2></h2>');
      contentArea.append(h2);
      h2.text(name);
      
      var fields = CIPAPI.main.getValuesAsArrays(response.data.item[0].data);
      for (var i=0; i<fields.length; i++) {
        var p = $('<p></p>');
        contentArea.append(p);
        p.text(fields[i]);
      }
      
      content.append(contentArea);
    }
    
    function tryRenderColumn() {
      $('div#fourcolumn-columns div[data-loaded="false"]:first').each(function(i) {
        var node = $(this);
        var offset = node.attr('data-offset');
        var url = node.attr('data-url');
        
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
            renderColumn(offset, response, node);
            
            node.attr('data-loaded', 'true');
            
            // Kick the next one off
            setTimeout(tryRenderColumn, 100);
          }
        });
      });
    }
    
    // Kick off the actual initialization
    CIPAPI.main.fourcolumn.cols = info.data.item.length - (info.data.item.length % 4);
    log.debug('Number of items: ' + CIPAPI.main.fourcolumn.cols);
    var theRow = null;
    var numRows = 0; var colNum = 0;
    for (var i=0; i<CIPAPI.main.fourcolumn.cols; i++) {
      // Lazy initialize the row
      if (theRow === null) {
        theRow = $('<div class="row' + (i == 0 ? ' active' : '') + '"></div>');
      }
      
      // Put an ordered sequential place holder in to hold the future content (comes back out of order usually)
      theRow.append('<div id="column_item_' + i + '" class="col-lg-3"' +
          'data-loaded="false" ' +
          'data-url="' + info.data.item[i].link + '" ' +
          'data-offset="' + i + '"' +
          'data-column="' + colNum++ + '"' +
        '></div>');
      
      // Time to move on to a new row
      if (theRow.children().length == 4) {
        $('div#fourcolumn-columns').append(theRow);
        theRow = null; // Lazy init
        numRows++;
        colNum = 0;
      }
    }
    
    // Add the remaining columns ONLY if there was not at least ONE full row, this tries to avoid showing a row
    // with one or two people - try to keep them plump and filled out.
    if (numRows == 0 && theRow !== null) {
      $('div#fourcolumn-columns').append(theRow);
    }
    
    // Kick off the person loading
    tryRenderColumn(); // Render first node
  });

})(window);
