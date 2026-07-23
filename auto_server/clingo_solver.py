from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Sequence

import clingo

TIME_MULT = 2
WEEKDAYS = range(1, 6)
DEFAULT_DURATION = 1
MAX_SOLUTIONS = 3

MODEL_PATH = Path(__file__).with_name("timetable.lp")


@dataclass(frozen=True)
class Meeting:
    activity: int
    option: int
    meeting: int
    day: int
    start: int
    duration: int
    code: int
    primary: bool


@dataclass(frozen=True)
class PreferenceViolation:
    code: str
    priority: int
    count: int
    message: str


@dataclass(frozen=True)
class TimetableSolution:
    times: tuple[int, ...]
    options: tuple[int, ...]
    cost: tuple[int, ...]
    violations: tuple[PreferenceViolation, ...]

    @property
    def optimal(self) -> bool:
        return not self.violations


@dataclass(frozen=True)
class TimetableResult:
    solutions: tuple[TimetableSolution, ...]

    @property
    def primary(self) -> TimetableSolution | None:
        return self.solutions[0] if self.solutions else None


@dataclass(frozen=True)
class Problem:
    earliest: int
    latest: int
    gap: int
    allowed_days: tuple[int, ...]
    max_days: int
    meetings: tuple[Meeting, ...]
    option_count: tuple[int, ...]


def _half_hours(value: float) -> int:
    scaled = value * TIME_MULT
    if not float(scaled).is_integer():
        raise ValueError("times and durations must use half-hour increments")
    return int(scaled)


def _read_field(value, camel_case: str, snake_case: str):
    if hasattr(value, camel_case):
        return getattr(value, camel_case)
    return getattr(value, snake_case)


def _normalise_period(
    period, activity: int, next_meeting: int
) -> tuple[list[Meeting], int, int]:
    periods_per_class = int(_read_field(period, "periodsPerClass", "periods_per_class"))
    period_times = list(_read_field(period, "periodTimes", "period_times"))
    durations = list(_read_field(period, "durations", "durations"))

    if periods_per_class <= 0:
        periods_per_class = 1
        durations = [DEFAULT_DURATION]

    values_per_option = periods_per_class * 2
    if not period_times or len(period_times) % values_per_option:
        raise ValueError(
            f"activity {activity} periodTimes must contain complete class alternatives"
        )
    if len(durations) != periods_per_class:
        raise ValueError(
            f"activity {activity} durations must contain one value per period"
        )

    option_count = len(period_times) // values_per_option
    meetings: list[Meeting] = []
    for option in range(option_count):
        offset = option * values_per_option
        for period_index in range(periods_per_class):
            day = int(period_times[offset + period_index * 2])
            start = _half_hours(period_times[offset + period_index * 2 + 1])
            duration = _half_hours(durations[period_index])
            if day not in WEEKDAYS:
                raise ValueError(f"activity {activity} contains invalid weekday {day}")
            if start < 0 or start >= 24 * TIME_MULT:
                raise ValueError(f"activity {activity} contains invalid start time")
            if duration <= 0 or start + duration > 24 * TIME_MULT:
                raise ValueError(f"activity {activity} contains invalid duration")
            meetings.append(
                Meeting(
                    activity=activity,
                    option=option,
                    meeting=next_meeting,
                    day=day,
                    start=start,
                    duration=duration,
                    code=day * 100 + start,
                    primary=period_index == 0,
                )
            )
            next_meeting += 1
    return meetings, option_count, next_meeting


def normalise_request(request) -> Problem:
    if not 0 <= request.start <= request.end <= 24:
        raise ValueError("start and end must describe a valid daily time window")
    if not 0 <= request.gap <= 24:
        raise ValueError("gap must be between 0 and 24 hours")
    if not 1 <= request.maxdays <= len(tuple(WEEKDAYS)):
        raise ValueError("maxdays must be between 1 and 5")

    try:
        allowed_days = tuple(sorted({int(day) for day in request.days}))
    except (TypeError, ValueError) as error:
        raise ValueError("days must contain only weekdays 1 through 5") from error
    if not allowed_days:
        raise ValueError("days must contain at least one weekday")
    if any(day not in WEEKDAYS for day in allowed_days):
        raise ValueError("days must contain only weekdays 1 through 5")

    all_meetings: list[Meeting] = []
    option_counts: list[int] = []
    next_meeting = 0
    period_info = _read_field(request, "periodInfo", "period_info")
    if not period_info:
        raise ValueError("periodInfo must contain at least one activity")
    for activity, period in enumerate(period_info):
        meetings, option_count, next_meeting = _normalise_period(
            period, activity, next_meeting
        )
        all_meetings.extend(meetings)
        option_counts.append(option_count)

    max_days = min(
        max(int(request.maxdays), 0), len(allowed_days), len(tuple(WEEKDAYS))
    )
    return Problem(
        earliest=_half_hours(request.start),
        latest=_half_hours(request.end),
        gap=_half_hours(request.gap),
        allowed_days=allowed_days,
        max_days=max_days,
        meetings=tuple(all_meetings),
        option_count=tuple(option_counts),
    )


def _facts(problem: Problem, preference_mode: str) -> str:
    lines = [
        f"earliest({problem.earliest}).",
        f"latest({problem.latest}).",
        f"gap({problem.gap}).",
        f"max_days({problem.max_days}).",
        "weekday(1..5).",
        f"{preference_mode}.",
    ]
    lines.extend(f"allowed_day({day})." for day in problem.allowed_days)
    for activity, count in enumerate(problem.option_count):
        lines.append(f"activity({activity}).")
        lines.extend(f"option({activity},{option})." for option in range(count))
    lines.extend(
        "meeting("
        f"{meeting.activity},{meeting.option},{meeting.meeting},{meeting.day},"
        f"{meeting.start},{meeting.duration},{meeting.code},{int(meeting.primary)}"
        ")."
        for meeting in problem.meetings
    )
    return "\n".join(lines)


def _count_symbols(symbols: Iterable[clingo.Symbol], name: str) -> int:
    return sum(1 for symbol in symbols if symbol.name == name)


def _violations(symbols: Sequence[clingo.Symbol]) -> tuple[PreferenceViolation, ...]:
    definitions = (
        (
            "disallowed_day",
            "outside_selected_days",
            3,
            "meeting outside the selected weekdays",
        ),
        (
            "outside_compact_day",
            "exceeds_maximum_days",
            2,
            "meeting outside the best set of requested campus days",
        ),
        (
            "before_earliest",
            "before_earliest_start",
            1,
            "day containing a meeting before the preferred start time",
        ),
        (
            "after_latest",
            "after_latest_end",
            1,
            "day containing a meeting after the preferred end time",
        ),
    )
    violations = []
    for predicate, code, priority, description in definitions:
        count = _count_symbols(symbols, predicate)
        if count:
            violations.append(
                PreferenceViolation(
                    code=code,
                    priority=priority,
                    count=count,
                    message=f"{count} {description}{'' if count == 1 else 's'}",
                )
            )
    return tuple(violations)


def _decode(
    problem: Problem, symbols: Sequence[clingo.Symbol], cost: Sequence[int]
) -> TimetableSolution:
    choices = {
        symbol.arguments[0].number: symbol.arguments[1].number
        for symbol in symbols
        if symbol.name == "chosen"
    }
    primary_codes = {
        (meeting.activity, meeting.option): meeting.code
        for meeting in problem.meetings
        if meeting.primary
    }
    options = tuple(choices[activity] for activity in range(len(problem.option_count)))
    times = tuple(
        primary_codes[(activity, option)] for activity, option in enumerate(options)
    )
    return TimetableSolution(
        times=times,
        options=options,
        cost=tuple(cost),
        violations=_violations(symbols),
    )


def solve(
    request,
    max_solutions: int = MAX_SOLUTIONS,
    preference_mode: str = "hierarchical",
) -> TimetableResult:
    if max_solutions < 1:
        raise ValueError("max_solutions must be at least 1")
    if preference_mode not in {"hierarchical", "legacy"}:
        raise ValueError("preference_mode must be hierarchical or legacy")

    problem = normalise_request(request)
    control = clingo.Control(["0", "--opt-mode=optN", "--seed=0"])
    control.load(str(MODEL_PATH))
    control.add("base", [], _facts(problem, preference_mode))
    control.ground([("base", [])])

    solutions: dict[tuple[int, ...], TimetableSolution] = {}

    def on_model(model: clingo.Model) -> bool:
        if model.cost and not model.optimality_proven:
            return True
        symbols = model.symbols(shown=True)
        solution = _decode(problem, symbols, model.cost)
        solutions.setdefault(solution.times, solution)
        return len(solutions) < max_solutions

    result = control.solve(on_model=on_model)
    if not result.satisfiable:
        return TimetableResult(solutions=())

    ordered = tuple(solutions[times] for times in sorted(solutions))
    return TimetableResult(solutions=ordered)
