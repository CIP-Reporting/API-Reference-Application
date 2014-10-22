# repeating-log-writer-widget

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

To use the application simply extract this archive on the host
or place this archive onto a web server and open then configure
an iFrame application within CIP Reporting using the following URL:

[Path to Files]/apps/repeating-log-writer-widget/index.html

This application does not function well individually because it has
heavy bi-directional interaction with the CIP Reporting UI and
workflow systems to create custom experiences for the user.  This
application does make a good reference for embedding an iFrame
application within CIP Reporting.
