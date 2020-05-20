import {CourseData, ClassData, Period, ClassTime} from '../interfaces/CourseData'

export const clash = (time1: ClassTime, time2: ClassTime): boolean => {
    if (time1.day != time2.day) {
        return false;
    }

    const start_hour1 = Number(time1.start.substring(0,2))
    const start_hour2 = Number(time2.start.substring(0,2))
    const start_min1 = Number(time1.start.substring(3,5))
    const start_min2 = Number(time2.start.substring(3,5))

    const end_hour1 = Number(time1.end.substring(0,2))
    const end_hour2 = Number(time2.end.substring(0,2))
    const end_min1 = Number(time1.end.substring(3,5))
    const end_min2 = Number(time2.end.substring(3,5))

    if (start_hour2 > start_hour1 && start_hour2 < end_hour1) {
        return true
    }

    if (start_hour1 > start_hour2 && start_hour1 < end_hour2) {
        return true
    }

    if (end_hour2 > start_hour1 && end_hour2 < end_hour1) {
        return true
    }

    if (end_hour1 > start_hour2 && end_hour1 < end_hour2) {
        return true
    }

    return false;
}