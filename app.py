import os
import subprocess
import threading
import time
from flask import Flask, send_from_directory, jsonify

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

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('public', path)

@app.route('/health')
def health():
    return jsonify({"status": "ok", "message": "StatWise Admin Panel is running"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)