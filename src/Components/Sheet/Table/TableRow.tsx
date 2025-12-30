import type {Phone, Line, SIM} from "../../../Interfaces";
import {getPropertyValue} from"../../../Interfaces";

type Props = {
    data: Phone | SIM | Line,
    columns: string[];
    onRowClick: () => void;
    interfaceType: string;
    columnWidths: Record<string, number>;
}

const TableRow = ({columns,data, onRowClick, interfaceType, columnWidths}:Props) => {
    
    // Determine if row needs highlighting
    const needsHighlight = () => {
        // For phonelines, highlight if action field is not blank
        if (interfaceType === 'phonelines' && 'action' in data) {
            const actionValue = data.action;
            return actionValue !== null && actionValue !== undefined && actionValue !== '';
        }
        // Add more conditions here for other interfaces if needed
        return false;
    };
    
    const rowStyle: React.CSSProperties = {
        cursor: 'pointer',
        ...(needsHighlight() ? { backgroundColor: '#fcb8afff', fontWeight: '500' } : {})
    };

    return (
        <tr onClick={onRowClick} style={rowStyle}>
            {columns.map((col,i) => {
                const value = getPropertyValue(data,col as keyof typeof data);
                // Convert boolean or numeric 0/1 to string representation
                let displayValue = value;
                if (typeof value === 'boolean') {
                    displayValue = String(value);
                } else if (value === 0 || value === 1) {
                    displayValue = value === 1 ? 'true' : 'false';
                }
                
                // Style true/false values as colored pills
                if (displayValue === 'true' || displayValue === 'false') {
                    const pillStyle: React.CSSProperties = {
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.85em',
                        fontWeight: '500',
                        backgroundColor: displayValue === 'true' ? '#d4edda' : '#f8d7da',
                        color: displayValue === 'true' ? '#155724' : '#721c24',
                        border: `1px solid ${displayValue === 'true' ? '#c3e6cb' : '#f5c6cb'}`
                    };
                    const cellStyle: React.CSSProperties = {
                        width: columnWidths[col] ? `${columnWidths[col]}px` : 'auto',
                        minWidth: columnWidths[col] ? `${columnWidths[col]}px` : 'auto',
                        maxWidth: columnWidths[col] ? `${columnWidths[col]}px` : 'auto',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    };
                    return <td key={i} style={cellStyle}><span style={pillStyle}>{displayValue}</span></td>;
                }
                
                // Style SIM status values as colored pills
                if (interfaceType === 'sims' && col === 'status') {
                    let pillStyle: React.CSSProperties = {
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.85em',
                        fontWeight: '500'
                    };
                    
                    if (displayValue === 'Active') {
                        pillStyle = {
                            ...pillStyle,
                            backgroundColor: '#cfe2ff',
                            color: '#084298',
                            border: '1px solid #b6d4fe'
                        };
                    } else if (displayValue === 'Blank') {
                        pillStyle = {
                            ...pillStyle,
                            backgroundColor: '#fff3cd',
                            color: '#856404',
                            border: '1px solid #ffeaa7'
                        };
                    } else if (displayValue === 'Retired') {
                        pillStyle = {
                            ...pillStyle,
                            backgroundColor: '#bc3014ff',
                            color: '#e5dad7ff',
                            border: '1px solid #5f1b00ff'
                        };
                    }
                    
                    const cellStyle: React.CSSProperties = {
                        width: columnWidths[col] ? `${columnWidths[col]}px` : 'auto',
                        minWidth: columnWidths[col] ? `${columnWidths[col]}px` : 'auto',
                        maxWidth: columnWidths[col] ? `${columnWidths[col]}px` : 'auto',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    };
                    return <td key={i} style={cellStyle}><span style={pillStyle}>{displayValue}</span></td>;
                }
                
                const cellStyle: React.CSSProperties = {
                    width: columnWidths[col] ? `${columnWidths[col]}px` : 'auto',
                    minWidth: columnWidths[col] ? `${columnWidths[col]}px` : 'auto',
                    maxWidth: columnWidths[col] ? `${columnWidths[col]}px` : 'auto',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                };
                return <td key={i} style={cellStyle}>{displayValue}</td>;
            })}
        </tr>
    );
};

export default TableRow;