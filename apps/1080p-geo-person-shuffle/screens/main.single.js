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
  if (typeof CIPAPI.main.single == 'undefined') CIPAPI.main.single = {};

  var log = log4javascript.getLogger("CIPAPI.main.single");

  // Global map references
  CIPAPI.main.single.map = null;
  
  // Unbind any globals for memory cleanup
  $(document).on('cipapi-unbind-main', function(event, info) {
    log.debug("Cleaning up maps");
    if (CIPAPI.main.single.map !== null) {
      CIPAPI.main.single.map.destroy();
      CIPAPI.main.single.map = null;
    }
  });

  // On change interval pass the event into the update handler (if one exists)
  $(document).on('cipapi-timer-tick', function(event, info) {
    // If paused, do nothing...
    if ($('a#view-layout-play span.glyphicon-pause').length > 0) {
      return;
    }

    var desiredTick = undefined === CIPAPI.config.singleInterval ? 'cipapi-timing-5sec' : CIPAPI.config.singleInterval;
    if (desiredTick != info) {
      return; // Not the right time...
    }
    
    // On initialization this holds off the rotation for a defined number of passes to avoid rotating into the second
    // page before initialized.  We are racing against the 5 second inverval, it could fire immidiately.
    if (CIPAPI.main.single.rotateDebounce > 0) {
      CIPAPI.main.single.rotateDebounce--;
      return;
    }
    
    showNext();
  });

  // Manual next and previous buttons
  $(document).on('cipapi-update-main-next', function() { showNext(); });
  $(document).on('cipapi-update-main-prev', function() { showPrev(); });

  function showNext() {
    $('div.single div#single-data-row div.active').each(function() {
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
    $('div.single div#single-data-row div.active').each(function() {
      var active = $(this);
      var prev = active.prev();
      
      // At the end?
      if (prev.length == 0) {
        prev = active.siblings().first();
      }
      
      // Swap em out!
      setMovableMarkerByElement(prev.get());      
      active.animate({ height: "hide" }, CIPAPI.config.visualEasingTimer, CIPAPI.config.visualEaseOut, function() { active.removeClass('active'); });
      prev.hide().addClass('active').animate({ height: "show" }, CIPAPI.config.visualEasingTimer, CIPAPI.config.visualEaseIn);
    });
  }

  function setMovableMarkerByElement(elem) {
    var child = $(elem);
    var latitude = child.attr('data-latitude');
    var longitude = child.attr('data-longitude');
    var textHTML = child.find('div.hidden-text').html();
    $('div.single div#single-text').html(textHTML);
    
    if (CIPAPI.main.single.map !== null) {
      CIPAPI.main.single.map.setMovableMarker(latitude, longitude);
    }
  }
  
  $(document).on('cipapi-update-main-single', function(event, info) {
    var html = '' +
      '<div class="single">' +
      '  <div class="row">' +
      '    <div id="single-data-row" class="col-lg-6"></div>' +
      '    <div class="col-lg-6">' +
      '      <div class="single-text" id="single-text"></div>' +
      '      <div class="single-map" id="single-map"></div>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    $('div#main-content-area').html(html);
    $('h1.view-description').text(info.metadata.description);
    CIPAPI.main.single.rotateDebounce = 1;
    
    // Draw me some map
    CIPAPI.main.single.map = CIPAPI.components.map('single-map', 25);

    var firstOne = true;
    function renderNode(offset, response, content) {
      content.attr('data-latitude',  response.data.item[0].data.latitude);
      content.attr('data-longitude', response.data.item[0].data.longitude);

      var credentials = CIPAPI.credentials.get();
      if (response.data.item[0].data.media_total > 0 && response.data.item[0].data.media_first.match(/^image/i)) {
        content.append('<div class="single-photo"><img data-scale="best-fit" src="' + credentials.host + response.data.item[0].data.media_link + '/1?token=' + CIPAPI.me.token + '" /></div>');
      } else {
        // No image available!      
        content.append('<div class="single-photo"><img data-scale="best-fit" data-src="lib/holder.js/925x970/auto/#777:#ccc/text:No Image Available"></div>')
        Holder.run();
      }
      
      // Auto-size the images just added
      content.find('div.single-photo img').bind('load', function() { $(this).imageScale(); });
      
      var textArea = $('<div class="hidden-text"></div>');
      
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
      
      // Initialize just the first map location!
      if (firstOne) {
        setMovableMarkerByElement(content.get());
        firstOne = false;
      }
    }
    
    function tryRenderNode() {
      $('div.single #single-data-row div[data-loaded="false"]:first').each(function() {
        var node = $(this);
        var offset = node.attr('data-offset');
        var url = node.attr('data-url');
        
        CIPAPI.rest.GET({
          url: url,
          success: function(response) {
            // Inject data from the outer search results
            var distance = parseInt(info.data.item[offset].data.distance, 10);
            response.data.item[0].data.distance = distance < 0 || distance > 12500 ? 'Unknown' : distance;
            response.data.item[0].data.reports = info.data.item[offset].data.reports;
            renderNode(offset, response, node);
            
            node.attr('data-loaded', 'true');
            
            // Kick the next one off
            setTimeout(tryRenderNode, 100);
          }
        });
      });
    }
    
    // Kick off the actual initialization
    log.debug('Number of items: ' + info.data.item.length);
    for (var i=0; i<info.data.item.length; i++) {
      // Put an ordered sequential place holder in to hold the future content (comes back out of order usually)
      $('div.single #single-data-row').append('<div id="column_item_' + i + '"' + (i == 0 ? ' class="active" ' : ' ') +
          'data-loaded="false" ' +
          'data-url="' + info.data.item[i].link + '" ' +
          'data-offset="' + i + '"' +
        '></div>');
    }
    
    // Kick off the person loading
    tryRenderNode(); // Render first node
  });

})(window);
