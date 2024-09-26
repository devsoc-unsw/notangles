import NetworkError from '../interfaces/NetworkError';
import { API_URL } from './config';

export type AutoTimetableResponse = [number[], boolean];
const getAutoTimetable = async (data: any): Promise<AutoTimetableResponse> => {
  try {
    const res = await fetch(`${API_URL.auto}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (res.status !== 201) {
      throw new NetworkError("Couldn't get response");
    }

    const content = await res.json();
    return [content.given, content.optimal];
  } catch (error) {
    throw new NetworkError(`Couldn't get response`);
  }
};

export default getAutoTimetable;
