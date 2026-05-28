"""
データモデル定義
"""
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import uuid


@dataclass
class Heir:
    """相続人"""
    relationship: str  # 続柄（妻、夫、長男、長女、次男、次女、その他）
    name: str
    birth_date: str  # YYYY-MM-DD形式

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class RealEstateLand:
    """不動産（土地）"""
    location: str  # 所在
    lot_number: Optional[str] = ''  # 地番
    # 後方互換性のため削除フィールドをOptionalで保持
    land_category: Optional[str] = None
    area: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class RealEstateBuilding:
    """不動産（建物）"""
    location: str  # 所在
    lot_number: Optional[str] = ''  # 地番
    house_number: Optional[str] = ''  # 家屋番号
    # 後方互換性のため削除フィールドをOptionalで保持
    building_type: Optional[str] = None
    structure: Optional[str] = None
    floor_area: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class BankAccount:
    """銀行預金"""
    bank_name: str  # 銀行名
    branch_name: str  # 支店名
    account_type: str  # 口座種別（普通預金、定期預金、通常貯金、定額貯金、定期貯金）
    account_number: str  # 口座番号
    symbol: Optional[str] = None  # ゆうちょ銀行の記号（ゆうちょの場合）

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class Stock:
    """株式情報"""
    company_name: str  # 会社名
    shares: Optional[str] = None  # 株数（例: "100株"、または"全部"）

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class Securities:
    """有価証券"""
    securities_company: str  # 証券会社名
    branch: Optional[str] = None  # 支店
    account_number: Optional[str] = None  # 口座番号
    stocks: List[Stock] = None  # 株式リスト
    is_unlisted: bool = False  # 非上場株式かどうか
    head_office: Optional[str] = None  # 本店所在地（非上場の場合）

    def __post_init__(self):
        if self.stocks is None:
            self.stocks = []

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data['stocks'] = [stock.to_dict() if hasattr(stock, 'to_dict') else stock for stock in self.stocks]
        return data


@dataclass
class Executor:
    """遺言執行者"""
    address: str
    name: str
    birth_date: str  # YYYY-MM-DD形式
    relationship: Optional[str] = None  # 続柄（相続人から選択した場合）
    from_heir: bool = False  # 相続人から選択したかどうか

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class AssetAllocation:
    """遺産配分（相続人と遺産の組み合わせ）"""
    heir_index: int  # 相続人のインデックス
    land: Optional[RealEstateLand] = None
    building: Optional[RealEstateBuilding] = None
    bank_accounts: List[BankAccount] = None
    securities: List[Securities] = None

    def __post_init__(self):
        if self.bank_accounts is None:
            self.bank_accounts = []
        if self.securities is None:
            self.securities = []

    def to_dict(self) -> Dict[str, Any]:
        return {
            'heir_index': self.heir_index,
            'land': self.land.to_dict() if self.land else None,
            'building': self.building.to_dict() if self.building else None,
            'bank_accounts': [acc.to_dict() for acc in self.bank_accounts],
            'securities': [sec.to_dict() for sec in self.securities]
        }


@dataclass
class Testator:
    """遺言者"""
    name: str  # 氏名
    address: str  # 住所

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class Will:
    """遺言書全体"""
    id: str
    created_at: str
    updated_at: str
    heirs: List[Heir]
    allocations: List[AssetAllocation]  # 相続人と遺産の配分
    testator: Optional[Testator] = None  # 遺言者情報
    other_asset_heir_index: Optional[int] = None  # 上記以外の財産を相続する人のインデックス
    executor: Optional[Executor] = None

    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())
        if not self.created_at:
            self.created_at = datetime.now().isoformat()
        if not self.updated_at:
            self.updated_at = datetime.now().isoformat()

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'heirs': [heir.to_dict() for heir in self.heirs],
            'allocations': [alloc.to_dict() for alloc in self.allocations],
            'testator': self.testator.to_dict() if self.testator else None,
            'other_asset_heir_index': self.other_asset_heir_index,
            'executor': self.executor.to_dict() if self.executor else None
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Will':
        """辞書からWillオブジェクトを生成"""
        heirs = [Heir(**heir) for heir in data.get('heirs', [])]

        allocations = []
        for alloc_data in data.get('allocations', []):
            land = RealEstateLand(**alloc_data['land']) if alloc_data.get('land') else None
            building = RealEstateBuilding(**alloc_data['building']) if alloc_data.get('building') else None
            bank_accounts = [BankAccount(**acc) for acc in alloc_data.get('bank_accounts', [])]

            securities = []
            for sec_data in alloc_data.get('securities', []):
                stocks = [Stock(**stock) for stock in sec_data.get('stocks', [])]
                sec_data_copy = sec_data.copy()
                sec_data_copy['stocks'] = stocks
                securities.append(Securities(**sec_data_copy))

            allocations.append(AssetAllocation(
                heir_index=alloc_data['heir_index'],
                land=land,
                building=building,
                bank_accounts=bank_accounts,
                securities=securities
            ))

        testator = Testator(**data['testator']) if data.get('testator') else None
        other_asset_heir_index = data.get('other_asset_heir_index')
        executor = Executor(**data['executor']) if data.get('executor') else None

        return cls(
            id=data.get('id', ''),
            created_at=data.get('created_at', ''),
            updated_at=data.get('updated_at', ''),
            heirs=heirs,
            allocations=allocations,
            testator=testator,
            other_asset_heir_index=other_asset_heir_index,
            executor=executor
        )
