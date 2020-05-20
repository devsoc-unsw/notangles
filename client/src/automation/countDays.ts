import {ClassTime} from '../interfaces/CourseData'

export const countDays = (timetable: ClassTime []) => {
    var count = 0
    var days: Record<string, any> = {}
    timetable.forEach(time => {
        days[time.day]++
    })

    for (var key in days) {
        if (days[key] > 0) {
            count++
        }
    }

    return count
}