import React from 'react';
import type {Phone, Line, SIM} from "../../../Interfaces";
import {getPropertyValue} from"../../../Interfaces";

type Props = {
    data: Phone | SIM | Line,
    columns: string[]
}

const TableRow = ({columns,data}:Props) => {
    return (
        <tr>
            {columns.map((col,i) => (
                <td key={i}>{getPropertyValue(data,col as keyof typeof data)}</td>
            ))}
            <td>
                Edit
            </td>
            <td>
                Save
            </td>
        </tr>
    );
};

export default TableRow;