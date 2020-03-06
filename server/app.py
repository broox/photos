from flask import Flask, render_template, request, send_from_directory
from gevent.pywsgi import WSGIServer
from requests import get
import os

app = Flask(__name__,
            static_folder = 'dist/assets',
            template_folder = 'dist/templates')

API_HOST = 'https://api.broox.com/'
FLASK_ENV = os.environ.get('FLASK_ENV')
PRODUCTION = 'production'
VERIFY_SSL = FLASK_ENV == PRODUCTION


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'dist/assets/icons'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')


@app.route('/api/<path:path>', methods=['GET'])
def proxy(path):
    url = f'{API_HOST}{path}?{request.query_string.decode("utf-8")}'
    app.logger.info(f'Requesting {url}')
    response = get(url, verify=VERIFY_SSL)
    return response.content, response.status_code


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    # This was an attempt to connect directly to the Vue CLI development server
    # running on the other container. Vue uses sockets to do hot reloading as
    # files change. Proxying the sockets through Flask didN't quite work without
    # some level of effort that I was not ready to put in.
    #
    # if app.debug:
    #     app.logger.info(f'proxying to client: {path}')
    #     return get('http://client:8000/{}'.format(path)).text

    return render_template('index.html')


if __name__ == "__main__":
    app.logger.info('WSGI server started')
    http_server = WSGIServer(('', 5000), app)
    http_server.serve_forever()
