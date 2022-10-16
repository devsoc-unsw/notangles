from ortools.sat.python import cp_model

MAX_UNSATISFIED_CONSTRAINTS = 3

# Class times (e.g. 9, which represents 9:00 AM) and durations (given in hours) all get multiplied this value and casted to an int as the model only allows integers
TIME_MULT = 2

# Multiplier for the day of the week of classes (e.g. 4 which represents Thursday) so that it can be added to the time of day to represent a class's time in a single number
# For example, 418 represents a class starting at Thursday 9am (4 * 100 + 9 * 2)
DAY_MULT = 100

# The minimum possible time (Monday midnight)
MIN_TIME = DAY_MULT

# The maximum possible time
MAX_TIME = 5 * DAY_MULT + 24 * TIME_MULT

# A duration in hours that lets the end time interval fill the rest of the day
SUITABLE_END_TIME_BUFFER = 26

def hasConsecutivePeriods(periodsPerClass, periodTimes):
    """
    Parameters:
        periodsPerClass (int): The number of periods the class has per week

        periodTimes (list(int)): An array describing what day a class occurs and what time it begins

    Returns:
        bool: Whether a class has consecutively occurring periods in a single day (e.g. tut-labs)
    """
    return periodsPerClass == 2 and all(periodTimes[i] == periodTimes[i + 2] for i in range(0, len(periodTimes) - 4, 4))


def reducePeriodInfo(period):
    """Reduces the period info into nicer data to work with

    Args:
        period: raw data from the server. See Confluence for more information: https://compclub.atlassian.net/wiki/spaces/N/pages/2211578212/Autotimetabler

    Returns:
        Tuple of:
            int|int[]: The duration(s) of each class multiplied by TIME_MULT.
            Both single-period and consecutive-period classes are treated as single periods thus duration will be a single integer

            [int|list[int]]: What day a period occurs and what time it starts expressed as a single number

            bool: Whether a class is special (i.e. if it has a pair of periods on different days such as lectures)

    """
    periodsPerClass, periodTimes, durations = (
        period.periodsPerClass,
        period.periodTimes,
        period.durations,
    )

    # If there are no periodsPerClass then default to 1 period with a duration of 1 hour
    if not periodsPerClass:
        periodsPerClass, durations = 1, [1]

    # For purely single-period classes
    if periodsPerClass == 1:
        return (
            int(durations[0] * TIME_MULT),
            [int(periodTimes[i] * DAY_MULT + periodTimes[i + 1] * TIME_MULT) for i in range(0, len(periodTimes), 2)],
            False,
        )

    # For classes made of two consecutive periods e.g. tut-labs, we merge them into a single period
    if hasConsecutivePeriods(periodsPerClass, periodTimes) and period:
        return (
            int((durations[0] + durations[1]) * TIME_MULT),
            [int(periodTimes[i] * DAY_MULT + periodTimes[i + 1] * TIME_MULT) for i in range(0, len(periodTimes), 4)],
            False,
        )

    # For classes made up of a pair of periods on different days e.g lectures
    return (
        list(map(lambda duration: int(duration * TIME_MULT), durations)),
        [
            [
                int(
                    periodTimes[classIndex + periodIndex] * DAY_MULT
                    + periodTimes[classIndex + periodIndex + 1] * TIME_MULT
                )
                for periodIndex in range(0, periodsPerClass * 2, 2)
            ]
            for classIndex in range(0, len(periodTimes), 2 * periodsPerClass)
        ],
        True,
    )


def sols(requestData):
    """Runs a CP Solver to generate a possible solution given the requested data.

    Args:
        requestData ([start, end, days, gap, maxdays, periodInfo[periodsPerClass, periodTimes[], durations[]]): the given data

    Returns:
        list[int]: A possible solution to the problem
        boolean: optimality
    """
    # Initialise constraint model
    model = cp_model.CpModel()

    # Get user preferences
    minGapBetw, earliestStartTime, latestEndTime, days = (
        requestData.gap * TIME_MULT,
        requestData.start * TIME_MULT,
        requestData.end * TIME_MULT,
        requestData.days,
    )
    maxDays = min(requestData.maxdays, len(days))

    newPeriodData = [reducePeriodInfo(l) for l in requestData.periodInfo]
    numCourses = len(newPeriodData)

    # Indices of classes which were reduced to single-period classes
    normalClassIndices = [i for i in range(numCourses) if not newPeriodData[i][2]]

    # Create integer variables to represent the possible values for each class's start times
    classStartTimes = [
        model.NewIntVarFromDomain(cp_model.Domain.FromValues(newPeriodData[i][1]), f"x{i}") for i in normalClassIndices
    ]

    # Create interval variables to constrain the total length of a class to always be equal to
    # the sum of the duration of the class and the minimum gap between classes
    classIntervals = [
        model.NewFixedSizeIntervalVar(
            classStartTimes[i],
            newPeriodData[normalClassIndices[i]][0] + minGapBetw,
            f"xx{i}",
        )
        for i in range(len(normalClassIndices))
    ]

    # For classes with at least two periods across multiple days
    specialClassIntervals = []

    for specIndex in range(numCourses):
        if not newPeriodData[specIndex][2]:
            continue

        durations, specialPeriods, _ = newPeriodData[specIndex]

        # Intermediate variables to determine which set of grouped periods to choose
        specialBools = [model.NewBoolVar(f"e{i}") for i in range(len(specialPeriods))]

        # These start times are initialised to have a range lasting the entire day
        # They will get constrained to be equal to some group of period start times in the next step
        groupStartTimes = [
            model.NewIntVar(MIN_TIME, MAX_TIME, f"s{specIndex}{i}")
            for i in range(len(durations))
        ]

        # Choose some (in our case one) of the grouped periods to add
        for i in range(len(specialPeriods)):
            for j in range(len(groupStartTimes)):
                model.Add(groupStartTimes[j] == specialPeriods[i][j]).OnlyEnforceIf(specialBools[i])

        # This is similar to classIntervals but for special classes
        # Add an interval for all classes in the group
        specialClassIntervals += [
            model.NewFixedSizeIntervalVar(groupStartTimes[j], durations[j] + minGapBetw, f"sI{j}") for j in range(len(groupStartTimes))
        ]

        # This ensures a single assignment of grouped periods
        model.AddExactlyOne(specialBools)

        # Now the start times can now be added as normal start times
        # The start time of the first period is added in place
        classStartTimes.insert(specIndex, groupStartTimes[0])

        # The rest are appended to the list to preserve the original order of periods
        for j in range(1, len(groupStartTimes)):
            classStartTimes.append(groupStartTimes[j])

    # The possible days of the week a class can be scheduled on
    dayDomain = cp_model.Domain.FromValues([int(i) for i in days])

    # Lists of earliest start/latest end timeconstraints where for each list,
    # list[i] is the constraint for the ith day (Monday is the 0th day)
    laterThanArr = []
    noLaterThanArr = []

    # The list containing the boolean variables to count how many constraints were satisfied
    constraintBools = []

    # The weight each constraint will have on the final result
    constraintWeights = []

    for i in range(1, 6):
        newBools = [model.NewBoolVar(""), model.NewBoolVar("")]

        # Create a block of time from the start of each day to the earliest start time to satisfy that constraint
        laterThanArr.append(
            model.NewOptionalFixedSizeIntervalVar(i * DAY_MULT, earliestStartTime, newBools[0], f"l{i}")
        )

        # Create a block of time to satisfy the latest end time constraint
        # The block extends from the latest end time to the end of the day (i.e. the start of the next day)
        noLaterThanArr.append(
            model.NewOptionalFixedSizeIntervalVar(
                i * DAY_MULT + latestEndTime + minGapBetw,
                SUITABLE_END_TIME_BUFFER,
                newBools[1],
                f"nl{i}",
            )
        )
        constraintBools += newBools
        constraintWeights += [1, 1]

    if maxDays < 5:
        # Create integer variables to represent the possible days of the week a class can be scheduled on
        classDayTimes = [
            model.NewIntVarFromDomain(dayDomain, f"day{i}")
            for i in range(len(classStartTimes))
        ]

        # Intermediate variables to create constraints for days of the week
        dummyClassDayTimes = [
            model.NewIntVar(1, 5, f"day{i}") for i in range(len(classStartTimes))
        ]

        for i in range(len(classStartTimes)):
            constraintBools.append(model.NewBoolVar(""))
            constraintWeights.append(2)

            # Constrain that classStartTimes[i] // DAY_MULT == classDayTimes[i]
            model.AddDivisionEquality(dummyClassDayTimes[i], classStartTimes[i], DAY_MULT)
            model.Add(dummyClassDayTimes[i] == classDayTimes[i]).OnlyEnforceIf(constraintBools[-1])

        # Create integer variables which correspond to the maximum number of days classes should be scheduled on
        # These will take any combination of day values
        possibleDays = [model.NewIntVar(1, 6, f"dv{i}") for i in range(maxDays)]

        for classDayTime in dummyClassDayTimes:
            # Intermediate variable to determine whether to enable assigning a class to that day
            possibleBools = [model.NewBoolVar("") for _ in possibleDays]

            # Constrain that classDayTime == one of the possible days classes can be on
            for i in range(len(possibleDays)):
                model.Add(classDayTime == possibleDays[i]).OnlyEnforceIf(possibleBools[i])

            # Ensures classDayTime == possibleDays[i] for at least one i
            constraintBools.append(model.NewBoolVar(""))
            constraintWeights.append(1)
            model.AddBoolOr(possibleBools).OnlyEnforceIf(constraintBools[-1])

    # Makes the periods (and other constraints) not overlap
    model.AddNoOverlap(classIntervals + laterThanArr + noLaterThanArr + specialClassIntervals)

    # Try to satisfy as many constraints as possible
    model.Maximize(cp_model.LinearExpr.WeightedSum(constraintBools, constraintWeights))

    # Create a solver and solve.
    solver = cp_model.CpSolver()
    status = solver.Solve(model)
    print(f"Status: {solver.StatusName(status)}")

    unsatisfied = sum(constraintWeights) - solver.ObjectiveValue()
    print(f"Number of constraints unsatisfied: {unsatisfied}")

    if solver.StatusName(status) != "INFEASIBLE" and unsatisfied <= MAX_UNSATISFIED_CONSTRAINTS:
        solutions = [solver.Value(classStartTimes[i]) for i in range(numCourses)]
        print(solutions)
        return solutions, unsatisfied == 0

    return [], False
