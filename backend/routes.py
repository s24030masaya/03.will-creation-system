"""
APIルート定義
"""
from flask import Blueprint, request, jsonify, send_file
from models import Will
from will_generator import generate_will_text
from pdf_generator import generate_will_pdf
import json
import os
from datetime import datetime
import io

api = Blueprint('api', __name__)

DATA_DIR = os.path.join(os.path.dirname(__file__), 'data', 'wills')


def ensure_data_dir():
    """データディレクトリが存在することを確認"""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)


@api.route('/wills', methods=['GET'])
def get_wills():
    """遺言書一覧を取得"""
    ensure_data_dir()

    wills = []
    for filename in os.listdir(DATA_DIR):
        if filename.endswith('.json'):
            filepath = os.path.join(DATA_DIR, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    wills.append({
                        'id': data['id'],
                        'created_at': data.get('created_at', ''),
                        'updated_at': data.get('updated_at', ''),
                        'heirs_count': len(data.get('heirs', []))
                    })
            except Exception as e:
                print(f"Error loading {filename}: {e}")
                continue

    # 更新日時の降順でソート
    wills.sort(key=lambda x: x.get('updated_at', ''), reverse=True)
    return jsonify(wills)


@api.route('/wills/<will_id>', methods=['GET'])
def get_will(will_id):
    """特定の遺言書を取得"""
    filepath = os.path.join(DATA_DIR, f"{will_id}.json")

    if not os.path.exists(filepath):
        return jsonify({'error': '遺言書が見つかりません'}), 404

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': f'読み込みエラー: {str(e)}'}), 500


@api.route('/wills', methods=['POST'])
def create_will():
    """新しい遺言書を作成"""
    ensure_data_dir()

    try:
        data = request.json
        will = Will.from_dict(data)

        # 現在時刻で作成日時と更新日時を設定
        will.created_at = datetime.now().isoformat()
        will.updated_at = datetime.now().isoformat()

        # ファイルに保存
        filepath = os.path.join(DATA_DIR, f"{will.id}.json")
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(will.to_dict(), f, ensure_ascii=False, indent=2)

        return jsonify(will.to_dict()), 201
    except Exception as e:
        return jsonify({'error': f'作成エラー: {str(e)}'}), 400


@api.route('/wills/<will_id>', methods=['PUT'])
def update_will(will_id):
    """遺言書を更新"""
    filepath = os.path.join(DATA_DIR, f"{will_id}.json")

    if not os.path.exists(filepath):
        return jsonify({'error': '遺言書が見つかりません'}), 404

    try:
        data = request.json
        will = Will.from_dict(data)
        will.id = will_id  # IDは変更しない

        # 更新日時を更新
        will.updated_at = datetime.now().isoformat()

        # ファイルに保存
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(will.to_dict(), f, ensure_ascii=False, indent=2)

        return jsonify(will.to_dict())
    except Exception as e:
        return jsonify({'error': f'更新エラー: {str(e)}'}), 400


@api.route('/wills/<will_id>', methods=['DELETE'])
def delete_will(will_id):
    """遺言書を削除"""
    filepath = os.path.join(DATA_DIR, f"{will_id}.json")

    if not os.path.exists(filepath):
        return jsonify({'error': '遺言書が見つかりません'}), 404

    try:
        os.remove(filepath)
        return jsonify({'message': '削除しました'}), 200
    except Exception as e:
        return jsonify({'error': f'削除エラー: {str(e)}'}), 500


@api.route('/wills/<will_id>/generate', methods=['POST'])
def generate_will(will_id):
    """遺言書テキストを生成"""
    filepath = os.path.join(DATA_DIR, f"{will_id}.json")

    if not os.path.exists(filepath):
        return jsonify({'error': '遺言書が見つかりません'}), 404

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        will = Will.from_dict(data)
        text = generate_will_text(will)

        return jsonify({'text': text})
    except Exception as e:
        return jsonify({'error': f'生成エラー: {str(e)}'}), 500


@api.route('/wills/<will_id>/pdf', methods=['GET'])
def download_pdf(will_id):
    """遺言書PDFをダウンロード"""
    filepath = os.path.join(DATA_DIR, f"{will_id}.json")

    if not os.path.exists(filepath):
        return jsonify({'error': '遺言書が見つかりません'}), 404

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        will = Will.from_dict(data)
        text = generate_will_text(will)
        pdf_bytes = generate_will_pdf(text)

        # PDFをメモリ上から送信
        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'will_{will_id}.pdf'
        )
    except Exception as e:
        return jsonify({'error': f'PDF生成エラー: {str(e)}'}), 500
