import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import HeirForm from './components/HeirForm';
import RealEstateForm from './components/RealEstateForm';
import BankAccountForm from './components/BankAccountForm';
import SecuritiesForm from './components/SecuritiesForm';
import ExecutorForm from './components/ExecutorForm';
import WillPreview from './components/WillPreview';
import WillList from './components/WillList';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [currentView, setCurrentView] = useState('list');
  const [willId, setWillId] = useState(null);
  const [testator, setTestator] = useState({ name: '', address: '' });
  const [heirs, setHeirs] = useState([]);
  const [editingHeirIndex, setEditingHeirIndex] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [editingRealEstate, setEditingRealEstate] = useState(null);
  const [editingBankAccount, setEditingBankAccount] = useState(null);
  const [editingSecurities, setEditingSecurities] = useState(null);
  const [otherAssetHeirIndex, setOtherAssetHeirIndex] = useState(null);
  const [executor, setExecutor] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (willId) {
      loadWill(willId);
    }
  }, [willId]);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const loadWill = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/wills/${id}`);
      const data = response.data;
      setTestator(data.testator || { name: '', address: '' });
      setHeirs(data.heirs || []);
      setAllocations(data.allocations || []);
      setOtherAssetHeirIndex(data.other_asset_heir_index !== undefined ? data.other_asset_heir_index : null);
      setExecutor(data.executor || null);
      setCurrentView('edit');
    } catch (err) {
      showMessage('読み込みエラー: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const createNewWill = () => {
    setWillId(null);
    setTestator({ name: '', address: '' });
    setHeirs([]);
    setAllocations([]);
    setOtherAssetHeirIndex(null);
    setExecutor(null);
    setCurrentView('edit');
  };

  const handleAddHeir = (heir) => {
    if (editingHeirIndex !== null) {
      // 編集モード
      const updated = [...heirs];
      updated[editingHeirIndex] = heir;
      setHeirs(updated);
      setEditingHeirIndex(null);
      showMessage('相続人を更新しました');
    } else {
      // 追加モード
      setHeirs([...heirs, heir]);
      showMessage('相続人を追加しました');
    }
  };

  const handleEditHeir = (index) => {
    setEditingHeirIndex(index);
  };

  const handleCancelEdit = () => {
    setEditingHeirIndex(null);
  };

  const handleRemoveHeir = (index) => {
    setHeirs(heirs.filter((_, idx) => idx !== index));
    // この相続人に関連する配分も削除
    setAllocations(allocations.filter(alloc => alloc.heir_index !== index));
    showMessage('相続人を削除しました');
  };

  const handleAddRealEstate = (estate) => {
    if (editingRealEstate !== null) {
      // 編集モード
      const updated = [...allocations];
      const { heirIndex } = editingRealEstate;
      const allocIndex = updated.findIndex(a => a.heir_index === heirIndex);

      if (allocIndex >= 0) {
        if (estate.type === 'land' || estate.type === 'both') {
          updated[allocIndex].land = estate.land;
        }
        if (estate.type === 'building' || estate.type === 'both') {
          updated[allocIndex].building = estate.building;
        }
      }

      setAllocations(updated);
      setEditingRealEstate(null);
      showMessage('不動産を更新しました');
    } else {
      // 追加モード
      const newAllocation = {
        heir_index: estate.heir_index,
        land: (estate.type === 'land' || estate.type === 'both') ? estate.land : null,
        building: (estate.type === 'building' || estate.type === 'both') ? estate.building : null,
        bank_accounts: [],
        securities: []
      };

      // 同じ相続人の既存の配分を探す
      const existingIndex = allocations.findIndex(a => a.heir_index === estate.heir_index);

      if (existingIndex >= 0) {
        // 既存の配分に不動産を追加
        const updated = [...allocations];
        if (newAllocation.land) updated[existingIndex].land = newAllocation.land;
        if (newAllocation.building) updated[existingIndex].building = newAllocation.building;
        setAllocations(updated);
      } else {
        // 新しい配分を追加
        setAllocations([...allocations, newAllocation]);
      }

      showMessage('不動産を追加しました');
    }
  };

  const handleEditRealEstate = (heirIndex) => {
    const alloc = allocations.find(a => a.heir_index === heirIndex);
    if (alloc && (alloc.land || alloc.building)) {
      setEditingRealEstate({ heirIndex, land: alloc.land, building: alloc.building });
    }
  };

  const handleDeleteRealEstate = (heirIndex) => {
    const updated = allocations.map(alloc => {
      if (alloc.heir_index === heirIndex) {
        return { ...alloc, land: null, building: null };
      }
      return alloc;
    }).filter(alloc => alloc.land || alloc.building || alloc.bank_accounts.length > 0 || alloc.securities.length > 0);

    setAllocations(updated);
    showMessage('不動産を削除しました');
  };

  const handleCancelEditRealEstate = () => {
    setEditingRealEstate(null);
  };

  const handleAddBankAccount = (account) => {
    if (editingBankAccount !== null) {
      // 編集モード
      const updated = [...allocations];
      const { heirIndex, accountIndex } = editingBankAccount;
      const allocIndex = updated.findIndex(a => a.heir_index === heirIndex);

      if (allocIndex >= 0) {
        updated[allocIndex].bank_accounts[accountIndex] = {
          bank_name: account.bank_name,
          branch_name: account.branch_name,
          account_type: account.account_type,
          account_number: account.account_number,
          symbol: account.symbol || null
        };
      }

      setAllocations(updated);
      setEditingBankAccount(null);
      showMessage('銀行預金を更新しました');
    } else {
      // 追加モード
      const heirIndex = account.heir_index;

      // 同じ相続人の既存の配分を探す
      const existingIndex = allocations.findIndex(a => a.heir_index === heirIndex);

      const bankAccountData = {
        bank_name: account.bank_name,
        branch_name: account.branch_name,
        account_type: account.account_type,
        account_number: account.account_number,
        symbol: account.symbol || null
      };

      if (existingIndex >= 0) {
        // 既存の配分に銀行預金を追加
        const updated = [...allocations];
        updated[existingIndex].bank_accounts.push(bankAccountData);
        setAllocations(updated);
      } else {
        // 新しい配分を追加
        setAllocations([...allocations, {
          heir_index: heirIndex,
          land: null,
          building: null,
          bank_accounts: [bankAccountData],
          securities: []
        }]);
      }

      showMessage('銀行預金を追加しました');
    }
  };

  const handleEditBankAccount = (heirIndex, accountIndex) => {
    const alloc = allocations.find(a => a.heir_index === heirIndex);
    if (alloc && alloc.bank_accounts[accountIndex]) {
      setEditingBankAccount({
        heirIndex,
        accountIndex,
        account: { ...alloc.bank_accounts[accountIndex], heir_index: heirIndex }
      });
    }
  };

  const handleDeleteBankAccount = (heirIndex, accountIndex) => {
    const updated = allocations.map(alloc => {
      if (alloc.heir_index === heirIndex) {
        return {
          ...alloc,
          bank_accounts: alloc.bank_accounts.filter((_, idx) => idx !== accountIndex)
        };
      }
      return alloc;
    }).filter(alloc => alloc.land || alloc.building || alloc.bank_accounts.length > 0 || alloc.securities.length > 0);

    setAllocations(updated);
    showMessage('銀行預金を削除しました');
  };

  const handleCancelEditBankAccount = () => {
    setEditingBankAccount(null);
  };

  const handleAddSecurities = (sec) => {
    if (editingSecurities !== null) {
      // 編集モード
      const updated = [...allocations];
      const { heirIndex, securitiesIndex } = editingSecurities;
      const allocIndex = updated.findIndex(a => a.heir_index === heirIndex);

      if (allocIndex >= 0) {
        updated[allocIndex].securities[securitiesIndex] = {
          securities_company: sec.securities_company,
          branch: sec.branch || null,
          account_number: sec.account_number || null,
          is_unlisted: sec.is_unlisted,
          head_office: sec.head_office || null,
          stocks: sec.stocks
        };
      }

      setAllocations(updated);
      setEditingSecurities(null);
      showMessage('有価証券を更新しました');
    } else {
      // 追加モード
      const heirIndex = sec.heir_index;

      const securitiesData = {
        securities_company: sec.securities_company,
        branch: sec.branch || null,
        account_number: sec.account_number || null,
        is_unlisted: sec.is_unlisted,
        head_office: sec.head_office || null,
        stocks: sec.stocks
      };

      // 同じ相続人の既存の配分を探す
      const existingIndex = allocations.findIndex(a => a.heir_index === heirIndex);

      if (existingIndex >= 0) {
        // 既存の配分に有価証券を追加
        const updated = [...allocations];
        updated[existingIndex].securities.push(securitiesData);
        setAllocations(updated);
      } else {
        // 新しい配分を追加
        setAllocations([...allocations, {
          heir_index: heirIndex,
          land: null,
          building: null,
          bank_accounts: [],
          securities: [securitiesData]
        }]);
      }

      showMessage('有価証券を追加しました');
    }
  };

  const handleEditSecurities = (heirIndex, securitiesIndex) => {
    const alloc = allocations.find(a => a.heir_index === heirIndex);
    if (alloc && alloc.securities[securitiesIndex]) {
      setEditingSecurities({
        heirIndex,
        securitiesIndex,
        securities: { ...alloc.securities[securitiesIndex], heir_index: heirIndex }
      });
    }
  };

  const handleDeleteSecurities = (heirIndex, securitiesIndex) => {
    const updated = allocations.map(alloc => {
      if (alloc.heir_index === heirIndex) {
        return {
          ...alloc,
          securities: alloc.securities.filter((_, idx) => idx !== securitiesIndex)
        };
      }
      return alloc;
    }).filter(alloc => alloc.land || alloc.building || alloc.bank_accounts.length > 0 || alloc.securities.length > 0);

    setAllocations(updated);
    showMessage('有価証券を削除しました');
  };

  const handleCancelEditSecurities = () => {
    setEditingSecurities(null);
  };

  const handleSaveWill = async () => {
    const willData = {
      id: willId || '',
      created_at: '',
      updated_at: '',
      testator: testator.name || testator.address ? testator : null,
      heirs,
      allocations,
      other_asset_heir_index: otherAssetHeirIndex,
      executor
    };

    try {
      let response;
      if (willId) {
        // 更新
        response = await axios.put(`${API_URL}/wills/${willId}`, willData);
        showMessage('遺言書を更新しました');
      } else {
        // 新規作成
        response = await axios.post(`${API_URL}/wills`, willData);
        setWillId(response.data.id);
        showMessage('遺言書を保存しました');
      }
    } catch (err) {
      showMessage('保存エラー: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  return (
    <div className="App">
      <div className="App-header">
        <h1>遺言書作成システム</h1>
        <p>遺言書の作成と管理をサポートします</p>
      </div>

      {message && (
        <div className={messageType === 'error' ? 'error' : 'success'}>
          {message}
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${currentView === 'list' ? 'active' : ''}`}
          onClick={() => setCurrentView('list')}
        >
          遺言書一覧
        </button>
        <button
          className={`tab ${currentView === 'edit' ? 'active' : ''}`}
          onClick={() => setCurrentView('edit')}
        >
          編集
        </button>
        <button
          className={`tab ${currentView === 'preview' ? 'active' : ''}`}
          onClick={() => setCurrentView('preview')}
        >
          プレビュー
        </button>
      </div>

      {currentView === 'list' && (
        <WillList
          onSelect={(id) => setWillId(id)}
          onNew={createNewWill}
        />
      )}

      {currentView === 'edit' && (
        <>
          <div className="section">
            <h2>現在の遺言書</h2>
            {willId ? (
              <p>ID: {willId}</p>
            ) : (
              <p>新規作成中</p>
            )}
            <button onClick={handleSaveWill} className="success">
              保存
            </button>
          </div>

          <div className="section">
            <h2>あなたの情報</h2>
            <div className="form-group">
              <label>あなたの氏名</label>
              <input
                type="text"
                value={testator.name}
                onChange={(e) => setTestator({ ...testator, name: e.target.value })}
                placeholder="山田太郎"
              />
            </div>
            <div className="form-group">
              <label>あなたの住所</label>
              <input
                type="text"
                value={testator.address}
                onChange={(e) => setTestator({ ...testator, address: e.target.value })}
                placeholder="〇〇県〇〇市〇〇町〇丁目〇番〇号"
              />
            </div>
          </div>

          <HeirForm
            onAdd={handleAddHeir}
            editingHeir={editingHeirIndex !== null ? heirs[editingHeirIndex] : null}
            onCancelEdit={handleCancelEdit}
          />

          {heirs.length > 0 && (
            <div className="section">
              <h2>登録済み相続人</h2>
              <div className="heir-list">
                {heirs.map((heir, idx) => (
                  <div key={idx} className="heir-item">
                    <h4>{heir.relationship} {heir.name}</h4>
                    <p>生年月日: {heir.birth_date}</p>
                    <button onClick={() => handleEditHeir(idx)} className="secondary">
                      編集
                    </button>
                    <button onClick={() => handleRemoveHeir(idx)} className="danger">
                      削除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <RealEstateForm
            heirs={heirs}
            onAdd={handleAddRealEstate}
            editingData={editingRealEstate}
            onCancelEdit={handleCancelEditRealEstate}
          />
          <BankAccountForm
            heirs={heirs}
            onAdd={handleAddBankAccount}
            editingData={editingBankAccount}
            onCancelEdit={handleCancelEditBankAccount}
          />
          <SecuritiesForm
            heirs={heirs}
            onAdd={handleAddSecurities}
            editingData={editingSecurities}
            onCancelEdit={handleCancelEditSecurities}
          />
          {heirs.length > 0 && (
            <div className="section">
              <h2>上記以外の財産</h2>
              <div className="form-group">
                <label>相続させる人</label>
                <select
                  value={otherAssetHeirIndex !== null ? otherAssetHeirIndex : ''}
                  onChange={(e) => setOtherAssetHeirIndex(e.target.value !== '' ? parseInt(e.target.value) : null)}
                >
                  <option value="">選択してください</option>
                  {heirs.map((heir, idx) => (
                    <option key={idx} value={idx}>
                      {heir.relationship} {heir.name}
                    </option>
                  ))}
                </select>
              </div>
              {otherAssetHeirIndex !== null && (
                <div className="heir-item" style={{ marginTop: '10px' }}>
                  <p>
                    上記以外の財産は、{heirs[otherAssetHeirIndex]?.relationship} {heirs[otherAssetHeirIndex]?.name} に相続させます。
                  </p>
                </div>
              )}
            </div>
          )}

          <ExecutorForm heirs={heirs} executor={executor} onSet={setExecutor} />

          {allocations.length > 0 && (
            <div className="section">
              <h2>登録済み遺産配分</h2>
              <div className="allocation-list">
                {allocations.map((alloc, idx) => (
                  <div key={idx} className="allocation-item">
                    <h4>相続人: {heirs[alloc.heir_index]?.relationship} {heirs[alloc.heir_index]?.name}</h4>

                    {(alloc.land || alloc.building) && (
                      <div style={{ marginBottom: '10px' }}>
                        <p>
                          <strong>不動産:</strong>
                          {alloc.land && ` 土地: ${alloc.land.location}`}
                          {alloc.land && alloc.building && ', '}
                          {alloc.building && ` 建物: ${alloc.building.location}`}
                        </p>
                        <button onClick={() => handleEditRealEstate(alloc.heir_index)} className="secondary" style={{ fontSize: '12px', padding: '5px 10px' }}>
                          編集
                        </button>
                        <button onClick={() => handleDeleteRealEstate(alloc.heir_index)} className="danger" style={{ fontSize: '12px', padding: '5px 10px' }}>
                          削除
                        </button>
                      </div>
                    )}

                    {alloc.bank_accounts.length > 0 && (
                      <div style={{ marginBottom: '10px' }}>
                        <strong>銀行預金:</strong>
                        {alloc.bank_accounts.map((account, accIdx) => (
                          <div key={accIdx} style={{ marginLeft: '20px', marginTop: '5px' }}>
                            <p>
                              {account.bank_name} {account.branch_name && `${account.branch_name}`} {account.account_type}
                            </p>
                            <button onClick={() => handleEditBankAccount(alloc.heir_index, accIdx)} className="secondary" style={{ fontSize: '12px', padding: '5px 10px' }}>
                              編集
                            </button>
                            <button onClick={() => handleDeleteBankAccount(alloc.heir_index, accIdx)} className="danger" style={{ fontSize: '12px', padding: '5px 10px' }}>
                              削除
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {alloc.securities.length > 0 && (
                      <div style={{ marginBottom: '10px' }}>
                        <strong>有価証券:</strong>
                        {alloc.securities.map((sec, secIdx) => (
                          <div key={secIdx} style={{ marginLeft: '20px', marginTop: '5px' }}>
                            <p>
                              {sec.securities_company || '非上場株式'} ({sec.stocks.length > 0 ? `${sec.stocks.length}銘柄` : '全部'})
                            </p>
                            <button onClick={() => handleEditSecurities(alloc.heir_index, secIdx)} className="secondary" style={{ fontSize: '12px', padding: '5px 10px' }}>
                              編集
                            </button>
                            <button onClick={() => handleDeleteSecurities(alloc.heir_index, secIdx)} className="danger" style={{ fontSize: '12px', padding: '5px 10px' }}>
                              削除
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {currentView === 'preview' && (
        <WillPreview willId={willId} willData={{ testator, heirs, allocations, other_asset_heir_index: otherAssetHeirIndex, executor }} />
      )}
    </div>
  );
}

export default App;
