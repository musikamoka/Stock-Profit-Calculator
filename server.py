"""Python 3 standard-library local server. No pip dependencies."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs
import json
import threading
import webbrowser
from quote_provider import get_quote

ROOT = Path(__file__).resolve().parent / 'dist'

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        url = urlparse(self.path)
        if url.path != '/api/quote':
            return super().do_GET()
        symbol = parse_qs(url.query).get('symbol', [''])[0].strip()
        if not symbol or len(symbol) > 40:
            status, data = 400, {'error': '请输入有效股票代码。'}
        else:
            try:
                data = get_quote(symbol)
                status = 200
            except NotImplementedError:
                status, data = 501, {'error': '行情接口已预留，尚未连接数据源。请手动输入当前股价。'}
            except Exception:
                status, data = 502, {'error': '行情源读取失败，请稍后重试。'}
        payload = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    address = f'http://127.0.0.1:{server.server_port}/'
    print(f'Stock Profit Calculator: {address}\nPress Ctrl+C to stop.', flush=True)
    threading.Timer(0.5, lambda: webbrowser.open(address)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
