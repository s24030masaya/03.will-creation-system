import React, { useState, useEffect } from 'react';

export default function SecuritiesForm({ heirs, onAdd, editingData, onCancelEdit }) {
  const [securities, setSecurities] = useState({
    heir_index: 0,
    securities_company: '',
    branch: '',
    account_number: '',
    is_unlisted: false,
    head_office: '',
    stocks: []
  });

  useEffect(() => {
    if (editingData && editingData.securities) {
      setSecurities(editingData.securities);
    }
  }, [editingData]);

  const [currentStock, setCurrentStock] = useState({
    company_name: '',
    shares: ''
  });

  const handleAddStock = () => {
    if (currentStock.company_name) {
      setSecurities({
        ...securities,
        stocks: [...securities.stocks, { ...currentStock }]
      });
      setCurrentStock({ company_name: '', shares: '' });
    }
  };

  const handleRemoveStock = (index) => {
    setSecurities({
      ...securities,
      stocks: securities.stocks.filter((_, idx) => idx !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 上場株式の場合は証券会社名が必須
    if (!securities.is_unlisted && !securities.securities_company) {
      alert('証券会社名を入力してください');
      return;
    }

    onAdd(securities);
    setSecurities({
      heir_index: 0,
      securities_company: '',
      branch: '',
      account_number: '',
      is_unlisted: false,
      head_office: '',
      stocks: []
    });
  };

  const handleCancel = () => {
    setSecurities({
      heir_index: 0,
      securities_company: '',
      branch: '',
      account_number: '',
      is_unlisted: false,
      head_office: '',
      stocks: []
    });
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  if (heirs.length === 0) {
    return (
      <div className="section">
        <h2>有価証券の追加</h2>
        <p>まず相続人を追加してください。</p>
      </div>
    );
  }

  return (
    <div className="section">
      <h2>{editingData ? '有価証券の編集' : '有価証券の追加'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>相続させる人</label>
          <select
            value={securities.heir_index}
            onChange={(e) => setSecurities({ ...securities, heir_index: parseInt(e.target.value) })}
          >
            {heirs.map((heir, idx) => (
              <option key={idx} value={idx}>
                {heir.relationship} {heir.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={securities.is_unlisted}
              onChange={(e) => setSecurities({ ...securities, is_unlisted: e.target.checked })}
              style={{ width: 'auto', marginRight: '8px' }}
            />
            非上場株式
          </label>
        </div>

        {!securities.is_unlisted ? (
          <>
            <div className="form-group">
              <label>証券会社名</label>
              <input
                type="text"
                value={securities.securities_company}
                onChange={(e) => setSecurities({ ...securities, securities_company: e.target.value })}
                placeholder="○○証券会社"
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label>支店</label>
                <input
                  type="text"
                  value={securities.branch}
                  onChange={(e) => setSecurities({ ...securities, branch: e.target.value })}
                  placeholder="○○支店"
                />
              </div>
              <div className="form-group">
                <label>口座番号</label>
                <input
                  type="text"
                  value={securities.account_number}
                  onChange={(e) => setSecurities({ ...securities, account_number: e.target.value })}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="form-group">
            <label>本店所在地</label>
            <input
              type="text"
              value={securities.head_office}
              onChange={(e) => setSecurities({ ...securities, head_office: e.target.value })}
              placeholder="〇〇県〇〇市〇〇１－１－１"
            />
          </div>
        )}

        {!securities.is_unlisted && <h3>株式情報</h3>}
        <div className="grid-2">
          <div className="form-group">
            <label>会社名</label>
            <input
              type="text"
              value={currentStock.company_name}
              onChange={(e) => setCurrentStock({ ...currentStock, company_name: e.target.value })}
              placeholder="〇〇商事株式会社"
            />
          </div>
          <div className="form-group">
            <label>株数</label>
            <input
              type="text"
              value={currentStock.shares}
              onChange={(e) => setCurrentStock({ ...currentStock, shares: e.target.value })}
              placeholder="100株 または 全部"
            />
          </div>
        </div>

        {securities.stocks.length > 0 && (
          <div className="heir-list">
            <h4>追加された株式:</h4>
            {securities.stocks.map((stock, idx) => (
              <div key={idx} className="heir-item">
                <p>{stock.company_name} - {stock.shares || '全部'}</p>
                <button type="button" onClick={() => handleRemoveStock(idx)} className="danger">
                  削除
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="submit">
          {editingData ? '更新' : '有価証券を追加'}
        </button>
        <button type="button" onClick={handleAddStock} className="secondary">
          株式を追加
        </button>
        {editingData && (
          <button type="button" onClick={handleCancel} className="secondary">
            キャンセル
          </button>
        )}
      </form>
    </div>
  );
}
