import NetworkError from '../interfaces/NetworkError';

const getAutoTimetable = async (data: any): Promise<number[]> => {
  try {
    const res = await fetch('http://localhost:3001/auto', {
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
    return content.given;
  } catch (error) {
    throw new NetworkError("Couldn't get response");
  }
};

export default getAutoTimetable;
