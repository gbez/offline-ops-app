import type {Phone, Line, SIM} from "../../../Interfaces";
import {getPropertyValue} from"../../../Interfaces";

type Props = {
    data: Phone | SIM | Line,
    columns: string[];
    onRowClick: () => void;
    interfaceType: string;
}

const TableRow = ({columns,data, onRowClick, interfaceType}:Props) => {
    
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
        ...(needsHighlight() ? { backgroundColor: '#fff3cd', fontWeight: '500' } : {})
    };

    console.log('Rendering TableRow with data:', data);
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
                    return <td key={i}><span style={pillStyle}>{displayValue}</span></td>;
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
                    
                    return <td key={i}><span style={pillStyle}>{displayValue}</span></td>;
                }
                
                return <td key={i}>{displayValue}</td>;
            })}
        </tr>
    );
};

export default TableRow;