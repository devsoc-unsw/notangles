import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Config, Activity, Course, CreatedEvent } from './ctfConfigInterfaces';
@Injectable()
export class CtfService {
  private ctfConfig: Config;
  constructor(private configService: ConfigService) {
    const ctfConfigBase64 = this.configService.get<string>('CTF_CONFIG');
    if (!ctfConfigBase64) {
      throw new Error('CTF_CONFIG is not set in the environment variables');
    }
    this.ctfConfig = JSON.parse(atob(ctfConfigBase64)) as Config;
  }

  validateCTFConfig(localStorage: string): boolean {
    const localConfig = JSON.parse(localStorage) as Config;

    return (
      this.checkColorTheme(localConfig.currentTheme) &&
      this.checkSelectedCourses(
        localConfig.timetables.T22025[0].selectedCourses,
      ) &&
      this.checkSelectedClasses(
        localConfig.timetables.T22025[0].selectedClasses,
      ) &&
      this.checkCreatedEvents(localConfig.timetables.T22025[0].createdEvents)
    );
  }

  checkColorTheme(currentTheme: string): boolean {
    return currentTheme === this.ctfConfig.currentTheme;
  }

  checkSelectedCourses(selectedCourses: Course[]): boolean {
    const configCourseCodes =
      this.ctfConfig.timetables.T22025[0].selectedCourses.map(
        (course) => course.code,
      );
    const selectedCourseCodes = selectedCourses.map((course) => course.code);
    return selectedCourseCodes.every((code) =>
      configCourseCodes.includes(code),
    );
  }

  checkSelectedClasses(
    selectedClasses: Record<string, Record<string, Activity>>,
  ): boolean {
    const configSelectedClasses =
      this.ctfConfig.timetables.T22025[0].selectedClasses;

    const normSelectedClasses = Object.fromEntries(
      Object.entries(selectedClasses).map(([key, value]) => [
        key,
        Object.fromEntries(
          Object.entries(value).map(([subKey, subValue]) => [
            subKey,
            subValue.classNo,
          ]),
        ),
      ]),
    );

    const normConfigSelectedClasses = Object.fromEntries(
      Object.entries(configSelectedClasses).map(([key, value]) => [
        key,
        Object.fromEntries(
          Object.entries(value).map(([subKey, subValue]) => [
            subKey,
            subValue.classNo,
          ]),
        ),
      ]),
    );
    return this.compareObjects(normConfigSelectedClasses, normSelectedClasses);
  }

  checkCreatedEvents(createdEvents: Record<string, CreatedEvent>): boolean {
    const configCreatedEvents =
      this.ctfConfig.timetables.T22025[0].createdEvents;

    const normCreatedEvents = Object.fromEntries(
      Object.entries(createdEvents).map(([, value]) => [
        value.event.name,
        value.time,
      ]),
    );
    const normConfigCreatedEvents = Object.fromEntries(
      Object.entries(configCreatedEvents).map(([, value]) => [
        value.event.name,
        value.time,
      ]),
    );
    return this.compareObjects(normConfigCreatedEvents, normCreatedEvents);
  }

  compareObjects(
    obj1: Record<string, any>,
    obj2: Record<string, any>,
  ): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (
        typeof obj1[key] === 'object' &&
        obj1[key] !== null &&
        typeof obj2[key] === 'object' &&
        obj2[key] !== null
      ) {
        if (!this.compareObjects(obj1[key], obj2[key])) {
          return false;
        }
      } else if (obj1[key] !== obj2[key]) {
        return false;
      }
    }

    return true;
  }
}
