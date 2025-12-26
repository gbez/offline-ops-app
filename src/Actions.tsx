import { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import Association from "./Components/Actions/Association";
import Email from "./Components/Actions/Email";
import ActivatePhones from './Components/Actions/ActivatePhones';


const simBody: { status: string} = {
  status: 'blank',
};

const phoneBody: { hasSIM: boolean} = {
  hasSIM: true,
};

const labelBody: {tracking_id: string} = {
    tracking_id: 'test',
};

const subscriptionBody: {subscription_id: string} = {
    subscription_id: ''
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
                firstBody={labelBody}
                secondBody={subscriptionBody}
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
                firstBody={labelBody}
                secondBody={subscriptionBody}
                />
        );
    } else if(action_id == "activatePhones"){
        return (<ActivatePhones />)
    } else if(action_id == "requestMoreLines"){
        return (<Email endpoint={"/moreLines"} />)
    } else if(action_id == "requestMoreBlankSims"){
        return (<Email endpoint={"/moreblanksims"} />)
    } else if(action_id == "testPhones"){
        return(<div><p>test phones</p></div>)
    } else if(action_id == "generateShippingLabels"){
        return (<Email endpoint={"/shipment-file"} />)
    } else if(action_id == "reorderMorePhones"){
        return (<Email endpoint={"/more-phones"} />)
    } else {
        return(<div><p>No Action Found</p></div>)
    }
}

export default Actions;