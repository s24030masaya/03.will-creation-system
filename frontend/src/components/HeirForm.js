import React, { useState, useEffect } from 'react';

export default function HeirForm({ onAdd, editingHeir, onCancelEdit }) {
  const [heir, setHeir] = useState({
    relationship: '夫',
    name: '',
    birth_date: '1970-01-01'
  });

  useEffect(() => {
    if (editingHeir) {
      setHeir(editingHeir);
    }
  }, [editingHeir]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (heir.name && heir.birth_date) {
      onAdd(heir);
      setHeir({ relationship: '夫', name: '', birth_date: '1970-01-01' });
    }
  };

  const handleCancel = () => {
    setHeir({ relationship: '夫', name: '', birth_date: '1970-01-01' });
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  return (
    <div className="section">
      <h2>{editingHeir ? '相続人の編集' : '相続人の追加'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group">
            <label>続柄</label>
            <select
              value={heir.relationship}
              onChange={(e) => setHeir({ ...heir, relationship: e.target.value })}
            >
              <option value="夫">夫</option>
              <option value="妻">妻</option>
              <option value="長男">長男</option>
              <option value="長女">長女</option>
              <option value="次男">次男</option>
              <option value="次女">次女</option>
              <option value="三男">三男</option>
              <option value="三女">三女</option>
              <option value="その他">その他</option>
            </select>
          </div>
          <div className="form-group">
            <label>氏名</label>
            <input
              type="text"
              value={heir.name}
              onChange={(e) => setHeir({ ...heir, name: e.target.value })}
              placeholder="山田太郎"
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label>生年月日</label>
          <input
            type="date"
            value={heir.birth_date}
            onChange={(e) => setHeir({ ...heir, birth_date: e.target.value })}
            required
          />
        </div>
        <button type="submit">{editingHeir ? '更新' : '相続人を追加'}</button>
        {editingHeir && (
          <button type="button" onClick={handleCancel} className="secondary">
            キャンセル
          </button>
        )}
      </form>
    </div>
  );
}
