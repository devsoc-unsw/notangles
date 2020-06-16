import {ClassTime} from '../interfaces/CourseData'

export const countDays = (timetable: ClassTime []) => {
    var count = 0
    var days: Record<string, number> = {}
    timetable.forEach(time => {
        days[time.day] = 1
    })

    return Object.keys(days).length
}