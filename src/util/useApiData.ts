import { useEffect, useState } from 'react';

/**
 * Custom hook for fetching data from the API
 * 
 * @param endpoint - The API endpoint to fetch from (e.g., 'phones', 'sims', 'phonelines')
 * @returns An object containing:
 *   - data: The fetched data array (or empty array if loading/error)
 *   - isLoading: Boolean indicating if the request is in progress
 *   - error: Error message string or null if no error
 *   - refetch: Function to manually trigger a data refresh
 * 
 * @example
 * ```tsx
 * import useApiData from './util/useApiData';
 * 
 * function MyComponent() {
 *   const { data, isLoading, error, refetch } = useApiData('phones');
 * 
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 * 
 *   return (
 *     <div>
 *       {data.map(item => <div key={item.id}>{item.name}</div>)}
 *       <button onClick={refetch}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
function useApiData<T = any>(endpoint: string) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Add a refresh trigger to allow manual refetching
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Create an async function inside useEffect to fetch data
    const fetchData = async () => {
      // Reset states at the start of fetch
      setIsLoading(true);
      setError(null);

      try {
        // Get the base API URL from environment variables
        const base = import.meta.env.VITE_API_URL;
        const url = `${base}/api/v1/${endpoint}`;
        
        // Fetch data from the API
        const response = await fetch(url);
        
        // Check if the response was successful
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse the JSON response
        const result = await response.json();
        
        // Update state with the fetched data
        setData(result);
        setError(null);
      } catch (err) {
        // Handle any errors that occurred during fetch
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setData([]);
      } finally {
        // Always set loading to false when done (whether success or error)
        setIsLoading(false);
      }
    };

    // Call the fetch function
    fetchData();
  }, [endpoint, refreshTrigger]); // Re-run when endpoint or refreshTrigger changes

  // Function to manually trigger a refresh of the data
  const refetch = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Return the state values and refetch function
  return { data, isLoading, error, refetch };
}

export default useApiData;
