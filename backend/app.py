"""
Flaskアプリケーションのエントリーポイント
"""
from flask import Flask
from flask_cors import CORS
from routes import api

app = Flask(__name__)

# CORS設定（開発環境用）
CORS(app, resources={r"/api/*": {"origins": "*"}})

# APIブループリントを登録
app.register_blueprint(api, url_prefix='/api')


@app.route('/')
def index():
    return {'message': '遺言書作成システムAPI', 'version': '1.0.0'}


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
