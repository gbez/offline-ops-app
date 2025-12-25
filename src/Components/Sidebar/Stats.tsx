import { useEffect, useState } from 'react';

function Stats() {
    const [data, setData] = useState<string>('');
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
        setData('');
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
            <h5>Lines</h5>
                <p>Active Lines: 5</p>
            <h5>SIMs</h5>
                <p>Available SIMs: 10</p>
            <h5>Phones</h5>
                <p>Active Phones: 5</p>
            <h5>Subscriptions</h5>
                <p>Active Subscriptions: 5</p>
            <h5>Shipments</h5>
                <p>Active Shipments: 5</p>

        </div>
    )
}

export default Stats;