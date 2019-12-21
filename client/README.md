# CSESOC Projects - Notangles - Client

## Getting started

Use the commands below to run the Notangles client locally.

```
npm install
npm start
```

The client will be hosted on http://localhost:3000.

## Tech stack

The Notangles client uses 

* [React](https://reactjs.org/)
* [TypeScript](https://www.typescriptlang.org/)
* [React DND](https://react-dnd.github.io/react-dnd/)

## Logic

* The drag and drop feature uses 3 layers. The first and bottommost layer displays the timetable skeleton. The second and middle layer displays all the drop zones for a class. The third and topmost layer displays the class objects that have been dropped into the timetable. 
* The client initially fetches details of all courses from the backend and displays them in the dropdown menu.
* When a user selects a course in the dropdown menu, the client fetches more information about the selected course from the backend, which it then uses to generate draggeable class objects for that course. 
* When a class object is being dragged, the second layer is used to show all the drop zones for it according to its class times. 