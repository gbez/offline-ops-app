import { useEffect, useState } from 'react';
import TableRow from './TableRow';
import TableHead from './TableHead';
import Modal from '../../Modal';
import type { Phone, Line, SIM } from '../../../Interfaces';

type TableProps = {
    name: string;
    searchQuery: string;
    triggerCreate: number;
};

const fields: Record<string, string[]> = {
    phonelines: ["phone_number","owner_name","status","subscription_id","owner_type","source"],
    sims: ["sim_number","status"],
    phones: ["imei","sim_number","isActive","hasSIM","isTested"]
};

const readableFields: Record<string, string> = {
  phone_number: "Phone Number",
  sim_number: "SIM",
  subscription_id: "Subscription",
  status: "Status",
  owner_type:"Type",
  source: "Source",
  imei:"IMEI",
  hasSIM: "Has SIM?",
  isTested: "Tested?",
  shipped: "Shipped?",
  owner_name: "Name",
  isActive: "Active?"
}

const primaryKeys: Record<string, string> = {
  phonelines: "phone_number",
  sims: "sim_number",
  phones: "imei"
};

function filterDataByQuery(data: (Phone | Line | SIM)[], query: string):(Phone | Line | SIM)[]{
  // Convert the query to lowercase for case-insensitive comparison
  const lowerCaseQuery = query.toLowerCase();

  return data.filter(item => {
    // Iterate over all keys (field names) in the current object
    for (const key in item) {
      if (Object.prototype.hasOwnProperty.call(item, key)) {
        const value = item[key];
        // Check if the value is not null or undefined, and if it's a string or can be converted to one
        if (value !== null && value !== undefined) {
          const stringValue = String(value).toLowerCase();

          // Check if the lowercase string value includes the lowercase query
          if (stringValue.includes(lowerCaseQuery)) {
            // If a match is found in any field, include this item in the filtered results
            return true;
          }
        }
      }
    }
    return false;
  });
}

function Table({name,searchQuery,triggerCreate}: TableProps) {
  const [data, setData] = useState<(Phone | Line | SIM)[]>([]);
  const [filteredData, setFilteredData] = useState<(Phone | Line | SIM)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedData, setSelectedData] = useState<Phone | Line | SIM | undefined>(undefined);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
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

  useEffect(() => {
    let result = data;
    
    // Apply search filter
    if (searchQuery.trim()) {
      result = filterDataByQuery(data, searchQuery);
    }
    
    // Apply sorting
    if (sortColumn) {
      result = [...result].sort((a, b) => {
        const aValue = a[sortColumn as keyof typeof a];
        const bValue = b[sortColumn as keyof typeof b];
        
        // Handle null/undefined
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        
        // Convert to strings for comparison
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        const comparison = aStr.localeCompare(bStr);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    
    setFilteredData(result);
  }, [data, searchQuery, sortColumn, sortDirection]);

  const handleColumnSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle between asc and desc
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

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
  console.log(columns);

    return (
        <>
        <div className='table'>
        <table>
            <thead>
                <TableHead 
                  columns={columns} 
                  readable={readableFields} 
                  onCreateClick={handleOpenCreateModal}
                  onColumnClick={handleColumnSort}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                />
            </thead>
            <tbody>
               {filteredData && filteredData.map((row, i) => (
                <TableRow key={i} columns={columns} data={row} onRowClick={() => handleOpenEditModal(row)} interfaceType={name} />
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