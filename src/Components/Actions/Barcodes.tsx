import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';

// Configure for 4" x 6" at 2400 DPI (ultra-high resolution)
const DPI = 2400;
const WIDTH = 4 * DPI;  // 9600 pixels (width)
const HEIGHT = 6 * DPI; // 14400 pixels (height)
const COLUMNS = 2;
const ROWS = 8;

interface Phone {
  imei: string;
  printBarcode: boolean;
  [key: string]: any;
}

function Barcodes() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const base = import.meta.env.VITE_API_URL;

  // Fetch phones where printBarcode == true
  const fetchPhonesToPrint = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await axios.get(`${base}/api/v1/phones`);
      const allPhones = response.data;
      
      // Filter for phones where printBarcode is true
      const phonesToPrint = allPhones.filter((phone: Phone) => phone.printBarcode === true);
      
      if (phonesToPrint.length === 0) {
        setMessage('No phones found with printBarcode enabled');
        setPhones([]);
      } else {
        setPhones(phonesToPrint);
        setMessage(`Found ${phonesToPrint.length} phone(s) ready to print`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Failed to fetch phones');
    } finally {
      setLoading(false);
    }
  };

  // Generate barcode label with grid of IMEI barcodes (fixed 2 columns x 8 rows)
  const generateBarcodeLabel = (imeiList: string[]) => {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // White background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Calculate cell dimensions with padding
    const padding = 100; // Increased padding for better border spacing
    const cellWidth = (WIDTH - padding * (COLUMNS + 1)) / COLUMNS;
    const cellHeight = (HEIGHT - padding * (ROWS + 1)) / ROWS;
    
    // Generate each barcode (up to 16 per page)
    const maxBarcodes = COLUMNS * ROWS;
    imeiList.slice(0, maxBarcodes).forEach((imei, index) => {
      const col = index % COLUMNS;
      const row = Math.floor(index / COLUMNS);
      
      // Calculate position
      const x = padding + col * (cellWidth + padding);
      const y = padding + row * (cellHeight + padding);
      
      // Create temporary canvas for this barcode
      const barcodeCanvas = document.createElement('canvas');
      barcodeCanvas.width = cellWidth;
      barcodeCanvas.height = cellHeight;
      
      try {
        // Generate barcode
        JsBarcode(barcodeCanvas, imei, {
          format: 'CODE128',
          width: 3,
          height: 140,
          displayValue: true,
          fontSize: 40,
          margin: 10
        });
        
        // Draw barcode onto main canvas
        ctx.drawImage(barcodeCanvas, x, y, cellWidth, cellHeight);
      } catch (error: any) {
        console.error(`Error generating barcode for IMEI ${imei}:`, error.message);
        
        // Draw error placeholder
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(x, y, cellWidth, cellHeight);
        ctx.fillStyle = 'black';
        ctx.font = '48px Arial';
        ctx.fillText('Invalid IMEI', x + 10, y + cellHeight / 2);
      }
    });
    
    return canvas;
  };

  // Generate and download barcodes
  const handleGenerateAndDownload = async () => {
    if (phones.length === 0) {
      setError('No phones to print');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Extract IMEI numbers
      const imeis = phones.map(phone => phone.imei);
      
      // Calculate number of pages needed (16 barcodes per page)
      const barcodesPerPage = COLUMNS * ROWS;
      const numPages = Math.ceil(imeis.length / barcodesPerPage);
      
      if (numPages === 1) {
        // Single page - download as JPEG
        const canvas = generateBarcodeLabel(imeis);
        if (!canvas) {
          throw new Error('Failed to generate barcode canvas');
        }

        canvas.toBlob((blob) => {
          if (!blob) {
            setError('Failed to generate image');
            return;
          }

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `phone-barcodes-${new Date().getTime()}.jpg`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          // Update phones to set printBarcode to false
          updatePhonesPrintStatus();
        }, 'image/jpeg', 0.95);
      } else {
        // Multiple pages - generate PDF
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'in',
          format: [4, 6]
        });

        for (let pageIndex = 0; pageIndex < numPages; pageIndex++) {
          const startIdx = pageIndex * barcodesPerPage;
          const endIdx = Math.min(startIdx + barcodesPerPage, imeis.length);
          const pageImeis = imeis.slice(startIdx, endIdx);

          const canvas = generateBarcodeLabel(pageImeis);
          if (!canvas) {
            throw new Error(`Failed to generate canvas for page ${pageIndex + 1}`);
          }

          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          
          if (pageIndex > 0) {
            pdf.addPage([4, 6], 'portrait');
          }
          
          pdf.addImage(imgData, 'JPEG', 0, 0, 4, 6);
        }

        // Download PDF
        pdf.save(`phone-barcodes-${new Date().getTime()}.pdf`);
        
        // Update phones to set printBarcode to false
        updatePhonesPrintStatus();
      }

    } catch (err: any) {
      setError(err?.message ?? 'Failed to generate barcodes');
      setLoading(false);
    }
  };

  // Update all phones to set printBarcode to false
  const updatePhonesPrintStatus = async () => {
    try {
      const updatePromises = phones.map(phone =>
        axios.put(`${base}/api/v1/phones/${encodeURIComponent(phone.imei)}`, {
          printBarcode: false
        })
      );

      await Promise.all(updatePromises);
      setMessage(`Successfully generated barcodes and updated ${phones.length} phone(s)`);
      setPhones([]);
    } catch (err: any) {
      setError(`Barcodes generated but failed to update phones: ${err?.message ?? 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on component mount
  useEffect(() => {
    fetchPhonesToPrint();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Phone Barcode Generator</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={fetchPhonesToPrint}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? 'Loading...' : 'Refresh Phone List'}
        </button>

        <button
          onClick={handleGenerateAndDownload}
          disabled={loading || phones.length === 0}
          style={{
            padding: '10px 20px',
            backgroundColor: phones.length > 0 ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || phones.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Generating...' : `Generate & Download ${phones.length > 16 ? 'PDF' : 'Image'} (${phones.length})`}
        </button>
      </div>

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

      {phones.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Phones Ready to Print:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {phones.map((phone, index) => (
              <li key={index} style={{
                padding: '8px',
                backgroundColor: '#f8f9fa',
                marginBottom: '5px',
                borderRadius: '4px'
              }}>
                IMEI: {phone.imei}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Barcodes;