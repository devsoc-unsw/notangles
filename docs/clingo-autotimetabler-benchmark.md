# Autotimetabler solver comparison

## Result

Clingo preserved the legacy OR-Tools objective on generated differential tests
and reduced solve time in the small and medium synthetic workloads. The
collision-dense result was within 2 ms in both pass orders, where Clingo was
4.2 percent slower by the combined median.

Each timing pass warmed the solver once, then measured 30 fresh calls in one
process. The second pass reversed solver order. The values below are the median
milliseconds from the OR-Tools-first and Clingo-first passes.

| Workload | Shape | OR-Tools | Clingo | Median speedup |
| --- | --- | ---: | ---: | ---: |
| Representative small | 4 activities, 8 options each | 4.758 / 4.519 | 1.230 / 1.254 | 3.74x |
| Representative medium | 8 activities, 12 options each | 5.774 / 5.754 | 2.347 / 2.321 | 2.47x |
| Collision dense | 12 activities, 20 options each | 45.284 / 45.719 | 47.204 / 47.652 | 0.96x |

The Clingo measurements use the new hierarchical preference model. A separate
legacy-mode Clingo run, used to isolate solver behavior from the new preference
order, recorded medians of 1.213 ms, 2.296 ms, and 29.382 ms.

## Memory and deployment size

`/usr/bin/time -v` measured each complete benchmark process. Peak resident set
size was 126,040 KiB for OR-Tools and 84,924 KiB for hierarchical Clingo in the
first pass. The reversed pass measured 126,304 KiB and 83,892 KiB. Clingo used
32.6 to 33.6 percent less peak memory.

Clean Docker builds used the same `python:3.10.17-slim-bookworm` base and each
revision's production requirements:

| Image | Size |
| --- | ---: |
| OR-Tools on upstream `dev` at `229ff95e` | 188,544,049 bytes |
| Clingo replacement | 69,580,539 bytes |

The Clingo image is 63.1 percent smaller. The old requirements installed
OR-Tools, NumPy, and pandas. The replacement service installs Clingo, gRPC, and
protobuf.

## Correctness controls

Timing does not establish semantic equivalence. The test suite handles that
separately:

- 60 generated requests compare the exact flat objective cost between
  OR-Tools and Clingo legacy mode.
- 40 generated requests compare hard feasibility.
- 60 generated requests validate every Clingo result, including grouped
  meetings and the requested gap.
- A fixed regression proves that a clash in the second meeting of a grouped
  class is rejected. The old period-reduction heuristic omitted that meeting.

The workloads are deterministic synthetic cases, not production request
samples. Run the benchmark with:

```sh
cd auto_server
python benchmarks/compare_solvers.py --solver ortools --repeats 30
python benchmarks/compare_solvers.py --solver clingo-hierarchical --repeats 30
```

## Environment

- Date: 2026-07-23
- CPU: AMD Ryzen 9 9950X, 16 cores and 32 threads
- OS: Linux 7.0.0-27-generic x86-64
- Python: 3.10.20
- OR-Tools: 9.10.4067
- Clingo: 5.8.0
