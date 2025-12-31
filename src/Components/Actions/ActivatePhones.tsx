import { useState, useEffect, useRef } from "react";
import axios from 'axios';
import useApiData from "../../util/useApiData";
//Either generate Bulk Sim Swap or Activate SIMS on Blanks.

// Start with if there are available lines.

//if there are available lines, prompt user to scan in x number of phones for swap
// 
//then generate bulk sim swap on phones where generate Bulk SIM Swap is initiated

//download sheet

//set status phones.bulkSIMSWap pending

//set the phoneLines second SIM to the new SIM

//open the T Mobile Business Account in a new tab

//Once the change is confirmmed by the user, 
// set the phoneLines sim to the second SIM 
// set the first sim status to "retired"
// set the second sim status to "active"
//change the phone bulkSImSwap to completed


//else generate activate sims on blanks email

//prompt user to scan in x number of sisms to activate.
// x should reflect at first a .env variable VITE_ACTIVATESIMONBLANKS_LIMIT
// but later this should be set dynamically as a setting.

//change the phone newActivationStatus to "initiated"
//once all scanned in,
//get all the sims on the phones with that status
//generate an email to send to the t-mobile rep, cc these other emails.
//I need to order x.length new lines on the following SIM cards please.

//Once the order is confirmed,
//set the phone newActivationStatus to "completed"
//change the status of the SIMs to "active"s

function getAvailableLines(lines: any[]) {
    return lines.filter(line => line.status === 'Available');
}

function filterBulkSimSwapPhones(phones: any[]) {
    return phones.filter(phone => phone.bulkSIMSwapStatus === 'Initiated');
}

function filterPendingSimSwapPhones(phones: any[]) {
    return phones.filter(phone => phone.bulkSIMSwapStatus === 'Pending');
}

function filterNewActivationPhones(phones: any[]) {
    return phones.filter(phone => phone.newActivationStatus === 'Initiated');
}

function filterPendingActivationPhones(phones: any[]) {
    return phones.filter(phone => phone.newActivationStatus === 'Pending');
}


function ActivatePhones() {
    const [instructions, setInstructions] = useState("Scan in phones to activate their SIMs.");
    const [submitButton, setSubmitButton] = useState("Generate Bulk SIM Swap");
    const [scannerMode, setScannerMode] = useState(true);
    const [phoneInput, setPhoneInput] = useState('');
    const [displayedPhones, setDisplayedPhones] = useState<any[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [remainingSlots, setRemainingSlots] = useState(0);
    const [hasAvailableLines, setHasAvailableLines] = useState(false);
    const [showConfirmButton, setShowConfirmButton] = useState(false);
    const [mode, setMode] = useState<'bulkSwap' | 'pending' | 'activation' | 'activationPending'>('bulkSwap');
    const [isPhoneListExpanded, setIsPhoneListExpanded] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    
    // Fetch all phones from the API
    const { data: phones } = useApiData('phones');
    
    // Fetch all phone lines from the API
    const { data: lines } = useApiData('phonelines');

    // Console log the data to confirm it's loading
    
    useEffect(() => {
        const availableLines = getAvailableLines(lines);
        const bulkSwapPhones = filterBulkSimSwapPhones(phones);
        const pendingPhones = filterPendingSimSwapPhones(phones);
        const activationPhones = filterNewActivationPhones(phones);
        const pendingActivationPhones = filterPendingActivationPhones(phones);
        
        // Determine which mode we're in
        // Check pending phones first to avoid showing wrong mode
        if (pendingPhones.length > 0) {
            // Mode 3: Pending confirmation (change Pending -> Completed)
            setMode('pending');
            setHasAvailableLines(false);
            setShowConfirmButton(true);
            setDisplayedPhones(pendingPhones);
            setRemainingSlots(0);
            setInstructions(`Bulk SIM swap pending for ${pendingPhones.length} phone${pendingPhones.length === 1 ? '' : 's'}. Confirm when complete.`);
            setSubmitButton(""); // Hide submit button in pending mode
            setErrorMessage('');
        } else if (pendingActivationPhones.length > 0) {
            // Mode: Activation Pending confirmation (change Pending -> Completed)
            setMode('activationPending');
            setHasAvailableLines(false);
            setShowConfirmButton(true);
            setDisplayedPhones(pendingActivationPhones);
            setRemainingSlots(0);
            setInstructions(`New activation pending for ${pendingActivationPhones.length} phone${pendingActivationPhones.length === 1 ? '' : 's'}. Upload New Lines from T Mobile Order Confirmation Email.`);
            setSubmitButton(""); // Hide submit button in pending mode
            setErrorMessage('');
        } else if (availableLines.length > 0) {
            // Mode 1: Bulk swap mode - scan phones to initiate
            setMode('bulkSwap');
            setHasAvailableLines(true);
            setShowConfirmButton(false);
            setDisplayedPhones(bulkSwapPhones);
            
            const remaining = availableLines.length - bulkSwapPhones.length - pendingPhones.length;
            setRemainingSlots(remaining);
            
            if (remaining > 0) {
                setInstructions(`Scan in ${remaining} more phone${remaining === 1 ? '' : 's'}.`);
                setErrorMessage('');
            } else {
                setInstructions(`All ${availableLines.length} available lines have been assigned.`);
                setErrorMessage('No more slots available. Cannot add more phones.');
            }
            setSubmitButton("Generate Bulk SIM Swap");
        } else if (bulkSwapPhones.length > 0) {
            // Mode 2: Ready to generate bulk swap (change Initiated -> Pending)
            setMode('bulkSwap');
            setHasAvailableLines(false);
            setShowConfirmButton(false);
            setDisplayedPhones(bulkSwapPhones);
            setRemainingSlots(0);
            setInstructions(`Ready to generate bulk SIM swap for ${bulkSwapPhones.length} phone${bulkSwapPhones.length === 1 ? '' : 's'}.`);
            setSubmitButton("Generate Bulk SIM Swap");
            setErrorMessage('');
        } else {
            // Mode 4: New activation mode
            setMode('activation');
            setHasAvailableLines(false);
            setShowConfirmButton(false);
            setDisplayedPhones(activationPhones);
            setRemainingSlots(Infinity);
            setInstructions("Scan in phones with blank SIMs to be activated.");
            setSubmitButton("Generate Activation Email");
            setErrorMessage('');
        }
    }, [lines, phones]);

    // Auto-focus input when scanner mode is enabled
    useEffect(() => {
        if (scannerMode) {
            inputRef.current?.focus();
        }
    }, [scannerMode]);

    // Auto-submit when scanner mode is enabled and input has value
    useEffect(() => {
        if (scannerMode && phoneInput.trim()) {
            // Small delay to ensure the scanner has finished input
            const timer = setTimeout(() => {
                handleAddPhone();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [phoneInput, scannerMode]);

    const handleAddPhone = async () => {
        if (!phoneInput.trim()) return;
        
        // Check if we're in bulk swap mode and at capacity
        if (mode === 'bulkSwap' && hasAvailableLines && remainingSlots <= 0) {
            setErrorMessage('Cannot add more phones. All available lines have been assigned.');
            setPhoneInput('');
            inputRef.current?.focus();
            return;
        }
        
        // Don't allow adding phones in pending mode
        if (mode === 'pending' || mode === 'activationPending') {
            setErrorMessage('Cannot add phones while swap/activation is pending.');
            setPhoneInput('');
            inputRef.current?.focus();
            return;
        }
        
        const imei = phoneInput.trim();
        
        // Check if phone exists and validate isActive status
        const existingPhone = phones.find((phone: any) => phone.imei === imei);
        if (existingPhone && existingPhone.isActive == 1) {
            setErrorMessage('Only phones with blank SIMs can be activated.');
            setPhoneInput('');
            inputRef.current?.focus();
            return;
        }
        
        try {
            const base = import.meta.env.VITE_API_URL;
            const url = `${base}/api/v1/phones/${encodeURIComponent(imei)}`;
            
            // Determine which field to update based on mode
            const body = mode === 'activation'
                ? { newActivationStatus: 'Initiated' }
                : { bulkSIMSwapStatus: 'Initiated' };
            
            console.log('Updating phone:', imei, 'with body:', body);
            
            await axios.put(url, body);
            
            console.log('Successfully updated phone:', imei);
            
            // Reload the page to refresh the data
            window.location.reload();
            
        } catch (error) {
            console.error('Error updating phone:', error);
            setErrorMessage('Error updating phone. Please try again.');
        }
        
        // Clear input and refocus
        setPhoneInput('');
        inputRef.current?.focus();
    };

    const handleSubmitButton = async () => {
        console.log('Submit button clicked in mode:', mode);
        console.log(!hasAvailableLines)
        if (mode === 'bulkSwap' && remainingSlots === 0) {
            // Change all Initiated phones to Pending
            const bulkSwapPhones = filterBulkSimSwapPhones(phones);
            console.log('Bulk swap phones to update:', bulkSwapPhones);
            
            try {
                const base = import.meta.env.VITE_API_URL;

                const buffer = await axios.post(`${base}/generate-sim-swap-sheet`,
                    {availableLines:getAvailableLines(lines),phonesWithSwapPending:bulkSwapPhones},
                    { responseType: 'blob' }
                );
                
                const blob = new Blob([buffer.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = 'Bulk_SIM_Swap_Sheet.xlsx';
                document.body.appendChild(link);
                link.click();
                link.remove();
                
                for (const phone of bulkSwapPhones) {
                    const url = `${base}/api/v1/phones/${encodeURIComponent(phone.imei)}`;
                    await axios.put(url, { bulkSIMSwapStatus: 'Pending' });
                }
                
                console.log('Updated phones to Pending status');
                window.open('https://www.t-mobile.com/business', '_blank');
                window.location.reload();
            } catch (error) {
                console.error('Error updating phones to Pending:', error);
                setErrorMessage('Error updating phones. Please try again.');
            }
        } else if (mode === 'activation') {
            // Change all Initiated activation phones to Pending
            const activationPhones = filterNewActivationPhones(phones);
            console.log('Activation phones to update:', activationPhones);
            
            try {
                const base = import.meta.env.VITE_API_URL;

                const availableSims: string[] = activationPhones
                    .map(phone => phone.sim_number)
                    .filter((sim): sim is string => sim !== null && sim !== undefined);
                await axios.post(`${base}/handle-new-activations`,{simNumberList:availableSims})
                
                for (const phone of activationPhones) {
                    const url = `${base}/api/v1/phones/${encodeURIComponent(phone.imei)}`;
                    await axios.put(url, { newActivationStatus: 'Pending' });
                }
                
                // Open new tab to newPhoneLines action
                window.open('/actions/newPhoneLines', '_blank');
                
                window.location.reload();
                console.log('Updated phones to Pending activation status');
            } catch (error) {
                console.error('Error updating phones to Pending:', error);
                setErrorMessage('Error updating phones. Please try again.');
            }
        }
    };

    const handleConfirm = async () => {
        if (mode === 'pending') {
            // Change all Pending bulk swap phones to Completed
            const pendingPhones = filterPendingSimSwapPhones(phones);
            
            try {
                const base = import.meta.env.VITE_API_URL;
                
                for (const phone of pendingPhones) {
                    const url = `${base}/api/v1/phones/${encodeURIComponent(phone.imei)}`;
                    await axios.put(url, { bulkSIMSwapStatus: 'Completed' });
                }
                
                console.log('Updated phones to Completed status');
                window.location.reload();
            } catch (error) {
                console.error('Error updating phones to Completed:', error);
                setErrorMessage('Error confirming phones. Please try again.');
            }
        } 
    };

    const handleCancelPhone = async (imei: string) => {
        try {
            const base = import.meta.env.VITE_API_URL;
            const url = `${base}/api/v1/phones/${encodeURIComponent(imei)}`;
            
            // Determine which field to clear based on mode
            const body = mode === 'activation'
                ? { newActivationStatus: '' }
                : { bulkSIMSwapStatus: '' };
            
            await axios.put(url, body);
            console.log('Cancelled phone:', imei);
            window.location.reload();
        } catch (error) {
            console.error('Error cancelling phone:', error);
            setErrorMessage('Error cancelling phone. Please try again.');
        }
    };

    const handleCancelAll = async () => {
        if (displayedPhones.length === 0) return;
        
        try {
            const base = import.meta.env.VITE_API_URL;
            
            // Determine which field to clear based on mode
            const body = mode === 'activation'
                ? { newActivationStatus: '' }
                : { bulkSIMSwapStatus: '' };
            
            for (const phone of displayedPhones) {
                const url = `${base}/api/v1/phones/${encodeURIComponent(phone.imei)}`;
                await axios.put(url, body);
            }
            
            console.log('Cancelled all phones');
            window.location.reload();
        } catch (error) {
            console.error('Error cancelling all phones:', error);
            setErrorMessage('Error cancelling phones. Please try again.');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!scannerMode) {
            handleAddPhone();
        }
    };

    return (
        <div className="activate-phones">
            <h1>Activate Phones</h1>
            <p>{instructions}</p>
            <form onSubmit={handleSubmit}>
                <input 
                    ref={inputRef}
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Scan in Phone IMEI" 
                    required
                    autoComplete="off"
                    disabled={(mode === 'bulkSwap' && hasAvailableLines && remainingSlots <= 0) || mode === 'pending' || mode === 'activationPending'}
                />
                <button type="submit" disabled={(mode === 'bulkSwap' && hasAvailableLines && remainingSlots <= 0) || mode === 'pending' || mode === 'activationPending'}>Add Phone</button>
            </form>
            
            {errorMessage && (
                <div style={{ color: 'red', marginTop: '10px', fontWeight: 'bold' }}>
                    {errorMessage}
                </div>
            )}
            
            <div className="scanner-toggle">
                <label>
                    <input
                        type="checkbox"
                        checked={scannerMode}
                        onChange={(e) => setScannerMode(e.target.checked)}
                    />
                    Scanner mode (auto-focus and auto-submit)
                </label>
            </div>
            
            {displayedPhones.length > 0 && (
                <div className="phone-list">
                    <h3 
                        onClick={() => setIsPhoneListExpanded(!isPhoneListExpanded)}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                    >
                        {isPhoneListExpanded ? '▼' : '▶'} Phones ({displayedPhones.length})
                    </h3>
                    {isPhoneListExpanded && (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {displayedPhones.map((phone, index) => (
                                <li key={phone.imei || index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                    <span style={{ flex: 1 }}>
                                        IMEI: {phone.imei} {phone.sim_number && `| SIM: ${phone.sim_number}`}
                                    </span>
                                    {(mode === 'bulkSwap' || mode === 'activation') && (
                                        <button 
                                            onClick={() => handleCancelPhone(phone.imei)}
                                            style={{
                                                marginLeft: '10px',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '3px',
                                                cursor: 'pointer',
                                                padding: '2px 8px',
                                                fontSize: '14px'
                                            }}
                                            title="Cancel this phone"
                                        >
                                            ×
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            <br/>            
            {submitButton && (
                <button type="button" onClick={handleSubmitButton}>{submitButton}</button>
            )}
            
            {showConfirmButton && mode === 'pending' && (
                <button onClick={handleConfirm} style={{ marginLeft: '10px', backgroundColor: '#28a745', color: 'white' }}>
                    Confirm Bulk SIM Swap Complete
                </button>
            )}
            
            {displayedPhones.length > 0 && (mode === 'bulkSwap' || mode === 'activation') && (
                <button 
                    onClick={handleCancelAll}
                    style={{ 
                        marginLeft: '10px', 
                        backgroundColor: '#dc3545', 
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '10px 20px',
                        cursor: 'pointer'
                    }}
                >
                    Cancel All
                </button>
            )}
             <a 
                    href="/" 
                    style={{
                        display: 'inline-block',
                        padding: '10px 20px',
                        backgroundColor: '#ffde21',
                        color: 'black',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        width: 'fit-content'
                    }}
                >
                    Dashboard
                </a>
        </div>
    )
}

export default ActivatePhones;