import os
import subprocess
import threading
import time
import requests
from flask import Flask, send_from_directory, jsonify, request, Response

app = Flask(__name__)

# Global variable to store the Node.js process
node_process = None

def start_node_server():
    """Start the Node.js server in the background"""
    global node_process
    try:
        # Kill any existing Node.js processes
        subprocess.run(['pkill', '-f', 'node server.js'], capture_output=True)
        time.sleep(1)
        
        # Start the Node.js server
        node_process = subprocess.Popen(
            ['node', 'server.js'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            cwd=os.path.dirname(os.path.abspath(__file__))
        )
        print("Node.js server started with PID:", node_process.pid)
    except Exception as e:
        print(f"Error starting Node.js server: {e}")

# Start Node.js server when this module is imported
start_node_server()

@app.route('/')
def index():
    return send_from_directory('public', 'index.html')

@app.route('/api/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def proxy_api(path):
    """Proxy API calls to Node.js server"""
    try:
        url = f'http://localhost:3001/api/{path}'
        
        # Prepare request data
        data = None
        if request.method in ['POST', 'PUT']:
            data = request.get_json()
        
        # Make request to Node.js server
        resp = requests.request(
            method=request.method,
            url=url,
            headers={key: value for key, value in request.headers.items() 
                    if key.lower() != 'host'},
            json=data,
            params=dict(request.args),
            timeout=30
        )
        
        # Return response
        return Response(
            resp.content,
            status=resp.status_code,
            headers=dict(resp.headers)
        )
        
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "API server unavailable"}), 503
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('public', path)

@app.route('/health')
def health():
    return jsonify({"status": "ok", "message": "StatWise Admin Panel is running"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)