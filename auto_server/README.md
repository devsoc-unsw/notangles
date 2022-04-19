# Notangles Autotimetabler

The Notangles autotimetabler returns a possible timetable that matches the user's provided requirements.

## Installation

The server has been verified to work with:

- Python v3.8.10
- pip v21.2.4

First, in the root server directory `auto_server` create a virtual environment with `python3 -m venv env`.

Activate the virtual environment by running `source env/bin/activate`

Finally, in your virtual environment, run `python3 -m pip install -r requirements.txt` to install all the dependencies.

## Environment Variables

To run this project, you will need the following environment variables:

| Variable                            | Default | Value                                                                  |
| ----------------------------------- | ------- | ---------------------------------------------------------------------- |
| `SENTRY_INGEST_AUTOTIMETABLING`     | Secret  | The ingest url for sentry SDK to know where to send the monitored data |
| `SENTRY_TRACE_RATE_AUTOTIMETABLING` | 0.6     | Percentage of transactions monitored and sent                          |

## Running

Run `python3 server.py` to start the autotimetabling server locally.

## Tech Stack

The Notangles autotimetabler uses:

- [Google OR-Tools](https://developers.google.com/optimization)
- [gRPC](https://grpc.io/)

## Logic

- The autotimetabler uses Google OR-Tools' set of constraint programming algorithms to generate a possible arrangement of classes based on the user's provided constraints.
- It then returns this result to the Notangles server using gRPC (Remote Procedure Calls)
