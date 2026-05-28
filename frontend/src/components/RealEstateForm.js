import React, { useState, useEffect } from 'react';
import MapSelector from './MapSelector';

export default function RealEstateForm({ heirs, onAdd, editingData, onCancelEdit }) {
  const [showMap, setShowMap] = useState(false);
  const [estate, setEstate] = useState({
    heir_index: 0,
    type: 'land',
    land: {
      location: '',
      lot_number: ''
    },
    building: {
      location: '',
      lot_number: '',
      house_number: ''
    }
  });

  useEffect(() => {
    if (editingData) {
      const { heirIndex, land, building } = editingData;
      let type = 'land';
      if (land && building) {
        type = 'both';
      } else if (building) {
        type = 'building';
      }

      setEstate({
        heir_index: heirIndex,
        type,
        land: land || { location: '', lot_number: '' },
        building: building || { location: '', lot_number: '', house_number: '' }
      });
    }
  }, [editingData]);

  const handleMapAddress = (address) => {
    if (estate.type === 'land') {
      setEstate({
        ...estate,
        land: { ...estate.land, location: address }
      });
    } else if (estate.type === 'building') {
      setEstate({
        ...estate,
        building: { ...estate.building, location: address }
      });
    } else if (estate.type === 'both') {
      setEstate({
        ...estate,
        land: { ...estate.land, location: address },
        building: { ...estate.building, location: address }
      });
    }
    setShowMap(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(estate);
    setEstate({
      heir_index: 0,
      type: 'land',
      land: {
        location: '',
        lot_number: ''
      },
      building: {
        location: '',
        lot_number: '',
        house_number: ''
      }
    });
  };

  const handleCancel = () => {
    setEstate({
      heir_index: 0,
      type: 'land',
      land: { location: '', lot_number: '' },
      building: { location: '', lot_number: '', house_number: '' }
    });
    if (onCancelEdit) {
      onCancelEdit();
    }
  };

  if (heirs.length === 0) {
    return (
      <div className="section">
        <h2>不動産の追加</h2>
        <p>まず相続人を追加してください。</p>
      </div>
    );
  }

  return (
    <div className="section">
      <h2>{editingData ? '不動産の編集' : '不動産の追加'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>相続させる人</label>
          <select
            value={estate.heir_index}
            onChange={(e) => setEstate({ ...estate, heir_index: parseInt(e.target.value) })}
          >
            {heirs.map((heir, idx) => (
              <option key={idx} value={idx}>
                {heir.relationship} {heir.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>種類</label>
          <select
            value={estate.type}
            onChange={(e) => setEstate({ ...estate, type: e.target.value })}
          >
            <option value="land">土地のみ</option>
            <option value="building">建物のみ</option>
            <option value="both">土地と建物</option>
          </select>
        </div>

        <button type="button" onClick={() => setShowMap(!showMap)} className="secondary">
          {showMap ? '地図を閉じる' : '地図で住所を選択'}
        </button>

        {showMap && <MapSelector onAddressSelect={handleMapAddress} />}

        {(estate.type === 'land' || estate.type === 'both') && (
          <>
            <h3>土地情報</h3>
            <div className="form-group">
              <label>所在</label>
              <input
                type="text"
                value={estate.land.location}
                onChange={(e) => setEstate({
                  ...estate,
                  land: { ...estate.land, location: e.target.value }
                })}
                placeholder="〇〇市〇〇１丁目"
                required
              />
            </div>
            <div className="form-group">
              <label>地番（任意）</label>
              <input
                type="text"
                value={estate.land.lot_number}
                onChange={(e) => setEstate({
                  ...estate,
                  land: { ...estate.land, lot_number: e.target.value }
                })}
                placeholder="○○番○○"
              />
              <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                ※　地番は、住所を示す住居表示とは異なります。<br />
                ※　遺言書を作成される場合は、地番・家屋番号による不動産の特定が必要です。<br />
                不明な場合は、権利証・登記識別情報通知や固定資産税納税通知書で確認するか、法務局でお調べ下さい。
              </p>
            </div>
          </>
        )}

        {(estate.type === 'building' || estate.type === 'both') && (
          <>
            <h3>建物情報</h3>
            <div className="form-group">
              <label>所在</label>
              <input
                type="text"
                value={estate.building.location}
                onChange={(e) => setEstate({
                  ...estate,
                  building: { ...estate.building, location: e.target.value }
                })}
                placeholder="〇〇市〇〇１丁目"
                required
              />
            </div>
            <div className="form-group">
              <label>地番（任意）</label>
              <input
                type="text"
                value={estate.building.lot_number}
                onChange={(e) => setEstate({
                  ...estate,
                  building: { ...estate.building, lot_number: e.target.value }
                })}
                placeholder="○○番地○○"
              />
            </div>
            <div className="form-group">
              <label>家屋番号（任意）</label>
              <input
                type="text"
                value={estate.building.house_number}
                onChange={(e) => setEstate({
                  ...estate,
                  building: { ...estate.building, house_number: e.target.value }
                })}
                placeholder="○○番○○"
              />
              <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                ※　地番は、住所を示す住居表示とは異なります。<br />
                ※　遺言書を作成される場合は、地番・家屋番号による不動産の特定が必要です。<br />
                不明な場合は、権利証・登記識別情報通知や固定資産税納税通知書で確認するか、法務局でお調べ下さい。
              </p>
            </div>
          </>
        )}

        <button type="submit">{editingData ? '更新' : '不動産を追加'}</button>
        {editingData && (
          <button type="button" onClick={handleCancel} className="secondary">
            キャンセル
          </button>
        )}
      </form>
    </div>
  );
}
