import React, { useState } from 'react';

export default function ExecutorForm({ heirs, executor, onSet }) {
  const [useHeir, setUseHeir] = useState(false);
  const [selectedHeirIndex, setSelectedHeirIndex] = useState(0);
  const [customExecutor, setCustomExecutor] = useState({
    address: '',
    name: '',
    birth_date: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (useHeir && heirs.length > 0) {
      // 相続人を遺言執行者として使用
      const heir = heirs[selectedHeirIndex];
      onSet({
        address: '',
        name: heir.name,
        birth_date: heir.birth_date,
        relationship: heir.relationship,
        from_heir: true
      });
    } else {
      onSet(customExecutor);
    }
  };

  return (
    <div className="section">
      <h2>遺言執行者の設定</h2>
      <form onSubmit={handleSubmit}>
        {heirs.length > 0 && (
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={useHeir}
                onChange={(e) => setUseHeir(e.target.checked)}
                style={{ width: 'auto', marginRight: '8px' }}
              />
              相続人から選択
            </label>
          </div>
        )}

        {useHeir && heirs.length > 0 ? (
          <div className="form-group">
            <label>相続人</label>
            <select
              value={selectedHeirIndex}
              onChange={(e) => setSelectedHeirIndex(parseInt(e.target.value))}
            >
              {heirs.map((heir, idx) => (
                <option key={idx} value={idx}>
                  {heir.relationship} {heir.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div className="form-group">
              <label>住所</label>
              <input
                type="text"
                value={customExecutor.address}
                onChange={(e) => setCustomExecutor({ ...customExecutor, address: e.target.value })}
                placeholder="〇〇県〇〇市〇〇１－１－１"
                required={!useHeir}
              />
            </div>
            <div className="form-group">
              <label>氏名</label>
              <input
                type="text"
                value={customExecutor.name}
                onChange={(e) => setCustomExecutor({ ...customExecutor, name: e.target.value })}
                placeholder="田中太郎"
                required={!useHeir}
              />
            </div>
            <div className="form-group">
              <label>生年月日</label>
              <input
                type="date"
                value={customExecutor.birth_date}
                onChange={(e) => setCustomExecutor({ ...customExecutor, birth_date: e.target.value })}
                required={!useHeir}
              />
            </div>
          </>
        )}

        <button type="submit">遺言執行者を設定</button>
      </form>

      {executor && (
        <div className="heir-item" style={{ marginTop: '20px' }}>
          <h4>設定済み遺言執行者</h4>
          {executor.from_heir ? (
            <>
              <p>{executor.relationship} {executor.name}</p>
            </>
          ) : (
            <>
              <p>氏名: {executor.name}</p>
              <p>住所: {executor.address}</p>
              <p>生年月日: {executor.birth_date}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
