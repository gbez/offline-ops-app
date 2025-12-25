import { useEffect, useState } from 'react';
import Stats from "./Stats";
import SidebarActions from "./SidebarActions"

function Sidebar(){
    const [sidebarType, setSidebarType] = useState<string>('stats');
    const display = sidebarType == 'stats' ? <Stats /> : <SidebarActions />;
    return(
        <div>
            <ul className='sidebar-options'>
                <li
                    key={1}
                    onClick={() => setSidebarType('stats')}
                    className={`clickable ${sidebarType=='stats' ? 'selected' : ''}`}>
                        Stats
                </li>
                <li
                    key={2}
                    onClick={() => setSidebarType('sidebarActions')}
                    className={`clickable ${sidebarType=='sidebarActions' ? 'selected' : ''}`}>
                        Actions
                </li>
            </ul>
            {display}
        </div>
    )
}

export default Sidebar;