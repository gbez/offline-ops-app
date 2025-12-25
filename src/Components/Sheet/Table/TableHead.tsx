type Props = {
    columns: string[];
    readable: Record<string,string>;
    onCreateClick: () => void;
}

const TableHead = ({columns,readable, onCreateClick}: Props) => {
    return (
        <tr>
            {columns.map((col) => (
                <th key={col}>{readable[col]}</th>
            ))}
            <th><button onClick={onCreateClick}>Create</button></th>
        </tr>
    )
}

export default TableHead;