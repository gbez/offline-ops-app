import { useEffect, useState } from 'react';
import Table from './Table';

type SheetLabels = {
    phonelines: string,
    phones: string,
    sims: string,
    [key: string]: string
}

const MySheetLabels: SheetLabels = {"phonelines": "Lines","phones": "Phones","sims": "SIMs"};

function Sheet(){
    const [sheetName, setSheetName] = useState<string>('phonelines');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [triggerCreate, setTriggerCreate] = useState<number>(0);

    const handleSheetChange = (newSheet: string) => {
        setSheetName(newSheet);
        setSearchQuery('');
    };

    const handleCreateClick = () => {
        setTriggerCreate(prev => prev + 1);
    };

    return (
        <div>
            <div className="sheet-container">
                <div className="sheet-title">
                    <h3>{MySheetLabels[sheetName]}</h3>
                </div>
                <div className="sheet-options">
                    <ul>
                        {Object.entries(MySheetLabels).map(([key,value])=>(
                            <li 
                                key={key}
                                onClick={() => handleSheetChange(key)}
                                className={`clickable ${sheetName==key ? 'selected' : ''}`}
                            >{value}</li>
                        ))}
                    </ul>
                </div>
                <div className="sheet-table">
                    <Table name={sheetName} searchQuery={searchQuery} triggerCreate={triggerCreate} />
                </div>
                <div className="search-bar">
                    <input 
                        type="text" 
                        placeholder="Type to filter..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                    />
                </div>
            </div>
        </div>
    );
}

export default Sheet;