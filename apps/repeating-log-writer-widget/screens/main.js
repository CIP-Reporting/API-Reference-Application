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

  var formDefinition = null;
  var totalForms = 0;
  var totalErrors = 0;
  
  log.debug("Attempting to contact parent frame");
  if (typeof parent != 'undefined' && typeof parent.registerChildAPI == 'function') {
    parent.registerChildAPI(CIPAPI);
    log.debug("Parent contacted successfully");
  } else {
    log.debug("Failed to contact parent");
  }

  // Navigating away from main, have my children clean up after themselves
  $(document).on('cipapi-unbind', function() {
    log.debug("Cleaning up my children");
    $(document).trigger('cipapi-unbind-main');
    $('div#main-content-area > *').remove();
  });

  $(document).on('cipapi-handle-main', function(event, info) {
    var html = '' +  
      '<div id="main-content-area">' +
      '  <form class="form-inline" id="cip-repeating-log-controls" role="form" onsubmit="return false;">' +
      '    <div class="form-group">' +
      '      <div class="col-xs-2">' +
      '        <input type="number" class="form-control input-sm" id="cip-repeating-log-rows-to-add" placeholder="How Many" value="1">' +
      '      </div>' +
      '      <a href="javascript: void(0)" id="cip-repeating-log-add-more" class="btn btn-primary btn-sm"><span class="glyphicon glyphicon-plus"></span> Add More Rows</a>' +
      '      <a href="javascript: void(0)" id="cip-repeating-log-save"     class="btn btn-primary btn-sm pull-right"><span class="glyphicon glyphicon-ok"></span> Save Entries</a>' +
      '    </div>' +
      '  </form>' +
      '  <div class="clearfix"></div>' +
      '</div>';

    $('div#container').html(html);
    
    $(document).trigger('application-ready');
  });
  
  $(document).on('cipapi-set-repeating-log-form-definition', function(event) {
    if (arguments.length != 2) {
      alert("Invalid argument count");
      return;
    }
    
    var formDefinition = arguments[1]; // Integration form name on the API
    
    // Hook in a form submission engine to send back to the various logs
    formDefinition.onSubmit = function(errors, values) {
      // Do not submit if I have any issues
      if (errors) {
        totalErrors++;
        return;
      }
      
      // Do not submit if anyone has any issues
      if (totalErrors > 0) {
        return;
      }

      // Send over to the UI for processing
      $(document).trigger('cips-ui-callback', values);
      
      // Animated delete of the form then submit next :first
      $('form.form-cip-reporting:first').slideUp(function() { 
        $('#' + this.id).remove();
        var next = $('form.form-cip-reporting:first');
        if (next.length == 1) {
          $('form.form-cip-reporting:first').submit();
        } else {
          // Bring us back!
          $('#cip-repeating-log-controls').slideDown(function() {
            totalForms = 0;
            totalErrors = 0;
            
            // Force a click!
            $('a#cip-repeating-log-add-more').click();
            
            // Get rid of the overlay
            $('#overlay').remove();
            
            // And say hello!
            window.parent.alert("The entries were saved successfully");
          });
        }
      }); 
    };
    
    // Assign click handler after form definition is known
    $('a#cip-repeating-log-add-more').click(function() {
      var rowsToAdd = totalForms == 0 ? 1 : parseInt($('input#cip-repeating-log-rows-to-add').val(), 10);
      for (var i=0; i<rowsToAdd; i++) {
        var formClass = totalForms == 0 ? 'form-cip-reporting-first' : 'form-cip-reporting-additional';
        var deleteBtn = totalForms == 0 ? '' : '<img class="form-cip-reporting-delete" id="form-cip-reporting-delete-' + totalForms + '" src="icon-form-remove.png" />';
        
        $('div#main-content-area').append($('' +
          '<form class="form-cip-reporting ' + formClass + '" id="cip-repeating-log-form-' + totalForms + '" role="form">' +
          deleteBtn + '</form>'));
          
        // Allow deleting added forms
        $('img#form-cip-reporting-delete-' + totalForms).click(function() {
          var formID = this.id.replace(/form-cip-reporting-delete-/, '');
          $('form#cip-repeating-log-form-' + formID).remove();
          
          // Do some nice highlighting
          $("form.form-cip-reporting").removeClass("cip-form-alternate");
          $("form.form-cip-reporting:odd").addClass("cip-form-alternate");
        });

        CIPAPI.forms.Render(formDefinition, '#cip-repeating-log-form-' + totalForms);

        // Stop enter from submitting the forms
        $('form#cip-repeating-log-form-' + totalForms++ + ' :input').on("keypress", function(e) { return e.keyCode != 13; });
      }
      
      // Do some nice highlighting
      $("form.form-cip-reporting").removeClass("cip-form-alternate");
      $("form.form-cip-reporting:odd").addClass("cip-form-alternate");
      
      // Set the container height
      var contentHeight = $('div#main-content-area').height();
      window.parent.jQuery('#iframeapp').height(contentHeight + 'px');
    });
    
    // Kick off the addition of the first repeating entry
    $('a#cip-repeating-log-add-more').click();

    // Simulate click on add new rows if enter is pressed in the count box
    $('#cip-repeating-log-rows-to-add').keypress(function(event) {
      if (event.which == 13) {
        $('a#cip-repeating-log-add-more').click();
      }
    });
    
    // Validate and then save the entries
    $('a#cip-repeating-log-save').click(function() {
      // A little tricky, set the number of errors to 1 which effectively blocks submitting of any logs.
      // However, we will submit each form which will then add any errors to the total error count.
      // If after submitting all the forms, the error count remains at 1, we will set it to 0 and
      // resubmit.
      totalErrors = 1;
      $('form.form-cip-reporting').each(function() {
        $('#' + this.id).submit();
      });

      // If only 1 error (the pre-loaded value) submit!
      if (totalErrors == 1) {
        totalErrors = 0;
        
        // Throw an overlay over the entire area to avoid any more clicks until submitted
        $('body').append($('<div id="overlay"><div></div></div>'));
        
        // Hide the controls until we are done
        $('#cip-repeating-log-controls').slideUp();
        
        // Remove labels for submission as there is no clean UI to merge lower form into upper without
        // labels causing visual jumping around
        $('form.form-cip-reporting-first').removeClass('form-cip-reporting-first').addClass('form-cip-reporting-additional');
        
        // Must loop manually and operate on :first as submit self-deletes which screws up .each() logic.
        // This is a rube-goldberg machine and after each form deletes itself it will submit the next form!
        $('form.form-cip-reporting:first').submit();
      }
    });
  });
  
})(window);
