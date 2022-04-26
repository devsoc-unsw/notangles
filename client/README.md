# Notangles Client

The Notangles client allows users to interactively plan out their timetables with the latest course information using a simple drag-and-drop system.

## Installation

The client has been verified to work with:

- npm v8.3.1
- node v16.14.0

In the root client directory `client`, run `npm install` to install all the dependencies.

## Running

Use `npm start` to host the Notangles client locally. The client will be hosted on http://localhost:3000.

Recommended: To connect to the real timetabling server, use `npm run start:mock` instead.

## Tech stack

The Notangles client uses

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [MUI](https://mui.com/)

## Logic

- The drag and drop feature uses 3 layers. The first and bottommost layer displays the timetable skeleton. The second and middle layer displays all the drop zones for a class. The third and topmost layer displays the class objects that have been dropped into the timetable.
- The client initially fetches details of all courses from the backend and displays them in the dropdown menu.
- When a user selects a course in the dropdown menu, the client fetches more information about the selected course from the backend, which it then uses to generate draggeable class objects for that course.
- When a class object is being dragged, the second layer is used to show all the drop zones for it according to its class times.
