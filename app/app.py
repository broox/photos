from flask import Flask, render_template, request
from gevent.pywsgi import WSGIServer
from requests import get
import os

app = Flask(__name__)

API_HOST = 'https://api.broox.com/'
FLASK_ENV = os.environ.get('FLASK_ENV')
PRODUCTION = 'production'

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/<path:path>', methods=['GET'])
def proxy(path):
    verify_ssl = FLASK_ENV == PRODUCTION
    url = f'{API_HOST}{path}?{request.query_string.decode("utf-8")}'
    app.logger.info(f'Requesting {url}')
    response = get(url, verify=verify_ssl)
    return response.content, response.status_code

if __name__ == "__main__":
    if FLASK_ENV == PRODUCTION:
        http_server = WSGIServer(('', 5000), app)
        http_server.serve_forever()
    else:
        app.run(host="0.0.0.0", debug=True)
