from functools import reduce

from ortools.sat.python import cp_model

"""reduces period data into nicer data
    Returns: (duration: int|int[], periodStartTimes: [int|tuple(int)], isASpecialClass: bool)
"""


def reduePeriodInfo(period):
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


"""yields solutions"""


def sols(requestData):
    # requestData: [start, end, days, gap, maxdays, periodInfo[periodsPerClass, periodTimes[], durations[]]

    minGapBetw, earliestStartTime, latestEndTime, days = (
        requestData.gap * 2,
        requestData.start * 2,
        requestData.end * 2,
        requestData.days,
    )

    maxDays = min(requestData.maxdays, len(days))

    newPeriodData = [reduePeriodInfo(l)
                     for l in requestData.periodInfo]  # reduces data
    print('---')
    print('newdata', newPeriodData)
    print(minGapBetw, earliestStartTime, latestEndTime)
    model = cp_model.CpModel()  # start making the constraints model

    numCourses = len(newPeriodData)
    # those we reduced to single-period classes
    normalClassIndices = list(i for i in range(
        numCourses) if not newPeriodData[i][2])

    classStartTimes = [
        model.NewIntVarFromDomain(
            cp_model.Domain.FromValues(newPeriodData[i][1]), "x%i" % i)
        for i in normalClassIndices
    ]  # start times

    classIntervals = [
        model.NewFixedSizeIntervalVar(
            classStartTimes[i], newPeriodData[normalClassIndices[i]
                                              ][0] + minGapBetw, "xx%i" % i
        )
        for i in range(len(normalClassIndices))
    ]  # periods as intervals (corresponds to starttimes)

    specialIntervalVars = []
    for s in range(numCourses):  # handles classes with two+ periods across multiple days
        if not newPeriodData[s][2]:
            continue
        durations, specialperiods, _ = newPeriodData[s]
        numSpecPeriodsAsRange = range(len(specialperiods))

        # dummy bools we configure for constraints
        specialBools = [model.NewBoolVar("e%i" % i)
                        for i in numSpecPeriodsAsRange]

        # initially set to be 'anything' but will get constrained to be equal to some group of period start times in the next step
        A = model.NewIntVar(100, 560, "sA%i")
        B = model.NewIntVar(100, 560, "sB%i")

        for i in numSpecPeriodsAsRange:
            model.Add(A == specialperiods[i][0]).OnlyEnforceIf(specialBools[i])
            model.Add(B == specialperiods[i][1]).OnlyEnforceIf(specialBools[i])

        specialIntervalVars += reduce(
            lambda a, b: a + b,
            [
                [
                    model.NewOptionalFixedSizeIntervalVar(
                        specialperiods[i][0],
                        durations[0] + minGapBetw,
                        specialBools[i],
                        "spi%i" % i,
                    ),
                    model.NewOptionalFixedSizeIntervalVar(
                        specialperiods[i][1],
                        durations[1] + minGapBetw,
                        specialBools[i],
                        "sPi%i" % i,
                    ),
                ]
                for i in numSpecPeriodsAsRange
            ],
        )  # only one group of these will be enforced

        # ensures a single assignment of grouped periods
        model.AddExactlyOne(specialBools)

        # they can now be added as normal starttimes
        classStartTimes.insert(s, A)
        classStartTimes.append(B)

    dayDomain = cp_model.Domain.FromValues([int(i) for i in days])

    # restricts classes to be no earlier than start
    late = [
        model.NewFixedSizeIntervalVar(i * 100, earliestStartTime, "l%i" % i) for i in range(1, 6)
    ]
    nolate = [
        model.NewFixedSizeIntervalVar(
            i * 100 + latestEndTime + minGapBetw, 16, "l%i" % i)
        for i in range(1, 6)
    ]  # 16 is an arbitrary length

    if maxDays == 1:
        day = model.NewIntVarFromDomain(
            dayDomain, "day"
        )  # within domain of permitted days of the week
        for i in classStartTimes:
            # makes them all on the same day
            model.AddDivisionEquality(day, i, 100)

    if maxDays in [2, 3, 4]:
        Days = [
            model.NewIntVarFromDomain(dayDomain, "day%i" % i)
            for i in range(len(classStartTimes))
        ]  # dummy Day variables
        dayvars = [model.NewIntVarFromDomain(
            dayDomain, "dv%i" % i) for i in range(maxDays)]

        for i in range(len(classStartTimes)):
            model.AddDivisionEquality(
                Days[i], classStartTimes[i], 100)  # assigns a day

        # for class i in classes, the day of that class, Days[i], equals daysvars[j] for one j
        bools = [[] for _ in range(maxDays)]
        for i in range(len(classStartTimes)):
            basename = "b%i" % i
            for j in range(maxDays):
                bools[j].append(model.NewBoolVar(basename + "%i" % j))
                model.Add(Days[i] == dayvars[j]).OnlyEnforceIf(bools[j][i])
        for i in range(len(classStartTimes)):
            model.AddBoolXOr(bools[j][i] for j in range(maxDays))

    # makes the periods (and other constraints) not overlap
    model.AddNoOverlap(classIntervals + late + nolate + specialIntervalVars)

    # Create a solver and solve.
    solver = cp_model.CpSolver()

    """for when you want it to give a solution ↓"""
    status = solver.Solve(model)
    print("Status = %s" % solver.StatusName(status))
    if solver.StatusName(status) != "INFEASIBLE":
        sols = [solver.Value(classStartTimes[i]) for i in range(numCourses)]
        print(sols)
        return sols  # List[int]
    else:
        return []
