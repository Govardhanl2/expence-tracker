import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudUpload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { expenseAPI } from '../../services/api';
import { Card, Button, CategoryBadge } from '../UI';
import { format } from 'date-fns';
import './Upload.css';

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback((accepted, rejected) => {
    setError(null);
    setResult(null);
    if (rejected.length > 0) {
      setError(rejected[0].errors[0]?.message || 'File rejected');
      return;
    }
    if (accepted.length > 0) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('invoice', file);
      const res = await expenseAPI.uploadInvoice(formData);
      setResult(res.data);
      setFile(null);
      toast.success('Invoice processed successfully');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => { setFile(null); setError(null); };

  return (
    <div className="upload-page">
      <div className="upload-layout">
        {/* Upload zone */}
        <div className="upload-col">
          <Card>
            <h3 className="section-title">Upload Document</h3>
            <p className="section-desc">
              Upload an invoice, bill, or receipt. Gemini AI will automatically extract the expense details.
            </p>

            <div
              {...getRootProps()}
              className={`dropzone ${isDragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="file-preview">
                  <div className="file-icon-wrap">
                    <FileText size={28} />
                  </div>
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-size">{(file.size / 1024).toFixed(1)} KB</div>
                  </div>
                  <button
                    className="file-remove"
                    onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <div className="dropzone-content">
                  <div className="drop-icon-wrap">
                    <CloudUpload size={32} />
                  </div>
                  <div className="drop-title">
                    {isDragActive ? 'Drop the file here' : 'Drag and drop or click to upload'}
                  </div>
                  <div className="drop-sub">
                    Supports JPEG, PNG, WEBP, PDF — Max 10MB
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="upload-error">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="upload-btn"
              onClick={handleUpload}
              disabled={!file || uploading}
              loading={uploading}
            >
              {uploading ? 'Processing with AI...' : 'Extract and Save'}
            </Button>

            {uploading && (
              <div className="processing-hint">
                Gemini 2.5 Flash is analyzing your document...
              </div>
            )}
          </Card>

          {/* Supported formats */}
          <Card className="formats-card">
            <h4 className="formats-title">What we extract</h4>
            <div className="formats-list">
              {['Invoice / Bill name', 'Vendor / Merchant', 'Total amount', 'Date', 'Expense category'].map((item) => (
                <div key={item} className="format-item">
                  <div className="format-dot" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Result */}
        <div className="result-col">
          {result ? (
            <Card className="result-card">
              <div className="result-header">
                <div className="result-success-icon">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <h3 className="result-title">Extraction Complete</h3>
                  <p className="result-sub">Expense saved to your tracker</p>
                </div>
              </div>

              <div className="result-fields">
                <ResultField label="Expense Name" value={result.name} />
                <ResultField label="Vendor" value={result.vendor} />
                <ResultField
                  label="Amount"
                  value={fmt(result.amount)}
                  mono
                />
                <ResultField
                  label="Category"
                  value={<CategoryBadge category={result.category} />}
                />
                <ResultField
                  label="Date"
                  value={format(new Date(result.date), 'MMMM d, yyyy')}
                />
                {result.notes && (
                  <ResultField label="Notes" value={result.notes} />
                )}
              </div>

              <Button
                variant="secondary"
                className="upload-btn"
                onClick={() => setResult(null)}
              >
                Upload Another
              </Button>
            </Card>
          ) : (
            <Card className="placeholder-card">
              <div className="placeholder-inner">
                <div className="placeholder-icon">
                  <FileText size={32} />
                </div>
                <h3 className="placeholder-title">Extraction Result</h3>
                <p className="placeholder-desc">
                  Upload a document and the AI-extracted data will appear here
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const ResultField = ({ label, value, mono }) => (
  <div className="result-field">
    <span className="result-label">{label}</span>
    <span className={`result-value ${mono ? 'mono' : ''}`}>{value}</span>
  </div>
);

export default Upload;
