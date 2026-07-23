# Clingo autotimetabler

## Decision

Replace the OR-Tools CP-SAT model with Clingo only if the new solver proves a
product advantage while preserving the existing timetable contract.

The existing service chooses one class alternative for each activity. It treats
class clashes and the requested gap as hard constraints. Earliest start, latest
end, selected weekdays, and maximum campus days are weighted preferences. The
service returns the first period's `day * 100 + half-hour slot` value for each
activity.

Clingo fits this finite choice problem directly. One choice rule selects each
class alternative. Integrity constraints reject overlapping meetings. Weak
constraints rank the remaining answer sets. Clingo's Python API exposes model
costs and proven optimal models without shelling out to a subprocess.

The direct encoding also removes a correctness problem in `auto.py`.
`hasConsecutivePeriods` returns true for every two-period class with one
alternative because its comparison range is empty. `reducePeriodInfo` then
merges the periods, even when they occur on different days, and the overlap
model never sees the second meeting. The Clingo model keeps every meeting in an
alternative and rejects clashes against any of them. A fixed regression and
generated grouped-period tests cover that behavior.

Telingo is not part of this design. Telingo unfolds state traces and adds past
and future temporal operators. A NoTangles timetable is one static assignment,
so temporal trace semantics would add machinery without expressing a missing
requirement.

asprin is also excluded from the runtime. It offers useful qualitative
preference relations, but version 3.1.0 fails against the selected Clingo 5.8
Python API. The unreleased 3.1.2 beta branch passes its bundled subset example,
but depending on an unreleased source revision is unnecessary here. The same
preference order is expressed with standard Clingo weak constraints.

## Acceptance matrix

| Claim | Required evidence |
| --- | --- |
| Existing clients remain compatible | The primary result keeps the existing `times` and `optimal` fields and time encoding. |
| Every returned timetable is valid | Property tests prove exactly one alternative per activity, grouped meetings stay together, and no meetings overlap after applying the requested gap. |
| Preferences are deliberate | The ASP encoding assigns named priority levels instead of relying on an undocumented flat Boolean sum. |
| The replacement is measured | Differential tests compare both solvers over fixed regressions and generated requests. Benchmarks record solve time, memory, and image dependency size. |
| Operations stay simple | The Python gRPC service remains the deployment boundary and uses the supported `clingo` Python package. |

## Preference order

The replacement uses lexicographic priorities. A violation at a higher priority
cannot be traded for any number of lower-priority improvements.

1. Keep meetings on the weekdays selected by the user.
2. Keep the timetable within the requested number of campus days.
3. Keep meetings within the requested daily time window.

Class clashes and the requested gap remain hard constraints.

The response reports whether every preference was satisfied. A valid timetable
is not discarded merely because a preference cannot be met.

## Sources

- [Clingo repository and license](https://github.com/potassco/clingo)
- [Clingo 5.8 Python API](https://potassco.org/clingo/python-api/5.8/)
- [Telingo repository and temporal semantics](https://github.com/potassco/telingo)
- [asprin preference framework](https://github.com/potassco/asprin)
- [ASP-Timetable example](https://github.com/Adamouization/ASP-Timetable)
