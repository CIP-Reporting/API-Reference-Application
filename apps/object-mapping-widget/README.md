# object-mapping-widget

This is an embeddable HTML5 web application designed to be
embedded into an iFrame application page within CIP Reporting.
This external application can be used to display a map and place
markers which can be clicked by the user to perform actions.

A typical application for this would be to display markers on a
map representing where incidents occurred or where objects exist.
These markers can then be clicked by the user to expand into more
information.

To use the application simply extract this archive on the host
or place this archive onto a web server and open then configure
an iFrame application within CIP Reporting using the following URL:

[Path to Files]/apps/object-mapping-widget/index.html

This application does not function well individually because it has
heavy bi-directional interaction with the CIP Reporting UI and
workflow systems to create custom experiences for the user.  This
application does make a good reference for embedding an iFrame
application within CIP Reporting.
