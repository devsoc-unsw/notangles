# Notangles Client

The Notangles client allows users to interactively plan out their timetables with the latest course information using a simple drag-and-drop system.

## Installation & Running

The client has been verified to work with:

- npm v8.3.1
- node v16.14.0

```bash
# prerequisite
$ cd client

# installation
$ pnpm i

# running
$ pnpm start # (if you already have the timetable server running locally; connects to that)

$ pnpm run start:mock #(if you don’t have the timetable server running locally; connects to our real server)
```

> Note: both `pnpm start` and `pnpm run start:mock` connect to the local autotimetabler locally if it is running
> You can then access the client at `http://localhost:5173`.

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
