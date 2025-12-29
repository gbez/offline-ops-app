import { useEffect, useState } from 'react';
import TableRow from './TableRow';
import TableHead from './TableHead';
import Modal from '../../Modal';
import type { Phone, Line, SIM } from '../../../Interfaces';
import useApiData from '../../../util/useApiData';

type TableProps = {
    name: string;
    searchQuery: string;
};

const fields: Record<string, string[]> = {
    phonelines: ["phone_number","owner_name","status","subscription_id","owner_type","source"],
    sims: ["sim_number","status"],
    phones: ["imei","sim_number","isActive","isTested"]
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

// const primaryKeys: Record<string, string> = {
//   phonelines: "phone_number",
//   sims: "sim_number",
//   phones: "imei"
// };

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

function Table({name,searchQuery}: TableProps) {
  // Use the custom hook to fetch data from the API
  // This replaces the manual useEffect, useState for data/loading/error
  const { data, isLoading, error, refetch } = useApiData<Phone | Line | SIM>(name);
  
  const [filteredData, setFilteredData] = useState<(Phone | Line | SIM)[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedData, setSelectedData] = useState<Phone | Line | SIM | undefined>(undefined);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [isResizing, setIsResizing] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  
  useEffect(() => {
    let result = data;
    
    // Apply search filter
    if (searchQuery.trim()) {
      result = filterDataByQuery(data, searchQuery);
    }
    
    // For phonelines, prioritize rows with non-blank action field ONLY on initial load
    // (no search query and no user-defined sorting)
    if (name === 'phonelines' && !searchQuery.trim() && !sortColumn) {
      result = [...result].sort((a, b) => {
        const aHasAction = 'action' in a && a.action !== null && a.action !== undefined && a.action !== '';
        const bHasAction = 'action' in b && b.action !== null && b.action !== undefined && b.action !== '';
        
        // If both have action or both don't have action, maintain current order (0)
        // If only a has action, it should come first (-1)
        // If only b has action, it should come first (1)
        if (aHasAction && !bHasAction) return -1;
        if (!aHasAction && bHasAction) return 1;
        return 0;
      });
    }
    
    // Apply user-defined sorting
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
  }, [data, searchQuery, sortColumn, sortDirection, name]);

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

  const handleResizeStart = (e: React.MouseEvent, column: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizingColumn(column);
    setStartX(e.clientX);
    const currentWidth = columnWidths[column] || 150; // Default width if not set
    setStartWidth(currentWidth);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingColumn) return;
      const diff = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + diff); // Minimum width of 50px
      setColumnWidths(prev => ({
        ...prev,
        [resizingColumn]: newWidth
      }));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizingColumn(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizingColumn, startX, startWidth]);

  const handleModalSuccess = async () => {
    // Use the refetch function from the hook to refresh data
    // This is much simpler than the previous manual fetch logic!
    refetch();
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
        <table>
            <thead>
                <TableHead 
                  columns={columns} 
                  readable={readableFields} 
                  onCreateClick={handleOpenCreateModal}
                  onColumnClick={handleColumnSort}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  columnWidths={columnWidths}
                  onResizeStart={handleResizeStart}
                />
            </thead>
            <tbody>
               {filteredData && filteredData.map((row, i) => (
                <TableRow key={i} columns={columns} data={row} onRowClick={() => handleOpenEditModal(row)} interfaceType={name} columnWidths={columnWidths} />
               ))}
            </tbody>
        </table>
        
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