type Props = {
    columns: string[];
    readable: Record<string,string>;
    onCreateClick: () => void;
    onColumnClick: (column: string) => void;
    sortColumn: string | null;
    sortDirection: 'asc' | 'desc';
}

const TableHead = ({columns, readable, onCreateClick, onColumnClick, sortColumn, sortDirection}: Props) => {
    const getSortIndicator = (col: string) => {
        if (sortColumn !== col) return '';
        return sortDirection === 'asc' ? ' ↑' : ' ↓';
    };

    return (
        <tr>
            {columns.map((col) => (
                <th 
                    key={col} 
                    onClick={() => onColumnClick(col)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                    {readable[col]}{getSortIndicator(col)}
                </th>
            ))}
        </tr>
    )
}

export default TableHead;