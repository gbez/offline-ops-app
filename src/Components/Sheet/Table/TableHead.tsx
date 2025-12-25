import React from 'react';

type Props = {
    columns: string[];
    readable: Record<string,string>
}

const TableHead = ({columns,readable}: Props) => {
    return (
        <tr>
            {columns.map((col) => (
                <th>{readable[col]}</th>
            ))}
            <th><button>Create</button></th>
        </tr>
    )
}

export default TableHead;