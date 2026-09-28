import numpy as np
from sklearn.ensemble import IsolationForest

# Normal AWS observations
normal_data = np.array([
    [28.0, 72, 1012.5],
    [28.4, 70, 1012.6],
    [29.0, 68, 1011.9],
    [29.3, 71, 1012.1],
    [27.8, 75, 1013.0],
    [28.7, 73, 1012.4],
    [30.0, 65, 1011.5],
    [29.5, 69, 1012.0],
    [27.5, 77, 1013.2],
    [28.9, 70, 1012.3],
    [29.2, 67, 1011.8],
    [28.1, 74, 1012.8],
])

# Create the ML model
model = IsolationForest(
    contamination=0.1,
    random_state=42
)

# Train the model
model.fit(normal_data)


def detect_anomaly(temperature, humidity, pressure):

    observation = np.array([
        [temperature, humidity, pressure]
    ])

    prediction = model.predict(observation)[0]

    # Isolation Forest:
    #  1  = normal
    # -1  = anomaly
    if prediction == -1:
        status = "ANOMALY"
    else:
        status = "NORMAL"

    score = model.decision_function(observation)[0]

    return {
        "status": status,
        "anomaly_score": round(float(abs(score)), 3),
        "temperature": temperature,
        "humidity": humidity,
        "pressure": pressure
    }