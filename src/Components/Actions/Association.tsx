import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

type Props = {
  /** base endpoints, e.g. '/api/sheetOne' and '/api/sheetTwo' */
  firstEndPoint: string;
  secondEndPoint: string;
  /** the actual field names for each sheet */
  firstPK: string;
  secondPK: string;
  /** the fk for the first sheet */
  foreignKeyField: string;
  /** Body fields */
  firstBody?: any;
  secondBody?: any;
  /** optional initial ids */
  initialFirstValue?: string;
  initialSecondValue?: string;
  /** start in scanner mode (can be toggled in UI) */
  scannerMode?: boolean;
};

function capitalizeFirstLetter(str:string) {
  // Handle empty or non-string inputs
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function Association({
  firstEndPoint,
  secondEndPoint,
  firstPK,
  secondPK,
  firstBody = {},
  secondBody ={},
  foreignKeyField,
  initialFirstValue = '',
  initialSecondValue = '',
  scannerMode = false,
}: Props) {
  const [firstValue, setFirstValue] = useState(initialFirstValue);
  const [secondValue, setSecondValue] = useState(initialSecondValue);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localScannerEnabled, setLocalScannerEnabled] = useState(scannerMode);
  const [isSimActive, setIsSimActive] = useState(false);
  const [isPrintBarcodeEnabled, setIsPrintBarcodeEnabled] = useState(false);

  const sheetTwoRef = useRef<HTMLInputElement | null>(null);
  const sheetOneRef = useRef<HTMLInputElement | null>(null);
  const submittingRef = useRef(false);

  // Toast state for success/error notifications
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const dismissToast = () => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  };

  useEffect(() => {
    // Show toast when message or error changes
    if (message) {
      setToast({ text: message, type: 'success' });
    } else if (error) {
      setToast({ text: error, type: 'error' });
    } else {
      return;
    }

    // Clear any existing timer
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    // Auto-dismiss after 3.5s
    toastTimerRef.current = window.setTimeout(() => {
      toastTimerRef.current = null;
      setToast(null);
    }, 3500);

    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, error]);

  const base = import.meta.env.VITE_API_URL;
  const body: Record<string, string> = {};

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setMessage(null);
    setError(null);

    if (!firstValue || !secondValue) {
      setError('Both IDs are required');
      return;
    }

    if (submittingRef.current) return;
    submittingRef.current = true;
    setLoading(true);

    try {
      let secondData: any = null;
      try {
        const url = `${base}/api/v1/${secondEndPoint}/${encodeURIComponent(secondValue)}`;
        console.log(url);
        const res = await axios.get(url);
        secondData = res.data;
      } catch (err: any) {
        body[secondPK] = secondValue;
        console.log()
        const url = `${base}/api/v1/${secondEndPoint}/`
        console.log(url);
        console.log(body);
        // Update SIM status if secondBody has a status field
        const updatedSecondBody = secondBody.status !== undefined 
          ? { ...secondBody, status: isSimActive ? 'Active' : 'Blank' }
          : secondBody;
        const res = await axios.post(url, {...body,...updatedSecondBody});
        secondData = res.data;
      }

      console.log(`second data: ${JSON.stringify(secondData)}`);

      // Check sheetOne
      try {
        const url = `${base}/api/v1/${firstEndPoint}/${encodeURIComponent(firstValue)}`;
        body[foreignKeyField] = secondValue;
        console.log(url);
        console.log(body);
        await axios.get(url);
        console.log("phone exists...trying to patch");
        const updatedFirstBody = isPrintBarcodeEnabled && firstEndPoint === 'phones'
          ? { ...firstBody, printBarcode: true }
          : firstBody;
        await axios.put(url, {...body,...updatedFirstBody});
        setMessage(`Updated '${firstEndPoint}' with value ${firstValue} and linked to '${secondEndPoint}' with value ${secondValue}.`);
      } catch (err: any) {
        const url = `${base}/api/v1/${firstEndPoint}/`;
        body[firstPK] = firstValue;
        body[foreignKeyField] = secondValue;
        console.log(url);
        console.log(body);
        const updatedFirstBody = isPrintBarcodeEnabled && firstEndPoint === 'phones'
          ? { ...firstBody, printBarcode: true }
          : firstBody;
        await axios.post(url, {...body,...updatedFirstBody});
        setMessage(`Created new ${firstEndPoint} with value ${firstValue} and linked to '${secondEndPoint}' with value ${secondValue}.`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Request failed');
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
    setFirstValue("");
    setSecondValue("");
    // focus the first input so it's ready to scan/type again
    sheetOneRef.current?.focus();
    sheetOneRef.current?.select();

  };

  // When scanner mode is enabled and sheetOneId is set, focus the sheetTwo input
  useEffect(() => {
    if (!localScannerEnabled) return;
    if (firstValue) {
      sheetTwoRef.current?.focus();
    }
  }, [firstValue, localScannerEnabled]);

  // When scanner mode is enabled and both fields are filled, auto-submit
  useEffect(() => {
    if (!localScannerEnabled) return;
    if (firstValue && secondValue) {
      void handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondValue, firstValue, localScannerEnabled]);

  const location = useLocation();
  const currentPath = location.pathname;

  const getButtonStyle = (href: string) => {
    const isActive = currentPath === href;
    return {
      padding: '8px 16px',
      backgroundColor: isActive ? '#007bff' : 'white',
      color: isActive ? 'white' : '#007bff',
      textDecoration: 'none',
      borderRadius: '4px',
      display: 'inline-block',
      border: isActive ? 'none' : '2px solid #007bff',
    };
  };

  return (
    <div className="association-action">
      <h1>Associate Data</h1>
      <form onSubmit={handleSubmit} className="association-form">
        <div className="form-row">
          <label htmlFor="sheetOneId">{capitalizeFirstLetter(firstEndPoint)}</label>
          <input
            id="sheetOneId"
            ref={sheetOneRef}
            value={firstValue}
            onChange={(e) => setFirstValue(e.target.value)}
            placeholder="scan or type first ID"
            autoComplete="off"
          />
        </div>

        <div className="form-row" style={{ marginTop: 8 }}>
          <label htmlFor="sheetTwoId">{capitalizeFirstLetter(secondEndPoint)}</label>
          <input
            id="sheetTwoId"
            ref={sheetTwoRef}
            value={secondValue}
            onChange={(e) => setSecondValue(e.target.value)}
            placeholder="scan or type second ID"
            autoComplete="off"
          />
        </div>

        <div className="form-row form-row--button" style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Working…' : 'Submit Association'}
          </button>
        </div>
      </form>

      <div className="scanner-toggle">
        <label>
          <input
            type="checkbox"
            checked={localScannerEnabled}
            onChange={(e) => setLocalScannerEnabled(e.target.checked)}
          />
          Scanner mode (auto-focus and auto-submit)
        </label>
      </div>

      {secondBody?.status !== undefined && (
        <div className="scanner-toggle" style={{ marginTop: 8 }}>
          <label>
            <input
              type="checkbox"
              checked={isSimActive}
              onChange={(e) => setIsSimActive(e.target.checked)}
            />
            Active SIM
          </label>
        </div>
      )}

      {currentPath === '/actions/sim2phone' && (
        <div className="scanner-toggle" style={{ marginTop: 8 }}>
          <label>
            <input
              type="checkbox"
              checked={isPrintBarcodeEnabled}
              onChange={(e) => setIsPrintBarcodeEnabled(e.target.checked)}
            />
            Print Phone Barcode
          </label>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div
          className={`toast ${toast.type === 'success' ? 'toast--success' : 'toast--error'} visible`}
          role="status"
          aria-live="polite"
        >
          <span className="toast-message">{toast.text}</span>
          <button className="toast-close" onClick={dismissToast} aria-label="Close notification">
            ×
          </button>
        </div>
      )}

      {/* Navigation buttons */}
      <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <a href="/actions/sim2phone" style={getButtonStyle('/actions/sim2phone')}>
          SIM to Phone
        </a>
        <a href="/actions/subscription2label" style={getButtonStyle('/actions/subscription2label')}>
          Subscription to Label
        </a>
        <a href="/actions/label2phone" style={getButtonStyle('/actions/label2phone')}>
          Label to Phone
        </a>
        <a href="/actions/generatePhoneBarcodes" style={getButtonStyle('/actions/generatePhoneBarcodes')}>
          Print Phone Barcodes
        </a>
      </div>

    </div>
  );
}

export default Association;