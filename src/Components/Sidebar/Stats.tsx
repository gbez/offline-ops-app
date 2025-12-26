import { useEffect, useState } from 'react';

function Stats() {
    const [data, setData] = useState<{label: string, value: string}[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
      
    
    useEffect(() => {
    const fetchData = async () => {
        try {
        const base = import.meta.env.VITE_API_URL;
        const url = `${base}/stats`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
        setError(null);
        } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setData([]);
        } finally {
        setIsLoading(false);
        }
    };
    fetchData();
    }, []);

    if (isLoading) {
    return <div>Loading data...</div>;
    }

    if (error) {
    return <div>Error: {error}</div>;
    }

    return (
        <div className="stats">
            {data.map((stat) => (
                <div className='stat-item'>
                    <p><strong>{stat.label}:</strong> {stat.value}</p>
                </div>
            ))}
        </div>
    )
}

export default Stats;