import { useEffect, useState } from 'react';
import TableRow from './TableRow';
import TableHead from './TableHead';
import type { Phone, Line, SIM } from '../../../Interfaces';

type TableProps = {
    name: string;
};

const fields: Record<string, string[]> = {
    phonelines: ["phone_number","sim_number","subscription_id","status","owner_type","source"],
    sims: ["sim_number","status"],
    phones: ["imei","sim_number","hasSIM","isTested","shipped"]
};

const readableFields: Record<string, string> = {
  phone_number: "Phone Number",
  sim_number: "SIM",
  subscription_id: "Subscription",
  status: "Status",
  owner_type:"Owner",
  source: "Source",
  imei:"IMEI",
  hasSIM: "Has SIM?",
  isTested: "Tested?",
  shipped: "Shipped?"
}

function Table({name}: TableProps) {
  const [data, setData] = useState<Phone[] | SIM[] | Line[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const base = import.meta.env.VITE_API_URL;
        const url = `${base}/api/v1/${name}`;
        const response = await fetch(url); // Replace with your API endpoint
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
  }, [name]);

  if (isLoading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const columns: string[] = fields[name];

    return (
        <div className='table'>
        <table>
            <thead>
                <TableHead columns={columns} readable={readableFields} />
            </thead>
            <tbody>
               {data && data.map((row, i) => (
                <TableRow key={i} columns={columns} data={row} />
               ))}
            </tbody>
        </table>
        </div>
    );
}

export default Table;