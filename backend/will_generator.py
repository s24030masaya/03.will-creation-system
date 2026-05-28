"""
遺言書テキスト生成ロジック
"""
from models import Will, AssetAllocation, Heir
from typing import List
import re


def convert_to_wareki(date_str: str) -> str:
    """西暦を和暦に変換（YYYY-MM-DD形式の文字列から）"""
    if not date_str:
        return ""

    try:
        year, month, day = date_str.split('-')
        year = int(year)
        month = int(month)
        day = int(day)

        # 令和: 2019年5月1日〜
        if year > 2019 or (year == 2019 and month >= 5):
            wareki_year = year - 2018
            era = "令和"
        # 平成: 1989年1月8日〜2019年4月30日
        elif year > 1989 or (year == 1989 and month >= 1 and day >= 8):
            wareki_year = year - 1988
            era = "平成"
        # 昭和: 1926年12月25日〜1989年1月7日
        elif year > 1926 or (year == 1926 and month == 12 and day >= 25):
            wareki_year = year - 1925
            era = "昭和"
        else:
            return f"{year}年{month}月{day}日"

        return f"{era}{wareki_year}年{month}月{day}日生"
    except:
        return date_str


def format_real_estate_clause(clause_num: int, heir: Heir, allocation: AssetAllocation) -> str:
    """不動産に関する条文を生成"""
    lines = []

    # ヘッダー
    relationship = heir.relationship if heir.relationship else "相続人"
    birth_info = convert_to_wareki(heir.birth_date)
    lines.append(f"第{clause_num}条　遺言者は下記の財産を{relationship}である{heir.name}（{birth_info}）に相続させる。")

    # 土地
    if allocation.land:
        land = allocation.land
        # 地番が空欄の場合は例示を表示
        if land.lot_number and land.lot_number.strip():
            lines.append(f"　１．土地　{land.location}{land.lot_number}")
        else:
            lines.append(f"　１．土地　{land.location}〇番〇")

    # 建物
    if allocation.building:
        building = allocation.building
        lot_num = ''
        house_num = ''

        # 地番の処理
        if hasattr(building, 'lot_number') and building.lot_number and building.lot_number.strip():
            lot_num = building.lot_number
        else:
            lot_num = '〇番地の〇'

        # 家屋番号の処理
        if building.house_number and building.house_number.strip():
            house_num = building.house_number
        else:
            house_num = '〇番〇'

        lines.append(f"　２．建物　{building.location}{lot_num}　家屋番号{house_num}")

    # 地番・家屋番号が不明な場合の注意書き
    has_empty_field = False
    if allocation.land and (not land.lot_number or not land.lot_number.strip()):
        has_empty_field = True
    if allocation.building and ((hasattr(building, 'lot_number') and (not building.lot_number or not building.lot_number.strip())) or
                                 (not building.house_number or not building.house_number.strip())):
        has_empty_field = True

    if has_empty_field:
        lines.append("※　地番・家屋番号が不明な場合は、権利証・登記識別情報通知や固定資産税納税通知書で確認するか、法務局でお調べ下さい。")

    return "\n".join(lines)


def format_bank_account_clause(clause_num: int, heir: Heir, allocation: AssetAllocation) -> str:
    """銀行預金に関する条文を生成"""
    if not allocation.bank_accounts:
        return ""

    lines = []
    relationship = heir.relationship if heir.relationship else "相続人"
    birth_info = convert_to_wareki(heir.birth_date)
    lines.append(f"第{clause_num}条　遺言者は下記の遺言者名義の預金債権を{relationship}{heir.name}（{birth_info}）に相続させる。")

    for idx, account in enumerate(allocation.bank_accounts, 1):
        if account.bank_name == "ゆうちょ銀行":
            # ゆうちょ銀行の場合
            if account.symbol:
                lines.append(f"（{idx}）{account.bank_name}　{account.account_type}　記号{account.symbol}　番号{account.account_number}")
            else:
                lines.append(f"（{idx}）{account.bank_name}　{account.account_type}　口座番号　{account.account_number}")
        else:
            # 一般の銀行
            lines.append(f"（{idx}）{account.bank_name}　{account.branch_name}　{account.account_type}　口座番号　{account.account_number}")

    return "\n".join(lines)


def format_single_securities_clause(clause_num: int, heir: Heir, securities) -> str:
    """単一の有価証券に関する条文を生成"""
    lines = []
    relationship = heir.relationship if heir.relationship else "相続人"
    birth_info = convert_to_wareki(heir.birth_date)

    if securities.is_unlisted:
        # 非上場株式の場合
        lines.append(f"第{clause_num}条　遺言者は下記の株式を{relationship}{heir.name}（{birth_info}）に相続させる。")
        for stock in securities.stocks:
            lines.append(f"社名：{stock.company_name}")
            if securities.head_office:
                lines.append(f"本店：{securities.head_office}")
            lines.append(f"券種：普通株式　{stock.shares}")
    else:
        # 上場株式の場合
        if len(securities.stocks) == 0:
            # 株式情報がない場合（全部）
            lines.append(f"第{clause_num}条　遺言者は下記の遺言者名義の株式の全部を{relationship}{heir.name}（{birth_info}）に相続させる。")
            if securities.branch and securities.account_number:
                lines.append(f"　{securities.securities_company}　{securities.branch}　口座番号{securities.account_number}")
            else:
                lines.append(f"　{securities.securities_company}")
        else:
            # 株式情報がある場合
            lines.append(f"第{clause_num}条　遺言者は遺言者名義の株式を{relationship}{heir.name}（{birth_info}）に相続させる。")
            if securities.branch and securities.account_number:
                lines.append(f"　{securities.securities_company}　{securities.branch}　口座番号{securities.account_number}")
            else:
                lines.append(f"　{securities.securities_company}")

            # 株式に番号を付ける（①、②、③...）
            stock_numbers = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩']
            for idx, stock in enumerate(securities.stocks):
                number = stock_numbers[idx] if idx < len(stock_numbers) else f"({idx + 1})"
                lines.append(f"{number}{stock.company_name}の株式{stock.shares if stock.shares else '全部'}")

    return "\n".join(lines)


def format_executor_clause(clause_num: int, executor) -> str:
    """遺言執行者に関する条文を生成"""
    if not executor:
        return ""

    lines = []

    # 相続人から選択した場合
    if hasattr(executor, 'from_heir') and executor.from_heir:
        relationship = executor.relationship if hasattr(executor, 'relationship') and executor.relationship else ""
        lines.append(f"第{clause_num}条　遺言者はこの遺言の執行者として{relationship}{executor.name}を指定する。")
    else:
        # 相続人以外の場合
        birth_info = convert_to_wareki(executor.birth_date)
        lines.append(f"第{clause_num}条　遺言者はこの遺言の執行者として下記の者を指定する。")
        lines.append(f"　　　　　　　　　　　　　　　　　　　（住所）　{executor.address}")
        lines.append(f"（氏名）　{executor.name}")
        lines.append(f"（生年月日）{birth_info}")

    lines.append("")  # 条文間に空白行を追加
    lines.append(f"第{clause_num + 1}条　遺言者は、遺言執行者に対して次の権限を与える。")
    lines.append("（１）遺言者が契約する貸金庫の開扉、解約および内容の取り出し")
    lines.append("（２）遺言の執行に必要なその他一切の行為をすること")

    return "\n".join(lines)


def generate_will_text(will: Will) -> str:
    """遺言書全体のテキストを生成"""
    lines = []

    # タイトル（中央寄せ）
    lines.append("　　　　　　　　　　　　　遺言書")
    lines.append("")

    # 冒頭文
    testator_name = will.testator.name if will.testator else "〇〇"
    lines.append(f"遺言者{testator_name}は、次のとおり遺言する。")
    lines.append("")

    clauses = []
    clause_num = 1

    # 各配分について条文を生成
    for allocation in will.allocations:
        heir = will.heirs[allocation.heir_index]

        # 不動産がある場合
        if allocation.land or allocation.building:
            clause = format_real_estate_clause(clause_num, heir, allocation)
            if clause:
                clauses.append(clause)
                clause_num += 1

        # 銀行預金がある場合
        if allocation.bank_accounts:
            clause = format_bank_account_clause(clause_num, heir, allocation)
            if clause:
                clauses.append(clause)
                clause_num += 1

        # 有価証券がある場合
        if allocation.securities:
            for securities in allocation.securities:
                clause = format_single_securities_clause(clause_num, heir, securities)
                if clause:
                    clauses.append(clause)
                    clause_num += 1

    # 上記以外の財産
    if will.other_asset_heir_index is not None and will.other_asset_heir_index < len(will.heirs):
        heir = will.heirs[will.other_asset_heir_index]
        relationship = heir.relationship if heir.relationship else "相続人"
        birth_info = convert_to_wareki(heir.birth_date)
        lines_other = []
        lines_other.append(f"第{clause_num}条　遺言者は前記に記載した財産以外に、遺言者の有する財産があった場合、そのすべてを{relationship}{heir.name}（{birth_info}）に相続させる。")
        clauses.append("\n".join(lines_other))
        clause_num += 1

    # 遺言執行者
    if will.executor:
        executor_clause = format_executor_clause(clause_num, will.executor)
        if executor_clause:
            clauses.append(executor_clause)

    lines.append("\n\n".join(clauses))
    lines.append("")
    lines.append("")

    # 末尾（日付・住所・氏名・押印）
    lines.append("令和〇年〇月〇日")
    testator_address = will.testator.address if will.testator else "〇〇〇〇"
    lines.append(f"住所　{testator_address}")
    lines.append(f"氏名　{testator_name}　印")

    return "\n".join(lines)
