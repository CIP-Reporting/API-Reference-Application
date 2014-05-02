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
