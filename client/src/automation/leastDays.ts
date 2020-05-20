import {CourseData, ClassData, Period, ClassTime} from '../interfaces/CourseData'
import {clash} from './clash'
import {countDays} from './countDays'

var classDict: Record<string, ClassTime[]> = {}

const leastDays = (courses: CourseData[], weekNumber: number) => {
    var classActivites = new Set()
    courses.forEach(course => {
        course["classes"].array.forEach(classInfo => {
            var classString = course.courseCode + "_" + classInfo.activity
            var l = classActivites.size
            classActivites.add(classString)
            if (classActivites.size > l) {
                classDict[classString] = []
            }
            
            var timeObjects: ClassTime[] = []
            classInfo["periods"].forEach(classPeriod => {
                timeObjects.push(classPeriod.time)
            })
            classDict[classString] = timeObjects
        })
    })

    var minDays: number = 8
    var minTT: ClassTime[] = []
    const firstkey: string = Object.keys(classDict)[0]
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
    });
    
    return reconstruct(minTT)
}

const fillTT = (keyNum: number, timetable: ClassTime[]) => {
    var newKeyNum = keyNum + 1
    if (newKeyNum >= Object.keys(classDict).length) {
        return timetable
    }

    var minTT: ClassTime[] = []
    var minDays: number = 8
    var key = Object.keys(classDict)[newKeyNum]
    classDict[newKeyNum].forEach(timeslot => {
        var newTT = timetable
        newTT.push(timeslot)
        newTT = fillTT(newKeyNum, newTT)
        var days = countDays(newTT)
        if (days < minDays) {
            minTT = newTT
            minDays = days
        }
    })

    return minTT
}

const reconstruct = (timetable: ClassTime[]) => {
    return timetable
}