# Notangles Autotimetabler

The Notangles autotimetabler returns a possible timetable that matches the user's provided requirements.

## Installation

The server has been verified to work with:

- Python 3.10

First, in the root server directory `auto_server` create a virtual environment with `python3 -m venv env`.

Activate the virtual environment by running `source env/bin/activate`

Finally, in your virtual environment, run `python3 -m pip install -r requirements.txt` to install all the dependencies.

For development and tests, install `requirements-dev.txt` instead.

## Running

Run `python3 server.py` to start the autotimetabling server locally.

The real values of these environment variables are only required when the app is deployed.

## Tech Stack

The Notangles autotimetabler uses:

- [Clingo](https://potassco.org/clingo/)
- [gRPC](https://grpc.io/)

## Logic

- The autotimetabler uses Clingo to choose clash-free classes and rank the choices against the user's preferences.
- It returns the best choice to the Notangles server through the existing gRPC contract.

## Testing

Run the Python and generated differential tests with:

```sh
python3 -m unittest discover -s tests -v
```

See [the solver design](../docs/clingo-autotimetabler.md) and
[the measured comparison](../docs/clingo-autotimetabler-benchmark.md) for the
replacement evidence.
