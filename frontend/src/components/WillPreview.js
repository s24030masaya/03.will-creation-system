import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function WillPreview({ willId, willData }) {
  const [previewText, setPreviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!willId) {
      setError('遺言書を保存してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/wills/${willId}/generate`);
      setPreviewText(response.data.text);
    } catch (err) {
      setError('プレビュー生成エラー: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!willId) {
      setError('遺言書を保存してください');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/wills/${willId}/pdf`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `will_${willId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('PDF生成エラー: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="section">
      <h2>遺言書プレビュー</h2>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={handleGenerate} disabled={loading}>
          {loading ? '生成中...' : 'プレビュー生成'}
        </button>
        <button onClick={handleDownloadPDF} className="success">
          PDFダウンロード
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {previewText && (
        <div className="will-preview">
          {previewText}
        </div>
      )}
    </div>
  );
}
