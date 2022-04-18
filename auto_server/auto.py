from ortools.sat.python import cp_model

def reduePeriodInfo(period):
    """Reduces the period info into nicer data to work with

    Args:
        period (_type_): _description_

    Returns:
        (duration: int|int[], periodStartTimes: [int|tuple(int)], isASpecialClass: bool): _description_
    """
    periodsPerClass, periodTimes, durations = period.periodsPerClass, period.periodTimes, period.durations

    # for purely single-period classes
    if periodsPerClass == 1:
        return (
            int(durations[0] * 2),
            list(int(periodTimes[i] * 100 + 2 * periodTimes[i+1])
                 for i in range(0, len(periodTimes), 2)),
            False
        )
    # for classes made of two consecutive periods (we merge into a single period)
    # checks if the first and second period are on the same day
    if periodsPerClass == 2 and periodTimes[0] == periodTimes[2] and period:
        return (
            int((durations[0] + durations[1]) * 2),
            list(int(periodTimes[i] * 100 + 2 * periodTimes[i+1])
                 for i in range(0, len(periodTimes), 4)),
            False,
        )
    # for classes made up of a pair of periods on different days
    return (
        list(map(lambda d: int(d * 2), durations)),
        list(tuple(int(periodTimes[i + j] * 100 + 2 * periodTimes[i + j + 1]) for j in range(
            0, periodsPerClass * 2, 2)) for i in range(0, len(periodTimes), 2*periodsPerClass)),
        True,
    )


def sols(requestData):
    """Runs a CP Algorithm to generate solutions given the requested data.

    Args:
        requestData ([start, end, days, gap, maxdays, periodInfo[periodsPerClass, periodTimes[], durations[]]): the given data

    Returns:
        [int]: solutions
    """

    minGapBetw, earliestStartTime, latestEndTime, days = (
        requestData.gap * 2,
        requestData.start * 2,
        requestData.end * 2,
        requestData.days,
    )

    maxDays = min(requestData.maxdays, len(days))

    newPeriodData = [reduePeriodInfo(l) for l in requestData.periodInfo]  # reduces data
    print('---')
    print('newdata', newPeriodData)
    print(minGapBetw, earliestStartTime, latestEndTime)
    model = cp_model.CpModel()  # start making the constraints model

    numCourses = len(newPeriodData)
    # those we reduced to single-period classes
    normalClassIndices = list(i for i in range(numCourses) if not newPeriodData[i][2])

    classStartTimes = [
        model.NewIntVarFromDomain(
            cp_model.Domain.FromValues(newPeriodData[i][1]), f"x{i}")
        for i in normalClassIndices
    ]  # start times

    classIntervals = [
        model.NewFixedSizeIntervalVar(
            classStartTimes[i], newPeriodData[normalClassIndices[i]][0] + minGapBetw, f"xx{i}"
        )
        for i in range(len(normalClassIndices))
    ]  # periods as intervals (corresponds to starttimes)

    specialIntervalVars = []
    for specIndex in range(numCourses):  # handles classes with two+ periods across multiple days
        if not newPeriodData[specIndex][2]:
            continue
        durations, specialPeriods, _ = newPeriodData[specIndex]

        # dummy bools we configure for constraints
        specialBools = [model.NewBoolVar(f"e{i}") for i in range(len(specialPeriods))]

        # initially set to be 'anything' but will get constrained to be equal to some group of period start times in the next step
        groupStartTimes = [model.NewIntVar(100, 560, f"s{specIndex}{i}") for i in range(len(durations))]

        for i, _ in enumerate(specialPeriods):
            for j, _ in enumerate(groupStartTimes):
                model.Add(groupStartTimes[j] == specialPeriods[i][j]).OnlyEnforceIf(specialBools[i])

        specialIntervalVars += [model.NewFixedSizeIntervalVar(
            groupStartTimes[j], durations[j] + minGapBetw,f"sI{j}")
            for j, _ in enumerate(groupStartTimes)]

        # ensures a single assignment of grouped periods
        model.AddExactlyOne(specialBools)

        # they can now be added as normal starttimes
        classStartTimes.insert(specIndex, groupStartTimes[0]) # first added in place
        for j in range(1, len(groupStartTimes)): # rest are chucked to the end (preserves og order)
            classStartTimes.append(groupStartTimes[j])

    dayDomain = cp_model.Domain.FromValues([int(i) for i in days])

    # restricts classes to be no earlier than start
    laterThanArr = [model.NewFixedSizeIntervalVar(i * 100, earliestStartTime, f"l{i}") for i in range(1, 6)]
    noLaterThanArr = [model.NewFixedSizeIntervalVar(i * 100 + latestEndTime + minGapBetw, 16, f"l{i}") for i in range(1, 6)]

    if maxDays == 1:
        day = model.NewIntVarFromDomain(dayDomain, "day")
        for i in classStartTimes:
            # makes them all on the same day
            model.AddDivisionEquality(day, i, 100)

    elif maxDays in [2, 3, 4]:
        classDayTimes = [
            model.NewIntVarFromDomain(dayDomain, f"day{i}")
            for i, _ in enumerate(classStartTimes)
        ]  # constrains ClassStartTimes[i] // 100

        for i, _ in enumerate(classStartTimes):
            model.AddDivisionEquality(classDayTimes[i], classStartTimes[i], 100)

        possibleDays = [model.NewIntVarFromDomain(
            dayDomain, f"dv{i}") for i in range(maxDays)]

        for classDayTime in classDayTimes:
            possibleBools = [model.NewBoolVar('') for _ in possibleDays]

            for i, _ in enumerate(possibleDays):
                model.Add(classDayTime == possibleDays[i]).OnlyEnforceIf(possibleBools[i])

            model.AddBoolOr(possibleBools) # ensures classDayTime == possibleDays[i] for at least one i

    # makes the periods (and other constraints) not overlap
    model.AddNoOverlap(classIntervals + laterThanArr + noLaterThanArr + specialIntervalVars)

    # Create a solver and solve.
    solver = cp_model.CpSolver()

    # for when you want it to give a solution ↓
    status = solver.Solve(model)
    print(f"Status = {solver.StatusName(status)}")
    if solver.StatusName(status) != "INFEASIBLE":
        solutions = [solver.Value(classStartTimes[i]) for i in range(numCourses)]
        print(solutions)
        return solutions  # List[int]
    return []
