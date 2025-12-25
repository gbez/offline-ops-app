import { useEffect, useState, type FormEvent } from 'react';
import axios from 'axios';
import TextFileLoader from '../../util/TextFileLoader';

type Props ={
    endpoint: string,
}

function Email({endpoint}:Props){
    const currentPath = window.location.pathname;
    const parts = currentPath.split('/');
    const resultParts = parts.slice(2);
    const currentAction = resultParts.join('/'); 

    const [email, setEmail] = useState('');
    const [submittedEmail, setSubmittedEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<any>(null);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmed = email.trim();
        if(!trimmed){
            setError('Please enter an email address.');
            return;
        }
        setError(null);
        setSubmittedEmail(trimmed);
        setEmail('');
    }

    useEffect(() => {
        if(!submittedEmail) return;
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            const base = import.meta.env.VITE_API_URL;
            const url = base + endpoint + '/' + submittedEmail;
            console.log(url);
            try{
                const res = await axios.get(url);
                setResponse(res.data);
            }catch(err:any){
                if(axios.isAxiosError(err) && err.code === 'ERR_CANCELED') return;
                setError(err?.message ?? 'Request failed');
            }finally{
                setLoading(false);
            }
        }
        fetchData();
    },[endpoint, submittedEmail]);

    return(
        <div className='email-action'>
            <TextFileLoader filePath={currentAction} />
            <div className='email-container'>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        id="emailAddress"
                        name="emailAddress"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button type="submit" disabled={loading}>Subscribe</button>
                </form>
                {loading && <p>Sending...</p>}
                {error && <p style={{color: 'red'}}>{error}</p>}
                {response && <p style={{color: 'green'}}>{response.data}</p>}
            </div>
        </div>
    )
}

export default Email;