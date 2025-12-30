import { useState, useEffect } from 'react';
import axios from 'axios';

interface Phone {
    isTested: boolean;
    isActive: number;
    [key: string]: any;
}

function TestPhones() {
    const [loading, setLoading] = useState(false);
    const [readyPhonesCount, setReadyPhonesCount] = useState(0);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const base = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchPhones = async () => {
            try {
                const response = await axios.get(`${base}/api/v1/phones`);
                const phones: Phone[] = response.data;
                
                // Filter phones where isTested is false and isActive is 1
                const readyPhones = phones.filter(phone => phone.isTested === false && phone.isActive === 1);
                setReadyPhonesCount(readyPhones.length);
            } catch (err: any) {
                console.error('Failed to fetch phones:', err);
            }
        };

        fetchPhones();
    }, [base]);

    const handleTestPhones = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const response = await axios.get(`${base}/testPhones`);
            setMessage(response.data.message || 'Test messages sent successfully!');
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Failed to send test messages');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Test Ready For Use Phones</h1>
            <p>There are {readyPhonesCount} number of phones that are ready, but not yet tested.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px', alignItems: 'center' }}>
                {readyPhonesCount > 0 && (
                    <button
                        onClick={handleTestPhones}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            width: 'fit-content'
                        }}
                    >
                        {loading ? 'Sending...' : 'Send Test Message to Phones'}
                    </button>
                )}

                <a 
                    href="/" 
                    style={{
                        display: 'inline-block',
                        padding: '10px 20px',
                        backgroundColor: '#ffde21',
                        color: 'black',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        width: 'fit-content'
                    }}
                >
                    Dashboard
                </a>
            </div>

            {message && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>
                    {message}
                </div>
            )}

            {error && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
                    {error}
                </div>
            )}
        </div>
    );
}

export default TestPhones;