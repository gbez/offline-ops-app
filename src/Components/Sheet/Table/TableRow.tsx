import type {Phone, Line, SIM} from "../../../Interfaces";
import {getPropertyValue} from"../../../Interfaces";

type Props = {
    data: Phone | SIM | Line,
    columns: string[];
    onRowClick: () => void;
}

const TableRow = ({columns,data, onRowClick}:Props) => {
    console.log('TableRow cols:', columns);
    return (
        <tr onClick={onRowClick} style={{ cursor: 'pointer' }}>
            {columns.map((col,i) => {
                const value = getPropertyValue(data,col as keyof typeof data);
                const displayValue = typeof value === 'boolean' ? String(value) : value;
                return <td key={i}>{displayValue}</td>;
            })}
        </tr>
    );
};

export default TableRow;