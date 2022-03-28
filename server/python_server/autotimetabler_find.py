from functools import reduce
import json
from ortools.sat.python import cp_model
import sys
import time

# special class that can be used to generate ALL the solutions

# reduces period data
def redlist(lists):
    l = lists
    if len(l[0]) == 1:  # for purely single-period classes
        duration = l[0][0][2] - l[0][0][1]
        return (duration * 2, list(map(lambda il: il[0][0] * 100 + il[0][1] * 2, l)), False)

    # for classes made of two consecutive periods (we merge into a single period)
    if l[0][0][0] == l[0][1][0]:
        duration = l[0][1][2] - l[0][0][1]
        return (duration * 2, list(map(lambda il: il[0][0] * 100 + il[0][1] * 2, l)), False)

    if l[0][0][1] != l[0][1][0]:  # for classes made up of a pair of periods on different days
        # assumes here that the duration is equivalent for simplicity but should be amended later
        duration = (l[0][0][2] - l[0][0][1])
        return (duration * 2, list(map(lambda il: tuple(i[0] * 100 + i[1] * 2 for i in il), l)), True)

    return []  # if i just missed something

'''yields solutions'''
def sols(start, end, days, gap, maxdays, periods):

    gap = gap * 2 # minimum break between classes
    mxd = maxdays if maxdays else len(days)

    newdata = [redlist(l) for l in periods]  # reduces data

    model = cp_model.CpModel() # start making the constraints model

    numCourses = len(newdata)
    normalClassIndices = list(i for i in range(numCourses) if not newdata[i][2])

    classStartTimes = [model.NewIntVarFromDomain(cp_model.Domain.FromValues(
        newdata[i][1]), 'x%i' % i) for i in normalClassIndices]  # start times
    classIntervals = [model.NewFixedSizeIntervalVar(
        classStartTimes[i], newdata[i][0] + gap, 'xx%i' % i) for i in normalClassIndices]  # periods as intervals (corresponds to starttimes)

    specialIntervalVars = []
    for s in range(numCourses):  # handles classes with two periods across multiple days
        if not newdata[s][2]: continue
        print('shouldntbehere')
        duration, specialperiods, _ = newdata[s]
        specPerIter = range(len(specialperiods))
        # dummy bools we configure for constraints
        specialBools = [model.NewBoolVar('e%i' % i) for i in specPerIter]

        # initially set to be 'anything' but will get constrained later by equality
        A = model.NewIntVar(100, 560, 'sA%i')
        B = model.NewIntVar(100, 560, 'sB%i')

        for i in specPerIter:
            model.Add(A == specialperiods[i][0]).OnlyEnforceIf(specialBools[i])
            model.Add(B == specialperiods[i][1]).OnlyEnforceIf(specialBools[i])

        specialIntervalVars = reduce(lambda a, b: a + b, [
            [model.NewOptionalFixedSizeIntervalVar(specialperiods[i][0], duration, specialBools[i], 'spi%i' % i),
             model.NewOptionalFixedSizeIntervalVar(specialperiods[i][1], duration, specialBools[i], 'sPi%i' % i)]
            for i in specPerIter])  # only one of these will be enforced

        model.AddExactlyOne(specialBools)  # ensures a single assignment

        # they can now be treated as normal starttimes
        classStartTimes.insert(s, A)
        classStartTimes.append(B)

    daydom = cp_model.Domain.FromValues([int(i) for i in days])

    # restricts classes to be no earlier than start
    late = []
    if start:
        earliest = start * 2
        late = [model.NewFixedSizeIntervalVar(
            i * 100, earliest, 'l%i' % i) for i in range(1, 6)]

    # restricts classes to go no later than end
    nolate = []
    if end:
        latest = end * 2 + gap
        nolate = [model.NewFixedSizeIntervalVar(
            i * 100 + latest, 10, 'l%i' % i) for i in range(1, 6)]

    if mxd == 1:
        # within domain of permitted days of the week
        day = model.NewIntVarFromDomain(daydom, 'day')
        for i in classStartTimes:
            model.AddDivisionEquality(day, i, 100) # makes them all on the same day

    if mxd in [2, 3, 4]:
        Days = [model.NewIntVarFromDomain(daydom, 'day%i' % i) for i in range(
            len(classStartTimes))]  # dummy Day variables
        dayvars = [model.NewIntVarFromDomain(
            daydom, 'dv%i' % i) for i in range(mxd)]

        for i in range(len(classStartTimes)):
            model.AddDivisionEquality(
                Days[i],  classStartTimes[i], 100)  # assigns a day

        # for class i in classes, the day of that class, Days[i], equals daysvars[j] for one j
        bools = [[] for _ in range(mxd)]
        for i in range(len(classStartTimes)):
            basename = 'b%i' % i
            for j in range(mxd):
                bools[j].append(model.NewBoolVar(basename + '%i' % j))
                model.Add(Days[i] == dayvars[j]).OnlyEnforceIf(bools[j][i])
        for i in range(len(classStartTimes)):
            model.AddBoolXOr(bools[j][i] for j in range(mxd))

    # makes the periods (and other constraints) not overlap
    model.AddNoOverlap(classIntervals + late + nolate + specialIntervalVars)

    # solution and printing

    # Create a solver and solve.
    solver = cp_model.CpSolver()

    '''for when you want it to give a solution ↓'''
    status = solver.Solve(model)
    print('Status = %s' % solver.StatusName(status))
    if solver.StatusName(status) != 'INFEASIBLE':
        sol = [solver.Value(classStartTimes[i]) for i in range(numCourses)]
        print(sol)
        return sol # List[int]
    else:
        return [0]