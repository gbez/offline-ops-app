import { useEffect, useState } from 'react';
import axios from 'axios';

interface SettingField {
    data: string | number;
    readable: string;
}

interface Settings {
    [key: string]: SettingField;
}

function Settings() {
    const [settings, setSettings] = useState<Settings>({});
    const [editedSettings, setEditedSettings] = useState<Settings>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isHoveringGear, setIsHoveringGear] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const base = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${base}/api/v1/settings`);
            setSettings(response.data.settings);
            setEditedSettings(response.data.settings);
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Failed to fetch settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setMessage(null);
        setError(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedSettings(settings);
        setMessage(null);
        setError(null);
    };

    const handleChange = (key: string, value: string) => {
        // For minimum_available_lines, ensure it's at least 10
        if (key === 'minimum_available_lines') {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue) && numValue < 10) {
                value = '10';
            }
        }
        
        setEditedSettings(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                data: value
            }
        }));
    };

    const handleEmailChange = (index: number, value: string) => {
        const currentEmails = String(editedSettings.alerts_emails?.data || '').split(',').map(e => e.trim());
        while (currentEmails.length < 3) {
            currentEmails.push('');
        }
        currentEmails[index] = value;
        
        setEditedSettings(prev => ({
            ...prev,
            alerts_emails: {
                ...prev.alerts_emails,
                data: currentEmails.filter(e => e).join(',')
            }
        }));
    };

    const getEmailValues = (): string[] => {
        const emails = String(editedSettings.alerts_emails?.data || '').split(',').map(e => e.trim());
        while (emails.length < 3) {
            emails.push('');
        }
        return emails.slice(0, 3);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setMessage(null);
        
        try {
            await axios.put(`${base}/api/v1/settings`, editedSettings);
            setSettings(editedSettings);
            setMessage('Settings updated successfully!');
            setIsEditing(false);
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || 'Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div style={{ padding: '20px' }}>Loading settings...</div>;
    }

    if (error && !isEditing) {
        return <div style={{ padding: '20px', color: '#721c24' }}>Error: {error}</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', position: 'relative' }}>
                <h3 style={{ margin: 0 }}>Settings</h3>
                {!isEditing && (
                    <button
                        onClick={handleEdit}
                        onMouseEnter={() => setIsHoveringGear(true)}
                        onMouseLeave={() => setIsHoveringGear(false)}
                        style={{
                            position: 'absolute',
                            right: 0,
                            padding: '8px 12px',
                            backgroundColor: isHoveringGear ? '#0056b3' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '18px',
                            transition: 'background-color 0.2s'
                        }}
                        title="Update Settings"
                    >
                        ⚙️
                    </button>
                )}
            </div>
            
            <div style={{ marginTop: '20px' }}>
                {Object.entries(editedSettings || {}).map(([key, field]) => (
                    <div key={key} style={{ marginBottom: '12px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
                        <strong style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>{field.readable}:</strong>
                        {isEditing ? (
                            key === 'alerts_emails' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {getEmailValues().map((email, index) => (
                                        <input
                                            key={index}
                                            type="text"
                                            value={email}
                                            onChange={(e) => handleEmailChange(index, e.target.value)}
                                            placeholder={`Enter email...`}
                                            style={{
                                                width: 'calc(100% - 18px)',
                                                padding: '6px 8px',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                fontSize: '13px'
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : key === 'minimum_available_lines' ? (
                                <input
                                    type="number"
                                    value={field.data}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                    min="10"
                                    style={{
                                        width: 'calc(100% - 18px)',
                                        padding: '6px 8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={field.data}
                                    onChange={(e) => handleChange(key, e.target.value)}
                                    style={{
                                        width: 'calc(100% - 18px)',
                                        padding: '6px 8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            )
                        ) : (
                            key === 'alerts_emails' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {String(field.data).split(',').map((email, index) => (
                                        <span key={index} style={{ fontSize: '13px' }}>{email.trim()}</span>
                                    ))}
                                </div>
                            ) : (
                                <span style={{ fontSize: '13px' }}>{field.data}</span>
                            )
                        )}
                    </div>
                ))}
            </div>

            {message && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>
                    {message}
                </div>
            )}

            {error && isEditing && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px' }}>
                    {error}
                </div>
            )}

            {isEditing && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                            fontSize: '13px'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}

export default Settings;