from time import sleep
from ortools.sat.python import cp_model

MAX_UNSATISFIED_CONSTRAINTS = 3

TIME_MULT = 2 # times of days of classes (e.g. 9, which represents 9:00 AM) and durations (given in hours) all get multiplied this value and int-casted as the model only allows integers
DAY_MULT = 100 # multipler for the day of the week of classes (e.g. 4 which represents Thursday) so that it can be added to the time of day to represent a class's time in a single number
MIN_TIME = DAY_MULT
MAX_TIME = 5 * DAY_MULT + 24 * TIME_MULT

SUIABLE_END_TIME_BUFFER = 26 # a duration in hours that lets end time interval fill the rest of the day

def reducePeriodInfo(period):
    """Reduces the period info into nicer data to work with

    Args:
        period ([periodsPerClass, periodTimes[], durations[]]): raw data from the server

    Returns:
        (duration: int|int[], periodStartTimes: [int|tuple(int)], isASpecialClass: bool): data formatted nicely
    """
    periodsPerClass, periodTimes, durations = period.periodsPerClass, period.periodTimes, period.durations

    # for purely single-period classes
    if periodsPerClass == 1:
        return (
            int(durations[0] * TIME_MULT),
            [int(periodTimes[i] * DAY_MULT + TIME_MULT * periodTimes[i + 1]) for i in range(0, len(periodTimes), 2)],
            False
        )

    # for classes made of two consecutive periods (we merge into a single period)
    # checks if the first and second period are on the same day
    if periodsPerClass == 2 and periodTimes[0] == periodTimes[2] and period:
        return (
            int((durations[0] + durations[1]) * TIME_MULT),
            [int(periodTimes[i] * DAY_MULT + TIME_MULT * periodTimes[i + 1]) for i in range(0, len(periodTimes), 4)],
            False,
        )

    # for classes made up of a pair of periods on different days
    return (
        list(map(lambda d: int(d * TIME_MULT), durations)),
        [[int(periodTimes[i + j] * DAY_MULT + TIME_MULT * periodTimes[i + j + 1]) for j in range(
            0, periodsPerClass * 2, 2)] for i in range(0, len(periodTimes), 2 * periodsPerClass)],
        True,
    )


def sols(requestData):
    """Runs a CP Algorithm to generate solutions given the requested data.

    Args:
        requestData ([start, end, days, gap, maxdays, periodInfo[periodsPerClass, periodTimes[], durations[]]): the given data

    Returns:
        [int]: solutions
        boolean: optimality
    """

    minGapBetw, earliestStartTime, latestEndTime, days = (
        requestData.gap * TIME_MULT,
        requestData.start * TIME_MULT,
        requestData.end * TIME_MULT,
        requestData.days,
    )

    maxDays = min(requestData.maxdays, len(days))

    newPeriodData = [reducePeriodInfo(l) for l in requestData.periodInfo]  # reduces data

    model = cp_model.CpModel()  # start making the constraints model

    numCourses = len(newPeriodData)

    # those we reduced to single-period classes
    normalClassIndices = [i for i in range(numCourses) if not newPeriodData[i][2]]

    classStartTimes = [
        model.NewIntVarFromDomain(cp_model.Domain.FromValues(newPeriodData[i][1]), f"x{i}") for i in normalClassIndices
    ]  # start times

    classIntervals = [
        model.NewFixedSizeIntervalVar(
            classStartTimes[i], newPeriodData[normalClassIndices[i]][0] + minGapBetw, f"xx{i}"
        )
        for i in range(len(normalClassIndices))
    ]  # periods as intervals (corresponds to starttimes)

    specialIntervalVars = []
    # handles classes with two+ periods across multiple days
    for specIndex in range(numCourses):
        if not newPeriodData[specIndex][2]:
            continue

        durations, specialPeriods, _ = newPeriodData[specIndex]

        # dummy bools we configure for constraints
        specialBools = [model.NewBoolVar(f"e{i}") for i in range(len(specialPeriods))]

        # initially set to be 'anything' but will get constrained to be equal to some group of period start times in the next step
        groupStartTimes = [model.NewIntVar(MIN_TIME, MAX_TIME, f"s{specIndex}{i}") for i in range(len(durations))]

        for i in range(len(specialPeriods)):
            for j in range(len(groupStartTimes)):
                model.Add(groupStartTimes[j] == specialPeriods[i][j]).OnlyEnforceIf(specialBools[i])

        specialIntervalVars += [model.NewFixedSizeIntervalVar(groupStartTimes[j], durations[j] + minGapBetw, f"sI{j}")
            for j in range(len(groupStartTimes))]

        # ensures a single assignment of grouped periods
        model.AddExactlyOne(specialBools)

        # they can now be added as normal starttimes
        # first added in place
        classStartTimes.insert(specIndex, groupStartTimes[0])

        # rest are chucked to the end (preserves og order)
        for j in range(1, len(groupStartTimes)):
            classStartTimes.append(groupStartTimes[j])

    dayDomain = cp_model.Domain.FromValues([int(i) for i in days])

    # restricts classes to be no earlier than start

    laterThanArr = []
    noLaterThanArr = []
    constraintBools = []
    constraintWeights = []
    for i in range(1, 6):
        newBools = [model.NewBoolVar(''), model.NewBoolVar('')]
        laterThanArr.append(model.NewOptionalFixedSizeIntervalVar(i * DAY_MULT, earliestStartTime, newBools[0], f'l{i}')) # extends from the start of the day to the earliest start time
        noLaterThanArr.append(model.NewOptionalFixedSizeIntervalVar(i * DAY_MULT + latestEndTime + minGapBetw, SUIABLE_END_TIME_BUFFER, newBools[1], f'nl{i}')) # extends from latest end time to the end of the day (i.e. the next day)
        constraintBools += newBools
        constraintWeights += [1, 1]

    if maxDays < 5:
        classDayTimes = [
            model.NewIntVarFromDomain(dayDomain, f"day{i}")
            for i in range(len(classStartTimes))
        ]  # constrains ClassStartTimes[i] // DAY_MULT

        dummyClassDayTimes = [
            model.NewIntVar(1, 5, f"day{i}")
            for i in range(len(classStartTimes))
        ] # allow us to create optional constraints

        for i in range(len(classStartTimes)):
            constraintBools.append(model.NewBoolVar(''))
            constraintWeights.append(2)
            model.AddDivisionEquality(dummyClassDayTimes[i], classStartTimes[i], DAY_MULT)
            model.Add(dummyClassDayTimes[i] == classDayTimes[i]).OnlyEnforceIf(constraintBools[-1])

        possibleDays = [model.NewIntVar(1, 6, f"dv{i}") for i in range(maxDays)]

        for classDayTime in dummyClassDayTimes:
            possibleBools = [model.NewBoolVar('') for _ in possibleDays]

            for i in range(len(possibleDays)):
                model.Add(classDayTime == possibleDays[i]).OnlyEnforceIf(possibleBools[i])

            # ensures classDayTime == possibleDays[i] for at least one i
            constraintBools.append(model.NewBoolVar(''))
            constraintWeights.append(1)
            model.AddBoolOr(possibleBools).OnlyEnforceIf(constraintBools[-1])

    # makes the periods (and other constraints) not overlap
    model.AddNoOverlap(classIntervals + laterThanArr + noLaterThanArr + specialIntervalVars)

    # try to satisfy as many constraints as possible
    model.Maximize(cp_model.LinearExpr.WeightedSum(constraintBools, constraintWeights))

    # Create a solver and solve.
    solver = cp_model.CpSolver()

    # for when you want it to give a solution ↓
    status = solver.Solve(model)
    print(f"Status = {solver.StatusName(status)}")

    unsatisfied = sum(constraintWeights) - solver.ObjectiveValue()
    print(f"Number constraints unsatisfied: {unsatisfied}")

    if solver.StatusName(status) != "INFEASIBLE" and unsatisfied <= MAX_UNSATISFIED_CONSTRAINTS:
        solutions = [solver.Value(classStartTimes[i]) for i in range(numCourses)]
        print(solutions)
        return solutions, unsatisfied == 0   # (List[int], boolean)

    return []
