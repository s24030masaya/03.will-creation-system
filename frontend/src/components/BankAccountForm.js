import React, { useState, useEffect } from 'react';

export default function BankAccountForm({ heirs, onAdd, editingData, onCancelEdit }) {
  const [account, setAccount] = useState({
    heir_index: 0,
    bank_name: '',
    branch_name: '',
    account_type: '普通預金',
    account_number: '',
    symbol: ''
  });

  useEffect(() => {
    if (editingData && editingData.account) {
      setAccount(editingData.account);
    }
  }, [editingData]);

  const isYucho = account.bank_name === 'ゆうちょ銀行';

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(account);
    setAccount({
      heir_index: 0,
      bank_name: '',
      branch_name: '',
      account_type: '普通預金',
      account_number: '',
      symbol: ''
    });
  };

  const handleCancel = () => {
    setAccount({
      heir_index: 0,
      bank_name: '',
      branch_name: '',
      account_type: '普通預金',
      account_number: '',
      symbol: ''
    });
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  if (heirs.length === 0) {
    return (
      <div className="section">
        <h2>銀行預金の追加</h2>
        <p>まず相続人を追加してください。</p>
      </div>
    );
  }

  return (
    <div className="section">
      <h2>{editingData ? '銀行預金の編集' : '銀行預金の追加'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>相続させる人</label>
          <select
            value={account.heir_index}
            onChange={(e) => setAccount({ ...account, heir_index: parseInt(e.target.value) })}
          >
            {heirs.map((heir, idx) => (
              <option key={idx} value={idx}>
                {heir.relationship} {heir.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label>銀行名</label>
            <input
              type="text"
              value={account.bank_name}
              onChange={(e) => setAccount({ ...account, bank_name: e.target.value })}
              placeholder="○○銀行 または ゆうちょ銀行"
              required
            />
          </div>
          {!isYucho && (
            <div className="form-group">
              <label>支店名</label>
              <input
                type="text"
                value={account.branch_name}
                onChange={(e) => setAccount({ ...account, branch_name: e.target.value })}
                placeholder="○○支店"
                required={!isYucho}
              />
            </div>
          )}
        </div>

        {isYucho ? (
          <>
            <div className="form-group">
              <label>口座種別</label>
              <select
                value={account.account_type}
                onChange={(e) => setAccount({ ...account, account_type: e.target.value })}
              >
                <option value="通常貯金">通常貯金</option>
                <option value="定額貯金">定額貯金</option>
                <option value="定期貯金">定期貯金</option>
              </select>
            </div>
            <div className="form-group">
              <label>記号</label>
              <input
                type="text"
                value={account.symbol}
                onChange={(e) => setAccount({ ...account, symbol: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>番号</label>
              <input
                type="text"
                value={account.account_number}
                onChange={(e) => setAccount({ ...account, account_number: e.target.value })}
                required
              />
            </div>
          </>
        ) : (
          <div className="grid-2">
            <div className="form-group">
              <label>口座種別</label>
              <select
                value={account.account_type}
                onChange={(e) => setAccount({ ...account, account_type: e.target.value })}
              >
                <option value="普通預金">普通預金</option>
                <option value="定期預金">定期預金</option>
              </select>
            </div>
            <div className="form-group">
              <label>口座番号</label>
              <input
                type="text"
                value={account.account_number}
                onChange={(e) => setAccount({ ...account, account_number: e.target.value })}
                required
              />
            </div>
          </div>
        )}

        <button type="submit">{editingData ? '更新' : '銀行預金を追加'}</button>
        {editingData && (
          <button type="button" onClick={handleCancel} className="secondary">
            キャンセル
          </button>
        )}
      </form>
    </div>
  );
}
