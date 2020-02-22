from flask import Flask, render_template, request
from gevent.pywsgi import WSGIServer
from requests import get
import os

app = Flask(__name__)

API_HOST = 'https://api.broox.com/'
FLASK_ENV = os.environ.get('FLASK_ENV')
PRODUCTION = 'production'
VERIFY_SSL = FLASK_ENV == PRODUCTION


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/api/<path:path>', methods=['GET'])
def proxy(path):
    url = f'{API_HOST}{path}?{request.query_string.decode("utf-8")}'
    app.logger.info(f'Requesting {url}')
    response = get(url, verify=VERIFY_SSL)
    return response.content, response.status_code


@app.route('/search/<string:search_term>')
def search(search_term):
    return render_template('index.html', search_term=search_term)


@app.route('/<string:album>')
def album(album):
    url = f'{API_HOST}v1/albums/{album}'
    app.logger.info(f'Loading album {url}')
    response = get(url, verify=VERIFY_SSL)
    if response:
        return render_template('index.html', album=response.json())
    else:
        return render_template('index.html')


if __name__ == "__main__":
    http_server = WSGIServer(('', 5000), app)
    http_server.serve_forever()
