import { useEffect, useState } from 'react';
import Stats from "./Stats";
import SidebarActions from "./SidebarActions"
import Settings from "./Settings"

function Sidebar(){
    const [sidebarType, setSidebarType] = useState<string>('stats');
    let display;
    switch(sidebarType){
        case 'settings':
            display= <Settings />;
            break;
        case 'sidebarActions':
            display=  <SidebarActions />;
            break;
        case 'stats':
            display=  <Stats />;
            break;
    }

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
                 <li
                    key={3}
                    onClick={() => setSidebarType('settings')}
                    className={`clickable ${sidebarType=='settings' ? 'selected' : ''}`}>
                        Settings
                </li>
            </ul>
            {display}
        </div>
    )
}

export default Sidebar;