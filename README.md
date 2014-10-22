# CIP Reporting API Reference Applications

This project exists to further develop the CIP Reporting RESTful web
API.  The primary deliverable of this project is a library used to 
simplify the access and usage of the CIP Reporting RESTful API.  You 
are encouraged to use this library to build your own applications 
against our API.

To assist us in developing the API, a series of reference applications
also being developed and packaged with this project.  These reference 
applications serve as a reference to other developers as to how our 
API works, how the API library works, how to write HTML5 applications 
against our API, and best practices.

## Distribution Files

### CIPAPI Folder

The CIPAPI folder contains the library authored by CIP Reporting for
accessing the CIP Reporting API.

### lib Folder

The lib folder contains 3rd party libraries used by the CIPAPI library
and / or the reference applications

### phonegap Folder

The phonegap folder contains resources necessary to package any
reference application in the apps folder as a phonegap application.
The packaging script requires PHP for execution which you can run
with no arguments to display the built in help.

### apps Folder

The apps folder contains reference applications using both the API
itself and the API library.

## Reference Applications

### cip-reporting-mobile-application

This is an Adobe Phonegap based mobile application which can query
the API of a CIP Reporting server for a list of reports or forms
which can be authored by the current user credentials.

The mobile application fetches all known form definitions from the
CIP Reporting server and is capable of authoring reports offline.
When a connection is available the reports which have been written
will be submitted in the background with notifications.

The mobile application makes use of Phonegap features such as
GPS location and direct camera access.

### 1080p-geo-person-shuffle

This is a stand-alone HTML5 web application which can query 
the API of a CIP Reporting server for person views to display 
on a full-screen 1080p display.

The application includes several visualization engines which
are applied randomly to the available views.  Each visualization
engine includes geo-spatial mapping of locations.

### mobile-integration-report-writer

This is a stand-alone HTML5 web application which can query 
the API of a CIP Reporting server for a list of reports or forms
which can be authored by the current user credentials.

The application presents a simple user interface that works on
both desktop and mobile devices.  The user interface gives a
button menu to select which form to write.  Most all fields 
within CIP Reporting are supported over the API forms engine.

### object-mapping-widget

This is an embeddable HTML5 web application designed to be
embedded into an iFrame application page within CIP Reporting.
This external application can be used to display a map and place
markers which can be clicked by the user to perform actions.

A typical application for this would be to display markers on a
map representing where incidents occurred or where objects exist.
These markers can then be clicked by the user to expand into more
information.

### repeating-log-writer-widget

This is an embeddable HTML5 web application designed to be
embedded into an iFrame application page within CIP Reporting.
This external application can be used to create and save batches
of simple log entries for bulk data entry.

A theoretical application for this widget could assume you need to
have a unique log entry for every person working on a certain shift.
If you had more than say 10 people working on a shift entering the
log entries could be very time consuming.  This widget could be used
to enter the employee names in a single batch and submit them all at
once.  The system will generate log entries for each of the names.
