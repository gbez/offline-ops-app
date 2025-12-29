import { useState } from 'react';
import axios from 'axios';

interface PhoneLine {
  phone_number: string;
  sim_number: string;
}

function NewPhoneLines() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [parsedLines, setParsedLines] = useState<PhoneLine[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const base = import.meta.env.VITE_API_URL;

  // Parse the pasted table data
  const handleParse = () => {
    setError(null);
    setMessage(null);
    setParsedLines([]);

    try {
      // Split by newlines to get all values
      const allLines = inputText.trim().split('\n').map(s => s.trim()).filter(s => s);
      
      if (allLines.length === 0) {
        setError('No data to parse.');
        return;
      }

      // Data is organized as sequential blocks: all order numbers, then all SIMs, then all rate plans, then all phone numbers
      // Calculate rows per column
      if (allLines.length % 4 !== 0) {
        setError(`Invalid format. Total lines (${allLines.length}) should be divisible by 4 (for 4 columns).`);
        return;
      }

      const rowCount = allLines.length / 4;
      
      // Split into 4 sections
      // const orderNumbers = allLines.slice(0, rowCount); // Column 1: ignored
      const simNumbers = allLines.slice(rowCount, rowCount * 2);
      // const ratePlans = allLines.slice(rowCount * 2, rowCount * 3); // Column 3: ignored
      const phoneNumbers = allLines.slice(rowCount * 3, rowCount * 4);

      // Create phone line objects
      const lines: PhoneLine[] = [];
      for (let i = 0; i < rowCount; i++) {
        if (phoneNumbers[i] && simNumbers[i]) {
          lines.push({
            phone_number: phoneNumbers[i],
            sim_number: simNumbers[i]
          });
        }
      }

      setParsedLines(lines);
      setMessage(`Successfully parsed ${lines.length} phone lines`);
      setShowPreview(true);
    } catch (err: any) {
      setError(`Parsing error: ${err?.message ?? 'Unknown error'}`);
    }
  };

  // Submit phone lines to API
  const handleSubmit = async () => {
    if (parsedLines.length === 0) {
      setError('No phone lines to submit. Please parse the data first.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Create all phone lines and update associated phones
      const promises = parsedLines.map(async (line) => {
        // Create phone line with additional fields
        const phoneLineData = {
          ...line,
          owner_name: "z_Offline Inc.",
          status: "Ready For Use"
        };
        
        await axios.post(`${base}/api/v1/phonelines`, phoneLineData);

        // Find phone(s) with matching sim_number and update newActivationStatus
        try {
          const phonesResponse = await axios.get(`${base}/api/v1/phones`);
          const matchingPhones = phonesResponse.data.filter(
            (phone: any) => phone.sim_number === line.sim_number
          );

          // Update each matching phone
          const updatePromises = matchingPhones.map((phone: any) =>
            axios.put(`${base}/api/v1/phones/${encodeURIComponent(phone.imei)}`, {
              newActivationStatus: "Completed"
            })
          );

          await Promise.all(updatePromises);
        } catch (err) {
          console.error(`Failed to update phone for SIM ${line.sim_number}:`, err);
        }
      });

      await Promise.all(promises);
      setMessage(`Successfully created ${parsedLines.length} phone lines and updated associated phones!`);
      setInputText('');
      setParsedLines([]);
      setShowPreview(false);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to create phone lines');
    } finally {
      setLoading(false);
    }
  };

  // Go back to input mode
  const handleRevise = () => {
    setShowPreview(false);
    setError(null);
    setMessage(null);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Create New Phone Lines</h1>
      <p style={{ color: '#6c757d', marginBottom: '20px' }}>
        Paste table data as a continuous list: all order numbers, then all SIM numbers, then all rate plans, then all phone numbers.
      </p>

      {!showPreview ? (
        <>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your table data here..."
            style={{
              width: '100%',
              height: '300px',
              padding: '10px',
              fontSize: '14px',
              fontFamily: 'monospace',
              border: '1px solid #ccc',
              borderRadius: '4px',
              marginBottom: '10px'
            }}
          />

          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={handleParse}
              disabled={!inputText.trim() || loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: !inputText.trim() || loading ? 'not-allowed' : 'pointer'
              }}
            >
              Parse Data
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={handleRevise}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginRight: '10px'
              }}
            >
              Revise Input
            </button>

            <button
              onClick={handleSubmit}
              disabled={parsedLines.length === 0 || loading}
              style={{
                padding: '10px 20px',
                backgroundColor: parsedLines.length > 0 ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: parsedLines.length === 0 || loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Submitting...' : `Submit ${parsedLines.length} Phone Lines`}
            </button>
          </div>

          {parsedLines.length > 0 && (
            <div>
              <h3>Parsed Phone Lines ({parsedLines.length}):</h3>
              <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #ccc', borderRadius: '4px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <tr>
                      <th style={{ padding: '10px', textAlign: 'left' }}>#</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Phone Number</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>SIM Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedLines.map((line, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                        <td style={{ padding: '8px' }}>{index + 1}</td>
                        <td style={{ padding: '8px', fontFamily: 'monospace' }}>{line.phone_number}</td>
                        <td style={{ padding: '8px', fontFamily: 'monospace' }}>{line.sim_number}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {message && (
        <div style={{
          padding: '10px',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '10px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default NewPhoneLines;
