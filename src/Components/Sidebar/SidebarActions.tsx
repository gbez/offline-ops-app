

type actions = {
    sim2phone: string,
    subscription2label: string,
    label2phone: string,
    activatePhones: string,
    testPhones: string,
    [key: string]: string
}

const MyActions: actions = {
    "sim2phone": "SIM < > Phone",
    "subscription2label": "Subscription < > Label",
    "label2phone":"Label < > Phone",
    "activatePhones": "Activate Phones",
    "newPhoneLines": "Upload New Phone Lines",
    "generatePhoneBarcodes": "Generate Phone Barcodes",
    "testPhones": "Test Phones"
}

/**
 * "generateShippingLabels": "Generate Shipping Labels",
 * "requestMoreBlankSims": "Request More Blank SIMs",
    "reorderMorePhones": "Reorder More Phones",
 */

function SidebarActions() {
    return (
            <div className="sidebar-actions">
                <ul>
                    {Object.entries(MyActions).map(([key,value])=>(
                        <li key={key}><a href={`/actions/${key}`}className='clickable'>{value}</a></li>
                    ))}
                </ul>
            </div>
    )
}

export default SidebarActions;