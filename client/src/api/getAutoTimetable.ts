import NetworkError from '../interfaces/NetworkError';
import { API_URL } from './config';

const getAutoTimetable = async (data: any): Promise<[number[], boolean]> => {
  try {
    const res = await fetch(`${API_URL.auto}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (res.status !== 200) {
      throw new NetworkError("Couldn't get response");
    }

    const content = await res.json();
    return [content.given, content.optimal];
  } catch (error) {
    throw new NetworkError("Couldn't get response");
  }
};

export default getAutoTimetable;
