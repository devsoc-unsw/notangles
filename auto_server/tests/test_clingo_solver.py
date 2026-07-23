import contextlib
import io
import re
import unittest
from dataclasses import dataclass

import grpc
from hypothesis import given, settings, strategies as st

import auto
import autotimetabler_pb2
from clingo_solver import normalise_request, solve
from server import AutoTimetablerServicer


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


class RpcAbort(Exception):
    pass


class AbortContext:
    def __init__(self):
        self.code = None
        self.details = None

    def abort(self, code, details):
        self.code = code
        self.details = details
        raise RpcAbort


def request(
    periods: list[Period],
    *,
    start: int = 9,
    end: int = 17,
    days: str = "12345",
    gap: int = 0,
    maxdays: int = 5,
) -> Request:
    return Request(start, end, days, gap, maxdays, periods)


def single(*times: tuple[int, float], duration: float = 1) -> Period:
    return Period(
        periodsPerClass=1,
        periodTimes=[value for time in times for value in time],
        durations=[duration],
    )


def selected_meetings(problem, solution):
    return [
        meeting
        for meeting in problem.meetings
        if solution.options[meeting.activity] == meeting.option
    ]


def assert_valid(test_case: unittest.TestCase, problem, solution) -> None:
    test_case.assertEqual(len(solution.options), len(problem.option_count))
    test_case.assertEqual(len(solution.times), len(problem.option_count))
    for activity, option in enumerate(solution.options):
        test_case.assertIn(option, range(problem.option_count[activity]))
        primary = next(
            meeting
            for meeting in problem.meetings
            if meeting.activity == activity
            and meeting.option == option
            and meeting.primary
        )
        test_case.assertEqual(solution.times[activity], primary.code)

    meetings = selected_meetings(problem, solution)
    for activity, option in enumerate(solution.options):
        expected = sum(
            meeting.activity == activity and meeting.option == option
            for meeting in problem.meetings
        )
        selected = sum(meeting.activity == activity for meeting in meetings)
        test_case.assertEqual(selected, expected)

    for index, left in enumerate(meetings):
        for right in meetings[index + 1 :]:
            if left.activity == right.activity or left.day != right.day:
                continue
            separated = (
                left.start + left.duration + problem.gap <= right.start
                or right.start + right.duration + problem.gap <= left.start
            )
            test_case.assertTrue(separated, (left, right))


class ClingoSolverTests(unittest.TestCase):
    def test_returns_three_distinct_optimal_alternatives(self):
        result = solve(request([single((1, 9), (2, 9), (3, 9))]))

        self.assertEqual(
            [solution.times for solution in result.solutions],
            [(118,), (218,), (318,)],
        )
        self.assertTrue(all(solution.optimal for solution in result.solutions))

    def test_keeps_grouped_periods_together(self):
        grouped = Period(
            periodsPerClass=2,
            periodTimes=[1, 9, 3, 9],
            durations=[1, 1],
        )
        clashes_on_wednesday = single((3, 9), (2, 9))

        result = solve(request([grouped, clashes_on_wednesday]))

        self.assertEqual(result.primary.times, (118, 218))
        self.assertEqual(result.primary.options, (0, 1))

    def test_detects_a_clash_in_the_second_grouped_meeting(self):
        grouped = Period(
            periodsPerClass=2,
            periodTimes=[1, 9, 3, 9],
            durations=[1, 1],
        )
        clashes_on_wednesday = single((3, 9))

        result = solve(request([grouped, clashes_on_wednesday]))

        self.assertEqual(result.solutions, ())

    def test_requested_gap_is_a_hard_constraint(self):
        first = single((1, 9))
        second = single((1, 10), (1, 11))

        result = solve(request([first, second], gap=1))

        self.assertEqual(result.primary.times, (118, 122))

    def test_reports_each_preference_compromise(self):
        outside_days = single((2, 8), duration=10)

        result = solve(request([outside_days], start=9, end=17, days="1", maxdays=1))

        self.assertEqual(
            [
                (item.code, item.priority, item.count)
                for item in result.primary.violations
            ],
            [
                ("outside_selected_days", 3, 1),
                ("before_earliest_start", 1, 1),
                ("after_latest_end", 1, 1),
            ],
        )
        self.assertEqual(result.primary.cost, (1, 0, 2))
        self.assertFalse(result.primary.optimal)

    def test_reports_excess_campus_days(self):
        result = solve(request([single((1, 9)), single((2, 9))], days="12", maxdays=1))

        violation = next(
            item
            for item in result.primary.violations
            if item.code == "exceeds_maximum_days"
        )
        self.assertEqual(violation.count, 1)

    def test_returns_no_solution_when_every_combination_clashes(self):
        result = solve(request([single((1, 9)), single((1, 9))]))

        self.assertEqual(result.solutions, ())

    def test_rejects_incomplete_alternatives(self):
        invalid = Period(
            periodsPerClass=2,
            periodTimes=[1, 9],
            durations=[1, 1],
        )

        with self.assertRaisesRegex(ValueError, "complete class alternatives"):
            solve(request([invalid]))

    def test_rejects_invalid_user_constraints(self):
        with self.assertRaisesRegex(ValueError, "daily time window"):
            solve(request([single((1, 9))], start=18, end=9))
        with self.assertRaisesRegex(ValueError, "at least one weekday"):
            solve(request([single((1, 9))], days=""))
        with self.assertRaisesRegex(ValueError, "maxdays"):
            solve(request([single((1, 9))], maxdays=0))
        with self.assertRaisesRegex(ValueError, "half-hour"):
            solve(request([single((1, 9.25))]))
        with self.assertRaisesRegex(ValueError, "weekdays 1 through 5"):
            solve(request([single((1, 9))], days="1,2"))

    def test_is_repeatable(self):
        value = request(
            [
                single((1, 9), (2, 9), (3, 9)),
                single((1, 11), (2, 11), (3, 11)),
            ]
        )

        first = solve(value)
        second = solve(value)

        self.assertEqual(first, second)


class AutoTimetablerServiceTests(unittest.TestCase):
    def test_grpc_response_preserves_legacy_fields(self):
        grpc_request = autotimetabler_pb2.TimetableConstraints(
            start=9,
            end=17,
            days="1",
            gap=0,
            maxdays=1,
        )
        grpc_request.periodInfo.add(
            periodsPerClass=1,
            periodTimes=[2, 8],
            durations=[10],
        )

        response = AutoTimetablerServicer().FindBestTimetable(grpc_request, None)

        self.assertEqual(list(response.times), [216])
        self.assertFalse(response.optimal)

    def test_grpc_response_reports_no_solution(self):
        grpc_request = autotimetabler_pb2.TimetableConstraints(
            start=9,
            end=17,
            days="12345",
            gap=0,
            maxdays=5,
        )
        for _ in range(2):
            grpc_request.periodInfo.add(
                periodsPerClass=1,
                periodTimes=[1, 9],
                durations=[1],
            )

        response = AutoTimetablerServicer().FindBestTimetable(grpc_request, None)

        self.assertEqual(list(response.times), [])
        self.assertFalse(response.optimal)

    def test_grpc_response_rejects_invalid_constraints(self):
        grpc_request = autotimetabler_pb2.TimetableConstraints(
            start=18,
            end=9,
            days="12345",
            gap=0,
            maxdays=5,
        )
        grpc_request.periodInfo.add(
            periodsPerClass=1,
            periodTimes=[1, 9],
            durations=[1],
        )
        context = AbortContext()

        with self.assertRaises(RpcAbort):
            AutoTimetablerServicer().FindBestTimetable(grpc_request, context)

        self.assertEqual(context.code, grpc.StatusCode.INVALID_ARGUMENT)
        self.assertIn("daily time window", context.details)


day_and_time = st.tuples(
    st.integers(min_value=1, max_value=5),
    st.integers(min_value=16, max_value=40).map(lambda slot: slot / 2),
)


@st.composite
def simple_requests(draw):
    activity_count = draw(st.integers(min_value=1, max_value=5))
    periods = []
    for _ in range(activity_count):
        options = draw(
            st.lists(
                day_and_time,
                min_size=1,
                max_size=4,
                unique=True,
            )
        )
        duration = draw(st.sampled_from([0.5, 1, 1.5, 2]))
        periods.append(single(*options, duration=duration))
    return request(periods, start=0, end=24, days="12345", maxdays=5)


@st.composite
def grouped_requests(draw):
    activity_count = draw(st.integers(min_value=1, max_value=4))
    periods = []
    for _ in range(activity_count):
        periods_per_class = draw(st.integers(min_value=1, max_value=2))
        option_count = draw(st.integers(min_value=1, max_value=3))
        times = draw(
            st.lists(
                day_and_time,
                min_size=periods_per_class * option_count,
                max_size=periods_per_class * option_count,
                unique=True,
            )
        )
        durations = draw(
            st.lists(
                st.sampled_from([0.5, 1, 1.5, 2]),
                min_size=periods_per_class,
                max_size=periods_per_class,
            )
        )
        periods.append(
            Period(
                periodsPerClass=periods_per_class,
                periodTimes=[value for time in times for value in time],
                durations=durations,
            )
        )
    return request(periods, start=0, end=24, days="12345", maxdays=5)


@st.composite
def preference_requests(draw):
    base = draw(simple_requests())
    allowed_days = draw(
        st.lists(
            st.integers(min_value=1, max_value=5),
            min_size=1,
            max_size=5,
            unique=True,
        )
    )
    return request(
        base.periodInfo,
        start=draw(st.integers(min_value=8, max_value=12)),
        end=draw(st.integers(min_value=14, max_value=22)),
        days="".join(str(day) for day in sorted(allowed_days)),
        gap=draw(st.integers(min_value=0, max_value=2)),
        maxdays=draw(st.integers(min_value=1, max_value=5)),
    )


class ClingoPropertyTests(unittest.TestCase):
    @settings(max_examples=60, deadline=None)
    @given(grouped_requests())
    def test_every_generated_solution_is_valid(self, generated_request):
        problem = normalise_request(generated_request)
        result = solve(generated_request)

        for solution in result.solutions:
            assert_valid(self, problem, solution)

    @settings(max_examples=40, deadline=None)
    @given(simple_requests())
    def test_matches_ortools_hard_constraint_feasibility(self, generated_request):
        with contextlib.redirect_stdout(io.StringIO()):
            ortools_times, ortools_optimal = auto.sols(generated_request)
        clingo_result = solve(generated_request, preference_mode="legacy")

        self.assertEqual(bool(clingo_result.solutions), bool(ortools_times))
        if ortools_times:
            self.assertTrue(ortools_optimal)
            self.assertTrue(clingo_result.primary.optimal)

    @settings(max_examples=60, deadline=None)
    @given(preference_requests())
    def test_legacy_objective_matches_ortools(self, generated_request):
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            auto.sols(generated_request)
        clingo_result = solve(generated_request, preference_mode="legacy")

        status = re.search(r"Status: (\w+)", output.getvalue()).group(1)
        if status == "INFEASIBLE":
            self.assertEqual(clingo_result.solutions, ())
            return

        match = re.search(
            r"Number of constraints unsatisfied: ([0-9.]+)",
            output.getvalue(),
        )
        ortools_cost = int(float(match.group(1)))
        clingo_cost = clingo_result.primary.cost[0] if clingo_result.primary.cost else 0
        self.assertEqual(clingo_cost, ortools_cost)
