import Sidebar from "./Components/Sidebar";
import Sheet from "./Components/Sheet";
import './css/Dashboard.css';

function Dashboard () {
    const currentYear = new Date().getFullYear(); // Get the current year
    return (
        <div className="dashboard">
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1>Offline Dashboard</h1>
                </div>
                <div className="dashboard-elements">
                    <div className="sidebar">
                        <Sidebar />
                    </div>
                    <div className="sheet">
                        <Sheet />
                    </div>
                </div>
                <div className="dashboard-footer">
                    <h3>&copy; {currentYear}  Offline Inc.</h3>
                    <p>Less is More</p>
                </div>
            </div>
        </div>
    )
}

export default Dashboard;