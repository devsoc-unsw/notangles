#!/usr/bin/env python3
import argparse
import contextlib
import io
import json
import sys
import statistics
import time
from dataclasses import dataclass
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import auto
import clingo_solver


@dataclass
class Period:
    periodsPerClass: int
    periodTimes: list[float]
    durations: list[float]


@dataclass
class Request:
    start: int
    end: int
    days: str
    gap: int
    maxdays: int
    periodInfo: list[Period]


@dataclass(frozen=True)
class Workload:
    name: str
    activities: int
    options: int
    dense: bool


WORKLOADS = (
    Workload("representative-small", activities=4, options=8, dense=False),
    Workload("representative-medium", activities=8, options=12, dense=False),
    Workload("collision-dense", activities=12, options=20, dense=True),
)


def make_request(workload: Workload) -> Request:
    periods = []
    for activity in range(workload.activities):
        alternatives = []
        for option in range(workload.options):
            if workload.dense and option < workload.options - 2:
                day = option % 2 + 1
                slot = 18 + option % 4
            else:
                day = (activity + option) % 5 + 1
                slot = 16 + (activity * 3 + option * 5) % 24
            alternatives.extend((day, slot / 2))
        periods.append(
            Period(
                periodsPerClass=1,
                periodTimes=alternatives,
                durations=[1],
            )
        )
    return Request(
        start=9,
        end=18,
        days="12345",
        gap=1 if workload.dense else 0,
        maxdays=2 if workload.dense else 3,
        periodInfo=periods,
    )


def run_solver(name: str, request: Request) -> None:
    if name == "ortools":
        with contextlib.redirect_stdout(io.StringIO()):
            auto.sols(request)
        return
    preference_mode = "legacy" if name == "clingo-legacy" else "hierarchical"
    clingo_solver.solve(request, max_solutions=3, preference_mode=preference_mode)


def benchmark(name: str, request: Request, repeats: int) -> dict[str, float]:
    run_solver(name, request)
    durations = []
    for _ in range(repeats):
        started = time.perf_counter()
        run_solver(name, request)
        durations.append((time.perf_counter() - started) * 1000)
    ordered = sorted(durations)
    p95_index = min(len(ordered) - 1, int(len(ordered) * 0.95))
    return {
        "median_ms": round(statistics.median(ordered), 3),
        "p95_ms": round(ordered[p95_index], 3),
        "minimum_ms": round(ordered[0], 3),
        "maximum_ms": round(ordered[-1], 3),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--solver",
        choices=("ortools", "clingo-legacy", "clingo-hierarchical"),
        required=True,
    )
    parser.add_argument("--repeats", type=int, default=30)
    args = parser.parse_args()
    if args.repeats < 1:
        parser.error("--repeats must be at least 1")

    output = {
        workload.name: benchmark(
            args.solver,
            make_request(workload),
            args.repeats,
        )
        for workload in WORKLOADS
    }
    print(json.dumps({"solver": args.solver, "results": output}, indent=2))


if __name__ == "__main__":
    main()
