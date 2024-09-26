import { useState, useEffect } from 'react';

interface UseQueryOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
}

interface UseQueryResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
}

function useQuery<Data>(
  queryKey: string,
  fetchFunction: () => Promise<Data>,
  options: UseQueryOptions = {},
): UseQueryResult<Data> {
  const { enabled = true, refetchOnMount = true } = options;

  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (enabled && refetchOnMount) {
      fetchData();
    }
  }, [queryKey]);

  const fetchData = async () => {
    setIsLoading(true);
    setIsFetching(true);
    setError(null);
    try {
      const response = await fetchFunction();
      setData(response);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  return { data, error, isLoading, isFetching, refetch: fetchData };
}

export default useQuery;

/**
 * import React from 'react';
import useQuery from './useQuery';

interface ApiResponse {
  id: number;
  name: string;
}

function App() {
  const fetchData = async (): Promise<ApiResponse> => {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  };

  const { data, error, isLoading, refetch } = useQuery<ApiResponse>(
    'dataKey',
    fetchData
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Data:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={refetch}>Refetch Data</button>
    </div>
  );
}

export default App;

 */
