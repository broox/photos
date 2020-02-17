from flask import Flask, render_template, request
from requests import get


app = Flask(__name__)

API_HOST = 'https://api.broox.com/'

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/<path:path>', methods=['GET'])
def proxy(path):
    url = f'{API_HOST}{path}?{request.query_string.decode("utf-8")}'
    app.logger.info(f'Requesting {url}')
    return get(url, verify=False).content  # TODO: remove `verify=False` for production

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)
