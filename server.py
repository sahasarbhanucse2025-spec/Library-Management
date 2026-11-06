#!/usr/bin/env python3
"""
Simple HTTP server to serve the Library Management System.
Usage:
    python server.py
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and disable aggressive caching for seamless local development
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def run_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Try finding an open port starting from PORT
    port = PORT
    server = None
    for attempt in range(10):
        try:
            server = socketserver.TCPServer(("", port), Handler)
            break
        except OSError:
            port += 1

    if not server:
        print(f"Error: Unable to bind to any port between {PORT} and {PORT + 10}")
        sys.exit(1)

    url = f"http://localhost:{port}/index.html"
    print("=" * 65)
    print(" 📚 BIBLIOTHECA PRO - UNIFIED LIBRARY MANAGEMENT SYSTEM")
    print("=" * 65)
    print(f"Server successfully started at: {url}")
    print("Press Ctrl+C to stop the server.")
    print("=" * 65)

    try:
        webbrowser.open(url)
    except Exception:
        pass

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        server.server_close()

if __name__ == "__main__":
    run_server()

