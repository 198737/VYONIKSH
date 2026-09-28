from flask import Flask, request, jsonify
from flask_cors import CORS

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml.anomaly_detector import detect_anomaly
app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return jsonify({
        "message": "VYONIKSH ML Backend is running"
    })


@app.route("/detect", methods=["POST"])
def detect():

    data = request.json

    temperature = float(data["temperature"])
    humidity = float(data["humidity"])
    pressure = float(data["pressure"])

    result = detect_anomaly(
        temperature,
        humidity,
        pressure
    )

    return jsonify(result)


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )