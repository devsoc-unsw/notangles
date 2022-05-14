# Notangles Autotimetabler

The Notangles autotimetabler returns a possible timetable that matches the user's provided requirements.

## Installation

The server has been verified to work with:

- Python v3.8.10
- pip v21.2.4

First, in the root server directory `auto_server` create a virtual environment with `python3 -m venv env`.

Activate the virtual environment by running `source env/bin/activate`

Finally, in your virtual environment, run `python3 -m pip install -r requirements.txt` to install all the dependencies.

## Running

Run `python3 server.py` to start the autotimetabling server locally.

The `SENTRY_INGEST_AUTO_SERVER` environment variable is the ingest URL for the Sentry SDK to know where to send the monitored data.

The `SENTRY_TRACE_RATE_AUTO_SERVER` environment variable is the percentage of transactions monitored and sent.

The real values of these environment variables are only required when the app is deployed.

## Tech Stack

The Notangles autotimetabler uses:

- [Google OR-Tools](https://developers.google.com/optimization)
- [gRPC](https://grpc.io/)

## Logic

- The autotimetabler uses Google OR-Tools' set of constraint programming algorithms to generate a possible arrangement of classes based on the user's provided constraints.
- It then returns this result to the Notangles server using gRPC (Remote Procedure Calls)
