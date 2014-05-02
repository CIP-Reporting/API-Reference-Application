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

  var firstShuffle = true;
  
  // Navigating away from main, have my children clean up after themselves
  $(document).on('cipapi-unbind', function() {
    log.debug("Cleaning up my children");
    $(document).trigger('cipapi-unbind-main');
    $('div#main-content-area > *').remove();
  });

  // Common to all layouts
  CIPAPI.main.getValuesAsArrays = function (data) {
    var map = CIPAPI.config.fieldRenderingMap;

    var values = [];
    for (var i=0; i<map.length; i++) {
      var empty = sprintf(map[i], { });
      var after = sprintf(map[i], data);
      if (empty != after) {
        values.push($.trim(after));
      }
    }
    
    return values;
  }
  
  // On change interval rotate the carousel (if one exists)
  $(document).on('cipapi-timer-tick', function(event, info) {
    // If paused, do nothing...
    if ($('a#view-layout-play span.glyphicon-pause').length > 0) {
      return;
    }
    
    var desiredTick;
    if (firstShuffle) {
      desiredTick = undefined === CIPAPI.config.firstShuffleInterval ? 'cipapi-timing-5sec' : CIPAPI.config.firstShuffleInterval;
      firstShuffle = false;
    } else {
      desiredTick = undefined === CIPAPI.config.shuffleInterval ? 'cipapi-timing-1min' : CIPAPI.config.shuffleInterval;
    }
    
    if (desiredTick != info) {
      return; // Not the right time...
    }

    // Shuffle it up!
    $('a#shuffle-view-layout').click();
  });

  $(document).on('cipapi-handle-main', function(event, info) {
    var html = '' +  
      '<div class="navbar navbar-inverse navbar-fixed-top" role="navigation">' +
      '  <h1 class="view-description"></h1>' + 
      '  <div class="navbar-header">' +
      '    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">' +
      '      <span class="sr-only">Toggle navigation</span>' +
      '      <span class="icon-bar"></span>' +
      '      <span class="icon-bar"></span>' +
      '      <span class="icon-bar"></span>' +
      '    </button>' +
      '  </div>' +
      '  <div class="navbar-collapse collapse">' +
      '    <ul class="nav navbar-nav">' +
      '      <li class="dropdown views">' +
      '        <a href="javascript:void(0)" class="dropdown-toggle" data-toggle="dropdown"><span id="view-selection" class="dropdown-title">Select View</span> <b class="caret"></b></a>' +
      '        <ul id="main-dropdown-views" class="dropdown-menu">' +
      '        </ul>' +
      '      </li>' +
      '      <li class="dropdown layouts">' +
      '        <a href="javascript:void(0)" class="dropdown-toggle" data-toggle="dropdown"><span id="layout-selection" class="dropdown-title">Select Layout</span> <b class="caret"></b></a>' +
      '        <ul id="main-dropdown-layouts" class="dropdown-menu">' +
      '        </ul>' +
      '      </li>' +
      '    </ul>' +
      '    <ul class="nav navbar-nav navbar-right">' +
      '      <li><a id="shuffle-view-layout" href="javascript:void(0)"><span class="glyphicon glyphicon-random"></span></a></li>' +
      '      <li><a id="view-layout-prev" href="javascript:void(0)"><span class="glyphicon glyphicon-step-backward"></span></a></li>' +
      '      <li><a id="view-layout-play" href="javascript:void(0)"><span class="glyphicon glyphicon-play"></span></a></li>' +
      '      <li><a id="view-layout-next" href="javascript:void(0)"><span class="glyphicon glyphicon-step-forward"></span></a></li>' +
      '      <li class="dropdown">' +
      '        <a href="javascript:void(0)" class="dropdown-toggle" data-toggle="dropdown"><span class="glyphicon glyphicon-cog"></span></a>' +
      '        <ul class="dropdown-menu">' +
      '          <li><a href="#logout">Log Out</a></li>' +
      '        </ul>' +
      '      </li>' +
      '    </ul>' +
      '  </div>' +
      '</div>' +
      '<div id="main-content-area"></div>';
    
    $('div#container').html(html);

    // Make sure first shuffle is true AFTER rendering the HTML ...
    firstShuffle = true;
    
    // Add enabled layouts
    $.each(CIPAPI.config.availableLayouts, function(key, value) {
      $('ul#main-dropdown-layouts').append('<li><a class="data-layout" data-title="' + value + '" data-link="' + key + '" href="javascript:void(0)">' + value + '</a></li>');
    });
    
    // Play / Pause, Next, and Previous Buttons
    $('a#view-layout-play').click(function() { $(this).find('span').toggleClass('glyphicon-play').toggleClass('glyphicon-pause'); });
    $('a#view-layout-next').click(function() { $(document).trigger('cipapi-update-main-next'); });
    $('a#view-layout-prev').click(function() { $(document).trigger('cipapi-update-main-prev'); });
    
    // Shuffle it up!
    $('a#shuffle-view-layout').click(function() {
      var lastView = $('span#view-selection').text();
      var lastLayout = $('span#layout-selection').text();
      
      $('span#view-selection').text('Select View').removeAttr('data-link').removeAttr('data-title');
      $('span#layout-selection').text('Select Layout').removeAttr('data-link').removeAttr('data-title');
      
      refreshViewList(false, function() {
        var views = $('li.views a.data-view');
        views = $.grep(views, function(el, i) { return $(el).text() != lastView; });
        $(views[Math.floor(Math.random()*views.length)]).click();

        var layouts = $('li.layouts a.data-layout');
        layouts = $.grep(layouts, function(el, i) { return $(el).text() != lastLayout; });
        $(layouts[Math.floor(Math.random()*layouts.length)]).click();
      });
    });
    
    // Rebuild the view list
    function refreshViewList(initialize, callback) {
      // Clear all previous views
      $('ul#main-dropdown-views > *').remove();
      
      CIPAPI.rest.GET({
        url: '/api/versions/current/views',
        order: 'asc',
        sort: 'name',
        success: function(response) {
          // Fill in the views drop down
          log.debug("Adding " + response.data.item.length + " views");
          for (var i=0; i<response.data.item.length; i++) {
            $('ul#main-dropdown-views').append(
              $('<li></li>').append(
                $('<a class="data-view" href="javascript:void(0)"></a>').text(response.data.item[i].title)
                  .attr('data-link',  response.data.item[i].link)
                  .attr('data-title', response.data.item[i].title)
            ));
          }

          // Detach all previous click handlers (consider shuffle on layouts)
          $(".dropdown-menu li a").unbind("click");
          
          // Setup a click handle for changes to the views or layouts
          $(".dropdown-menu li a").click(function(){
            var me = $(this);
            me.closest('li.dropdown').find('span.dropdown-title')
              .text(me.attr('data-title'))
              .attr('data-link',  me.attr('data-link'))
              .attr('data-title', me.attr('data-title'));
            
            var viewSelection = $('span#view-selection').attr('data-title');
            var layoutSelection = $('span#layout-selection').attr('data-title');
            
            if (viewSelection !== undefined && layoutSelection !== undefined) {
              CIPAPI.router.goTo('main', { view: viewSelection, layout: layoutSelection });
            }
          });
          
          // If initializing vs. refreshing, attempt to render the current URL
          if (initialize) {
            // If view or layout was provided in the parameters simulate a click to those links if they exist
            if (undefined !== info.params.view) {
              $("li.views a[data-title='" + info.params.view + "']").click();
            }

            if (undefined !== info.params.layout) {
              $("li.layouts a[data-title='" + info.params.layout + "']").click();
            }
          }

          // Call back at the end if provided
          if (undefined !== callback) {
            callback();
          }
        }
      });
    }

    refreshViewList(true); // A must do once!
  });
  
  // Do some drawing!
  $(document).on('cipapi-update-main', function(event, info) {
    if (undefined === info.params.view || undefined === info.params.view) {
      if (undefined === info.params.view) {
        $('span#view-selection').text('Select View').removeAttr('data-link').removeAttr('data-title');
      }
      
      if (undefined === info.params.layout) {
        $('span#layout-selection').text('Select Layout').removeAttr('data-link').removeAttr('data-title');
      }
      
      $('div#main-content-area > *').remove();
      $(document).trigger('cipapi-unbind-main');
      log.debug("Not updating - incomplete URL");
      return; 
    }

    var view = $("li.views a[data-title='" + info.params.view + "']").attr('data-link');
    var layout = $("li.layouts a[data-title='" + info.params.layout + "']").attr('data-link');
    
    if (undefined === view || undefined === layout) {
      log.debug("Not updating - invalid URL");
      return; 
    }
    
    firstShuffle = false; // Do not perform first shuffle if already rendered
    
    CIPAPI.rest.GET({
      url: view,
      order: 'rand',
      fields: [ 'distance', 'reports' ],
      success: function(response) {
        // Clean up ... Clean up ... Everybody Clean up...
        $(document).trigger('cipapi-unbind-main');
        $('div#main-content-area > *').remove();

        // Fire it off to the renderer
        log.debug("Rendering view: cipapi-update-main-" + layout);
        $(document).trigger('cipapi-update-main-' + layout, response);
      }
    });
  });
  
})(window);
