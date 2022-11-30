from notebook.utils import url_path_join
from notebook.base.handlers import IPythonHandler
from tornado.web import HTTPError

import json
import os
from mimetypes import guess_type

class DownloaderHandler(IPythonHandler):
    def initialize(self, root_path):
        self.root_path = root_path

    def get(self, file_path):
        if not file_path:
            raise HTTPError(status_code=404)
        
        absolute_file_path = os.path.join(self.root_path, file_path)
        if not os.path.isfile(absolute_file_path):
           raise HTTPError(status_code=404)

        content_type, _ = guess_type(absolute_file_path)
        self.add_header('Content-Type', content_type)
        self.add_header('Content-Disposition', "attachment; filename={};".format(os.path.basename(absolute_file_path)))
        with open(absolute_file_path) as source_file:
            self.write(source_file.read())

def load_jupyter_server_extension(nb_server_app):
    web_app = nb_server_app.web_app
    host_pattern = '.*$'
    root_path = os.getenv('JUPUTER_FILE_DOWNLOADER_ROOT_PATH', '/')

    route_pattern = url_path_join(web_app.settings['base_url'], '/jupyter-file-downloader/(.*)')
    handler_settings = { 'root_path': root_path }
    web_app.add_handlers(host_pattern, [(route_pattern, DownloaderHandler, handler_settings)])

def _jupyter_server_extension_paths():
    return [{
        "module": "JupyterFileDownloader"
    }]

def _jupyter_nbextension_paths():
    return [dict(
        section="notebook",
        src="static",
        dest="JupyterFileDownloader",
        require="JupyterFileDownloader/index")]