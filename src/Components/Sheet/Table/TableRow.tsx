import type {Phone, Line, SIM} from "../../../Interfaces";
import {getPropertyValue} from"../../../Interfaces";

type Props = {
    data: Phone | SIM | Line,
    columns: string[];
    onRowClick: () => void;
}

const TableRow = ({columns,data, onRowClick}:Props) => {
    return (
        <tr onClick={onRowClick} style={{ cursor: 'pointer' }}>
            {columns.map((col,i) => (
                <td key={i}>{getPropertyValue(data,col as keyof typeof data)}</td>
            ))}
        </tr>
    );
};

export default TableRow;