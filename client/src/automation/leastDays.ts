import { CourseData, ClassData, Period, ClassTime } from '../interfaces/CourseData'
import { clash } from './clash'
import { countDays } from './countDays'

var classDict: Record<string, ClassTime[]> = {}
var keys : string[]

export const leastDays = (courses: CourseData[]) => {
    var classActivites = new Set()
    courses.forEach(course => {
        Object.keys(course["classes"]).forEach(classID => {
            var classString = course.courseCode + "_" + classID
            classDict[classString] = []
            course["classes"][classID].forEach(timeObject => {
                classDict[classString].push(timeObject.periods[0].time)
            })
        })
    })

    var minDays: number = 8
    var minTT: ClassTime[] = []
    keys = Object.keys(classDict)
    if (Object.keys(classDict).length > 0) {
        const firstkey: string = keys[0]
        classDict[firstkey].forEach(time => {
            var timetable: ClassTime[] = [time]
            timetable = fillTT(0, timetable)
            var days = countDays(timetable)
            if (days < minDays) {
                minDays = days
                minTT = timetable
            }
            if (minDays <= 1 ) {
                return reconstruct(timetable)
            }
        })

        return reconstruct(minTT)
    } else {
        return reconstruct(minTT)
    }
}

const fillTT = (keyNum: number, timetable: ClassTime[]) => {
    var newKeyNum = keyNum + 1
    if (newKeyNum >= keys.length) {
        return timetable
    }

    var minTT: ClassTime[] = []
    var minDays: number = 8
    var key = keys[newKeyNum]
    classDict[key].forEach(timeslot => {
        var clashing = false;
        timetable.forEach(time => {
            if (clash(timeslot, time) == true) {
                clashing = true;
            }
        })

        if (clashing == false) {
            var newTT = timetable.slice(0)
            newTT.push(timeslot)
            newTT = fillTT(newKeyNum, newTT)
            var days = countDays(newTT)
            if (days < minDays) {
                minTT = newTT
                minDays = days
            }
        }
    })

    return minTT
}

const reconstruct = (timetable: ClassTime[]) => {
    return timetable
}
