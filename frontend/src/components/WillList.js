import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function WillList({ onSelect, onNew }) {
  const [wills, setWills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWills();
  }, []);

  const loadWills = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_URL}/wills`);
      setWills(response.data);
    } catch (err) {
      setError('読み込みエラー: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (willId, e) => {
    e.stopPropagation();

    if (!window.confirm('この遺言書を削除してもよろしいですか?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/wills/${willId}`);
      loadWills();
    } catch (err) {
      setError('削除エラー: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="section">
      <h2>保存済み遺言書一覧</h2>

      <button onClick={onNew} className="success" style={{ marginBottom: '20px' }}>
        新規作成
      </button>

      {error && <div className="error">{error}</div>}

      {wills.length === 0 ? (
        <p>まだ遺言書がありません。</p>
      ) : (
        <div>
          {wills.map((will) => (
            <div
              key={will.id}
              className="will-list-item"
              onClick={() => onSelect(will.id)}
            >
              <div>
                <strong>ID: {will.id.substring(0, 8)}...</strong>
                <p>相続人数: {will.heirs_count}</p>
                <p>更新日時: {new Date(will.updated_at).toLocaleString('ja-JP')}</p>
              </div>
              <button
                onClick={(e) => handleDelete(will.id, e)}
                className="danger"
              >
                削除
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
