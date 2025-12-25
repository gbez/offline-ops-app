import { useEffect, useState } from 'react';
import TableRow from './TableRow';
import TableHead from './TableHead';
import Modal from '../../Modal';
import type { Phone, Line, SIM } from '../../../Interfaces';

type TableProps = {
    name: string;
};

const fields: Record<string, string[]> = {
    phonelines: ["phone_number","sim_number","subscription_id","status","owner_type","source"],
    sims: ["sim_number","status"],
    phones: ["imei","sim_number","hasSIM","tested","shipped"]
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
  tested: "Tested?",
  shipped: "Shipped?"
}

function Table({name}: TableProps) {
  const [data, setData] = useState<Phone[] | SIM[] | Line[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedData, setSelectedData] = useState<Phone | Line | SIM | undefined>(undefined);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const base = import.meta.env.VITE_API_URL;
        const url = `${base}/api/v1/${name}`;
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
  }, [name]);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedData(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rowData: Phone | Line | SIM) => {
    setModalMode('edit');
    setSelectedData(rowData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedData(undefined);
  };

  const handleModalSuccess = async () => {
    // Refresh data after successful create/update
    setIsLoading(true);
    try {
      const base = import.meta.env.VITE_API_URL;
      const url = `${base}/api/v1/${name}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const columns: string[] = fields[name];

    return (
        <>
        <div className='table'>
        <table>
            <thead>
                <TableHead columns={columns} readable={readableFields} onCreateClick={handleOpenCreateModal} />
            </thead>
            <tbody>
               {data && data.map((row, i) => (
                <TableRow key={i} columns={columns} data={row} onRowClick={() => handleOpenEditModal(row)} />
               ))}
            </tbody>
        </table>
        </div>
        
        <Modal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            mode={modalMode}
            interfaceType={name as 'phones' | 'phonelines' | 'sims'}
            data={selectedData}
            onSuccess={handleModalSuccess}
        />
        </>
    );
}

export default Table;