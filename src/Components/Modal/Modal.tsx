import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { Phone, Line, SIM } from '../../Interfaces';
import './Modal.css';

type ModalMode = 'create' | 'edit';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    mode: ModalMode;
    interfaceType: 'phones' | 'phonelines' | 'sims';
    data?: Phone | Line | SIM;
    onSuccess: () => void;
};

type FormDataType = Partial<Phone & Line & SIM>;

const Modal = ({ isOpen, onClose, mode, interfaceType, data, onSuccess }: ModalProps) => {
    const [formData, setFormData] = useState<FormDataType>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Define dropdown options for specific interface.field combinations
    const dropdownOptions: Record<string, string[]> = {
        'phonelines.status': ['In Use', 'Available', 'Ready For Use'],
        'phonelines.owner_type':['','Gift/Waived','Offline Staff','Current M.O.','Subscriber'],
        'phonelines.source':['','dpI','Jan 26 NYC','Jan 26 DC', 'July 25 DC', 'May 25 DC', 'Sept 25 DC','Nov 25 DC'],
        'phonelines.action':['','Grant Check','Theo Check','Lydia Check'],
        'phones.bulkSIMSwapStatus': ['','Initiated','Pending','Completed','Failed'],
        'phones.newActivationStatus': ['','Initiated','Pending','Completed','Failed'],
        'sims.status': ['Active', 'Blank'],

    };

    useEffect(() => {
        if (isOpen && mode === 'edit' && data) {
            setFormData({ ...data });
        } else if (isOpen && mode === 'create') {
            // Initialize empty form based on interface type
            const emptyData = getEmptyFormData(interfaceType);
            setFormData(emptyData);
        }
    }, [isOpen, mode, data, interfaceType]);

    const getEmptyFormData = (type: string): FormDataType => {
        switch (type) {
            case 'phones':
                return {
                    imei: '',
                    sim_number: '',
                    hasSIM: false,
                    tested: false,
                    shipped: false
                };
            case 'sims':
                return {
                    sim_number: '',
                    status: ''
                };
            case 'phonelines':
                return {
                    phone_number: '',
                    sim_number: '',
                    subscription_id: '',
                    status: '',
                    owner_type: '',
                    source: ''
                };
            default:
                return {};
        }
    };

    const getFieldLabel = (field: string): string => {
        const labels: Record<string, string> = {
            phone_number: 'Phone Number',
            sim_number: 'SIM Number',
            subscription_id: 'Subscription ID',
            status: 'Status',
            owner_type: 'Owner Type',
            source: 'Source',
            imei: 'IMEI',
            hasSIM: 'Has SIM?',
            isTested: 'Tested?',
            shipped: 'Shipped?'
        };
        return labels[field] || field;
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const base = import.meta.env.VITE_API_URL;
            const url = `${base}/api/v1/${interfaceType}`;

            if (mode === 'create') {
                await axios.post(url, formData);
            } else {
                // For edit mode, we need to identify the object
                // Using the first field as identifier (might need adjustment based on API)
                const identifier = getIdentifier(interfaceType, formData);
                await axios.put(`${url}/${identifier}`, formData);
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getIdentifier = (type: string, data: FormDataType): string => {
        switch (type) {
            case 'phones':
                return data.imei || '';
            case 'sims':
                return data.sim_number || '';
            case 'phonelines':
                return data.phone_number || '';
            default:
                return '';
        }
    };

    const isPrimaryKey = (field: string): boolean => {
        const primaryKeys: Record<string, string> = {
            'phonelines': 'phone_number',
            'phones': 'imei',
            'sims': 'sim_number'
        };
        return mode === 'edit' && primaryKeys[interfaceType] === field;
    };

    const isFieldDisabled = (field: string): boolean => {
        // Primary keys cannot be edited
        if (isPrimaryKey(field)) return true;
        // sim_number cannot be edited in any interface when in edit mode
        if (mode === 'edit' && field === 'sim_number') return true;
        return false;
    };

    const renderFormField = (field: string, value: string | boolean | undefined) => {
        const fieldType = typeof value;
        const isDisabled = isFieldDisabled(field);

        if (fieldType === 'boolean') {
            return (
                <div key={field} className="form-field">
                    <label htmlFor={field}>{getFieldLabel(field)}</label>
                    <input
                        type="checkbox"
                        id={field}
                        checked={value as boolean}
                        onChange={(e) => handleInputChange(field, e.target.checked)}
                        disabled={isDisabled}
                    />
                </div>
            );
        }

        // Check if this field should be a dropdown for this specific interface
        const dropdownKey = `${interfaceType}.${field}`;
        if (dropdownOptions[dropdownKey]) {
            return (
                <div key={field} className="form-field">
                    <label htmlFor={field}>{getFieldLabel(field)}</label>
                    <select
                        id={field}
                        value={value as string || ''}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        disabled={isDisabled}
                    >
                        {dropdownOptions[dropdownKey].map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            );
        }

        return (
            <div key={field} className="form-field">
                <label htmlFor={field}>{getFieldLabel(field)}</label>
                <input
                    type="text"
                    id={field}
                    value={value as string || ''}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    disabled={isDisabled}
                />
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close modal">
                    ×
                </button>
                <h2>{mode === 'create' ? 'Create New' : 'Edit'} {interfaceType === 'phonelines' ? 'Line' : interfaceType.slice(0, -1)}</h2>
                
                {error && <div className="modal-error">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-fields">
                        {Object.entries(formData).map(([field, value]) => 
                            renderFormField(field, value)
                        )}
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create' : 'Update')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Modal;
