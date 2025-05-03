from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/testsetup')
def testsetup():
    return jsonify(
        {
            "success": True,
            "message": "test route works!"
        }
    ), 200

@app.route('/api/scan-url', methods=['POST'])
def scan_url():
    data = request.json
    url = data.get('url')
    return jsonify({
        "url": url,
        "score": 90,
        "threats": ["URL safe"]
    })




if __name__ == '__main__':
    app.run(debug=True)
