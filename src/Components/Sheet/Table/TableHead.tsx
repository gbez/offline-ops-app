type Props = {
    columns: string[];
    readable: Record<string,string>;
    onCreateClick: () => void;
    onColumnClick: (column: string) => void;
    sortColumn: string | null;
    sortDirection: 'asc' | 'desc';
    columnWidths: Record<string, number>;
    onResizeStart: (e: React.MouseEvent, column: string) => void;
}

const TableHead = ({columns, readable, onColumnClick, sortColumn, sortDirection, columnWidths, onResizeStart}: Props) => {
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
                    style={{ 
                        cursor: 'pointer', 
                        userSelect: 'none',
                        position: 'relative',
                        width: columnWidths[col] ? `${columnWidths[col]}px` : 'auto',
                        minWidth: columnWidths[col] ? `${columnWidths[col]}px` : 'auto'
                    }}
                >
                    {readable[col]}{getSortIndicator(col)}
                    <div
                        onMouseDown={(e) => onResizeStart(e, col)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            height: '100%',
                            width: '5px',
                            cursor: 'col-resize',
                            userSelect: 'none',
                            zIndex: 1
                        }}
                    />
                </th>
            ))}
        </tr>
    )
}

export default TableHead;