"""
PDF生成ロジック
"""
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.units import mm
import io
import os


def register_japanese_font():
    """日本語フォントを登録（システムにインストールされているフォントを使用）"""
    try:
        # Windowsの場合
        font_path = "C:/Windows/Fonts/msgothic.ttc"
        if os.path.exists(font_path):
            pdfmetrics.registerFont(TTFont('Japanese', font_path))
            return 'Japanese'
    except:
        pass

    try:
        # Linuxの場合
        font_path = "/usr/share/fonts/truetype/takao-gothic/TakaoPGothic.ttf"
        if os.path.exists(font_path):
            pdfmetrics.registerFont(TTFont('Japanese', font_path))
            return 'Japanese'
    except:
        pass

    try:
        # macOSの場合
        font_path = "/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc"
        if os.path.exists(font_path):
            pdfmetrics.registerFont(TTFont('Japanese', font_path))
            return 'Japanese'
    except:
        pass

    # フォントが見つからない場合はHelveticaを使用（日本語は表示されない）
    return 'Helvetica'


def generate_will_pdf(will_text: str) -> bytes:
    """遺言書テキストからPDFを生成"""
    buffer = io.BytesIO()

    # A4サイズのキャンバスを作成
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # 日本語フォントを登録
    font_name = register_japanese_font()

    # タイトル
    c.setFont(font_name, 16)
    c.drawCentredString(width / 2, height - 40 * mm, "遺　言　書")

    # 本文
    c.setFont(font_name, 10)

    # テキストを行に分割
    lines = will_text.split('\n')

    # 開始位置
    y_position = height - 60 * mm
    line_height = 5 * mm

    for line in lines:
        # ページの下部に達したら新しいページを追加
        if y_position < 30 * mm:
            c.showPage()
            c.setFont(font_name, 10)
            y_position = height - 30 * mm

        # 行を描画
        c.drawString(30 * mm, y_position, line)
        y_position -= line_height

    # PDFを保存
    c.save()

    buffer.seek(0)
    return buffer.getvalue()
