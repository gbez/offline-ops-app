import { useParams } from "react-router-dom";
import Association from "./Components/Actions/Association";
import Email from "./Components/Actions/Email";
import ActivatePhones from './Components/Actions/ActivatePhones';
import Barcodes from './Components/Actions/Barcodes';
import NewPhoneLines from './Components/Actions/NewPhoneLines';
import TestPhones from "./Components/Actions/TestPhones";


const simBody: { status: string} = {
  status: 'blank',
};

const phoneBody: { hasSIM: boolean} = {
  hasSIM: true,
};

const subscriptionBody: {assigned_to_phone: boolean} = {
    assigned_to_phone: false
}

function Actions() {
    const { action_id } = useParams(); 
    if(action_id == "sim2phone"){
        return (
            <Association 
                firstEndPoint={"phones"} 
                secondEndPoint={"sims"}
                firstPK={"imei"}
                secondPK={"sim_number"}
                foreignKeyField={"sim_number"}
                firstBody={phoneBody}
                secondBody={simBody}
                />
        );
    } else if(action_id == "subscription2label"){
        return (
            <Association 
                firstEndPoint={"labels"} 
                secondEndPoint={"subscriptions"}
                firstPK={"tracking_id"}
                secondPK={"subscription_id"}
                foreignKeyField={"subscription_id"}
                firstBody={{}}
                secondBody={{}}
                />
        );
    }  else if(action_id == "label2phone"){
        return (
            <Association 
                firstEndPoint={"phones"} 
                secondEndPoint={"labels"}
                firstPK={"imei"}
                secondPK={"tracking_id"}
                foreignKeyField={"tracking_id"}
                firstBody={{}}
                secondBody={subscriptionBody}
                />
        );
    } else if(action_id == "activatePhones"){
        return (<ActivatePhones />)
    } else if (action_id == "newPhoneLines"){
        return (<NewPhoneLines />)
    } else if(action_id == "testPhones"){
        return(<TestPhones />)
    } else if(action_id == "generateShippingLabels"){
        return (<Email endpoint={"/shipment-file"} />)
    } else if(action_id == "generatePhoneBarcodes"){
        return (<Barcodes />)
    } else if(action_id == "reorderMorePhones"){
        return (<Email endpoint={"/more-phones"} />)
    } else {
        return(<div><p>No Action Found</p></div>)
    }
}

export default Actions;