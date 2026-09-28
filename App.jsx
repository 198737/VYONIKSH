import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronRight,
  CloudRain,
  Gauge,
  Home,
  MapPin,
  Menu,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Thermometer,
  Wind,
  X,
  Zap,
} from "lucide-react";
import "./App.css";

const stations = [
  { name: "Kanjikkuzhy", district: "Alappuzha", lat: 9.62, lon: 76.332 },
  { name: "Kayamkulam", district: "Alappuzha", lat: 9.1767, lon: 76.5167 },
  { name: "North Paravur", district: "Ernakulam", lat: 10.144, lon: 76.23 },
  { name: "Munnar", district: "Idukki", lat: 10.0833, lon: 77.0567 },
  { name: "Peermade", district: "Idukki", lat: 9.573, lon: 76.991 },
  { name: "Vazathope", district: "Idukki", lat: 9.865, lon: 76.9983 },
  { name: "Irikkur", district: "Kannur", lat: 11.984, lon: 75.555 },
  { name: "Kudlu Agro", district: "Kasaragod", lat: 12.65, lon: 74.96 },
  { name: "Pilicode", district: "Kasaragod", lat: 12.2, lon: 75.1667 },
  { name: "Vellarikundu", district: "Kasaragod", lat: 12.357, lon: 75.296 },
  { name: "Kottarakkara", district: "Kollam", lat: 9.0, lon: 76.7167 },
  { name: "Valiyapadam", district: "Kollam", lat: 9.029, lon: 76.629 },
  { name: "Kumarakom Agro", district: "Kottayam", lat: 9.62, lon: 76.42 },
  { name: "Poonjar", district: "Kottayam", lat: 9.674, lon: 76.827 },
  { name: "Kakkayam", district: "Kozhikode", lat: 11.553, lon: 75.889 },
  { name: "Kozhikode", district: "Kozhikode", lat: 11.26, lon: 75.77 },
  { name: "Nilambur", district: "Malappuram", lat: 11.28, lon: 76.23 },
  { name: "Tavanur", district: "Malappuram", lat: 10.8436, lon: 75.9986 },
  { name: "Vakkad", district: "Malappuram", lat: 11.05, lon: 76.084 },
  { name: "Adakkaputhur", district: "Palakkad", lat: 10.87, lon: 76.373 },
  { name: "Mankara Agro", district: "Palakkad", lat: 10.77, lon: 76.6833 },
  { name: "Seethathode", district: "Pathanamthitta", lat: 9.331, lon: 76.971 },
  { name: "Neyyattinkara", district: "Thiruvananthapuram", lat: 8.408, lon: 77.082 },
  { name: "Vellayani", district: "Thiruvananthapuram", lat: 8.4433, lon: 76.9883 },
].map((station, index) => ({
  ...station,
  id: `AWS-${String(index + 1).padStart(3, "0")}`,
}));

function getDemoReading(index) {
  const temperatures = [
    28.4, 29.1, 27.8, 24.6, 23.9, 25.8,
    28.9, 29.4, 28.7, 27.6, 30.1, 29.3,
    28.1, 26.8, 27.9, 29.6, 30.2, 29.8,
    28.6, 31.0, 30.4, 26.9, 27.4, 28.2,
  ];

  const humidity = [
    72, 74, 81, 88, 91, 84,
    70, 68, 73, 76, 65, 69,
    78, 82, 75, 71, 67, 70,
    77, 63, 66, 85, 80, 74,
  ];

  return {
    temperature: temperatures[index] ?? 28.4,
    humidity: humidity[index] ?? 72,
    pressure: 1012.6 - (index % 6) * 0.7,
    wind: 5.4 + (index % 5) * 1.1,
  };
}

function App() {
  const [activePage, setActivePage] = useState("Overview");
  const [selectedStation, setSelectedStation] = useState(stations[0]);
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [temperature, setTemperature] = useState(28.4);
  const [humidity, setHumidity] = useState(72);
  const [pressure, setPressure] = useState(1012.6);
  const [mlResult, setMlResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [error, setError] = useState("");

  const districts = ["All", ...new Set(stations.map((s) => s.district))];

  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      const matchesSearch =
        station.name.toLowerCase().includes(search.toLowerCase()) ||
        station.district.toLowerCase().includes(search.toLowerCase()) ||
        station.id.toLowerCase().includes(search.toLowerCase());

      const matchesDistrict =
        district === "All" || station.district === district;

      return matchesSearch && matchesDistrict;
    });
  }, [search, district]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        setBackendConnected(true);
        setError("");
      })
      .catch(() => setBackendConnected(false));
  }, []);

  const runMLDetection = async (temp, rh, press) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:5000/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          temperature: temp,
          humidity: rh,
          pressure: press,
        }),
      });

      if (!response.ok) throw new Error("Backend error");

      const result = await response.json();

      setMlResult(result);
      setTemperature(temp);
      setHumidity(rh);
      setPressure(press);
      setBackendConnected(true);
    } catch (err) {
      setBackendConnected(false);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const simulateAnomaly = () => {
    runMLDetection(42.1, 20, 980);
  };

  const resetNormal = () => {
    runMLDetection(28.4, 72, 1012.6);
  };

  const isAnomaly = mlResult?.status === "ANOMALY";

  const openStation = (station) => {
    setSelectedStation(station);
    setActivePage("Stations");
    const reading = getDemoReading(stations.indexOf(station));
    setTemperature(reading.temperature);
    setHumidity(reading.humidity);
    setPressure(reading.pressure);
    setMlResult(null);
  };

  const navItems = [
    { name: "Overview", icon: Home },
    { name: "Stations", icon: MapPin, count: stations.length },
    { name: "Anomalies", icon: AlertTriangle },
    { name: "Sensor Health", icon: ShieldCheck },
  ];

  const systemItems = [
    { name: "ML Engine", icon: Zap },
    { name: "Settings", icon: Settings },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Activity size={27} strokeWidth={2.2} />
          </div>
          <div>
            <div className="brand-name">VYONIKSH</div>
            <div className="brand-subtitle">WEATHER INTELLIGENCE</div>
          </div>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => setActivePage(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
                {item.count && <small>{item.count}</small>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-label system-label">SYSTEM</div>

        <nav className="nav-list">
          {systemItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => setActivePage(item.name)}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="connection-card">
          <div className="connection-top">
            <span className={backendConnected ? "live-dot" : "offline-dot"} />
            {backendConnected ? "CONNECTED" : "SIMULATION"}
          </div>
          <strong>Python ML Engine</strong>
          <span>Isolation Forest • Ready</span>
        </div>

        <div className="profile">
          <div className="profile-avatar">V</div>
          <div>
            <strong>VYONIKSH</strong>
            <span>SIH 2026 Prototype</span>
          </div>
          <Menu size={20} />
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search station, district..."
            />
          </div>

          <div className="top-actions">
            <div className={`mode-pill ${backendConnected ? "live" : ""}`}>
              <span />
              {backendConnected ? "ML ENGINE CONNECTED" : "SIMULATION MODE"}
            </div>

            <button className="icon-button">
              <Bell size={18} />
            </button>

            <div className="top-avatar">S</div>
          </div>
        </header>

        {error && (
          <div className="error-banner">
            <AlertTriangle size={17} />
            <span>{error}</span>
            <button onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}

        {activePage === "Overview" && (
          <Overview
            stations={stations}
            temperature={temperature}
            humidity={humidity}
            pressure={pressure}
            mlResult={mlResult}
            isAnomaly={isAnomaly}
            loading={loading}
            simulateAnomaly={simulateAnomaly}
            resetNormal={resetNormal}
            openStation={openStation}
          />
        )}

        {activePage === "Stations" && (
          <StationsPage
            stations={filteredStations}
            selectedStation={selectedStation}
            setSelectedStation={openStation}
            search={search}
            setSearch={setSearch}
            district={district}
            setDistrict={setDistrict}
            districts={districts}
            temperature={temperature}
            humidity={humidity}
            pressure={pressure}
            mlResult={mlResult}
            isAnomaly={isAnomaly}
          />
        )}

        {activePage === "Anomalies" && (
          <AnomaliesPage
            mlResult={mlResult}
            temperature={temperature}
            simulateAnomaly={simulateAnomaly}
            resetNormal={resetNormal}
            loading={loading}
          />
        )}

        {activePage === "Sensor Health" && <SensorHealthPage />}

        {activePage === "ML Engine" && (
          <MLEnginePage backendConnected={backendConnected} />
        )}

        {activePage === "Settings" && <SettingsPage />}
      </main>
    </div>
  );
}

function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}

function Overview({
  stations,
  temperature,
  humidity,
  pressure,
  mlResult,
  isAnomaly,
  loading,
  simulateAnomaly,
  resetNormal,
  openStation,
}) {
  return (
    <>
      <PageHeader
        eyebrow="METEOROLOGICAL INTELLIGENCE CONTROL CENTER"
        title="Observation intelligence."
        description="Monitor automatic weather stations and identify unusual observations using machine learning."
      >
        <div className="live-status">
          <span />
          Live observation layer
          <strong>Just now</strong>
        </div>
      </PageHeader>

      <section className="metric-grid">
        <MetricCard
          label="ACTIVE STATIONS"
          value="24"
          meta="selected prototype network"
          icon={<MapPin size={19} />}
        />
        <MetricCard
          label="OBSERVATIONS"
          value="1,248"
          meta="simulated today"
          icon={<Activity size={19} />}
        />
        <MetricCard
          label="ANOMALIES"
          value={isAnomaly ? "01" : "00"}
          meta={isAnomaly ? "requires attention" : "all clear"}
          danger={isAnomaly}
          icon={<AlertTriangle size={19} />}
        />
        <MetricCard
          label="MODEL HEALTH"
          value="98.7%"
          meta="Isolation Forest"
          icon={<Zap size={19} />}
        />
      </section>

      <section className="control-panel">
        <div>
          <span className="eyebrow">PROTOTYPE CONTROLS</span>
          <p>
            Test the anomaly detection pipeline using simulated AWS
            observations.
          </p>
        </div>

        <div className="control-buttons">
          <button
            className={`danger-button ${loading ? "loading" : ""}`}
            onClick={simulateAnomaly}
            disabled={loading}
          >
            <AlertTriangle size={16} />
            {loading ? "Analyzing..." : "Simulate Anomaly"}
          </button>

          <button className="ghost-button" onClick={resetNormal}>
            <RefreshCw size={16} />
            Reset
          </button>
        </div>
      </section>

      <section className="overview-grid">
        <StationPreview
          station={stations[0]}
          temperature={temperature}
          humidity={humidity}
          pressure={pressure}
          isAnomaly={isAnomaly}
          openStation={openStation}
        />

        <AIPanel
          mlResult={mlResult}
          temperature={temperature}
          isAnomaly={isAnomaly}
        />
      </section>

      <section className="lower-grid">
        <div className="chart-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">OBSERVATION TREND</span>
              <h2>Temperature profile</h2>
            </div>
            <span className="time-chip">24 HOURS</span>
          </div>

          <div className="chart">
            <div className="chart-line" />
            <div className="chart-point p1" />
            <div className="chart-point p2" />
            <div className="chart-point p3" />
            <div className="chart-point p4" />
            <div className="chart-point p5" />
            <div className="chart-point p6" />
            <div className="chart-labels">
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
            </div>
          </div>
        </div>

        <div className="network-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">NETWORK</span>
              <h2>Station distribution</h2>
            </div>
            <MapPin size={18} />
          </div>

          <div className="network-map">
            <div className="map-glow" />
            {stations.slice(0, 12).map((station, i) => (
              <span
                key={station.id}
                className="map-node"
                style={{
                  left: `${15 + ((i * 29) % 72)}%`,
                  top: `${18 + ((i * 37) % 58)}%`,
                }}
              />
            ))}
            <div className="map-center">
              <span>KERALA</span>
              <strong>AWS NETWORK</strong>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function MetricCard({ label, value, meta, icon, danger }) {
  return (
    <div className={`metric-card ${danger ? "danger-card" : ""}`}>
      <div className="metric-top">
        <span>{label}</span>
        {icon}
      </div>
      <strong>{value}</strong>
      <div className="metric-meta">
        <span className={danger ? "red-dot" : "green-dot"} />
        {meta}
      </div>
    </div>
  );
}

function StationPreview({
  station,
  temperature,
  humidity,
  pressure,
  isAnomaly,
  openStation,
}) {
  return (
    <div className="station-card">
      <div className="card-heading">
        <div>
          <span className="eyebrow">SELECTED STATION</span>
          <h2>{station.id}</h2>
        </div>

        <span className={`status-pill ${isAnomaly ? "anomaly" : ""}`}>
          <span />
          {isAnomaly ? "ANOMALY" : "NORMAL"}
        </span>
      </div>

      <div className="station-location">
        <MapPin size={16} />
        {station.name} • {station.district}, Kerala
      </div>

      <div className="sensor-grid">
        <SensorBox
          icon={<Thermometer />}
          label="Temperature"
          value={`${temperature.toFixed(1)}°C`}
          danger={isAnomaly}
        />
        <SensorBox
          icon={<CloudRain />}
          label="Relative Humidity"
          value={`${humidity}%`}
        />
        <SensorBox
          icon={<Gauge />}
          label="Pressure"
          value={`${pressure.toFixed(1)} hPa`}
        />
        <SensorBox
          icon={<Wind />}
          label="Wind Speed"
          value="8.2 km/h"
        />
      </div>

      <button className="details-button" onClick={() => openStation(station)}>
        Open station details
        <ChevronRight size={17} />
      </button>
    </div>
  );
}

function SensorBox({ icon, label, value, danger }) {
  return (
    <div className={`sensor-box ${danger ? "sensor-danger" : ""}`}>
      <div className="sensor-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function AIPanel({ mlResult, temperature, isAnomaly }) {
  const score = mlResult?.anomaly_score ?? 0.077;

  return (
    <div className={`ai-card ${isAnomaly ? "ai-anomaly" : ""}`}>
      <div className="ai-heading">
        <div>
          <span className="eyebrow">VYONIKSH AI</span>
          <h2>Observation intelligence</h2>
        </div>
        <div className="ai-icon">
          <Zap size={19} />
        </div>
      </div>

      <div className="score-area">
        <div className="score-ring">
          <strong>{Number(score).toFixed(3)}</strong>
          <span>Anomaly Score</span>
        </div>

        <div className="assessment">
          <span className="eyebrow">MODEL ASSESSMENT</span>
          <h3>{isAnomaly ? "Unusual observation" : "Observation normal"}</h3>
          <p>
            {isAnomaly
              ? "The multivariate observation differs from the learned normal pattern."
              : "Current observation appears consistent with the learned normal pattern."}
          </p>
        </div>
      </div>

      <div className={`ai-message ${isAnomaly ? "warning" : ""}`}>
        {isAnomaly ? (
          <>
            <AlertTriangle size={17} />
            <span>
              {temperature.toFixed(1)}°C observation requires further
              investigation.
            </span>
          </>
        ) : (
          <>
            <CheckCircle2 size={17} />
            <span>Observation currently appears consistent with expected conditions.</span>
          </>
        )}
      </div>
    </div>
  );
}

function StationsPage({
  stations,
  selectedStation,
  setSelectedStation,
  search,
  setSearch,
  district,
  setDistrict,
  districts,
  temperature,
  humidity,
  pressure,
  mlResult,
  isAnomaly,
}) {
  const selectedIndex = Math.max(
    0,
    stations.findIndex((s) => s.id === selectedStation.id)
  );

  const selectedReading = getDemoReading(selectedIndex);

  return (
    <>
      <PageHeader
        eyebrow="KERALA AWS NETWORK"
        title="Stations."
        description="Explore the selected Automatic Weather Station network monitored by VYONIKSH."
      >
        <div className="network-count">
          <strong>24</strong>
          <span>prototype stations</span>
        </div>
      </PageHeader>

      <div className="station-toolbar">
        <div className="station-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search station or district..."
          />
        </div>

        <div className="filter-box">
          <SlidersHorizontal size={17} />
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          >
            {districts.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="station-layout">
        <div className="station-list">
          <div className="list-header">
            <span>{stations.length} stations</span>
            <span>IMD AWS reference network</span>
          </div>

          {stations.map((station, index) => {
            const reading = getDemoReading(
              stations.indexOf(station)
            );

            return (
              <button
                key={station.id}
                className={`station-row ${
                  selectedStation.id === station.id ? "selected" : ""
                }`}
                onClick={() => setSelectedStation(station)}
              >
                <div className="station-row-status">
                  <span className="station-live-dot" />
                </div>

                <div className="station-row-main">
                  <strong>{station.name}</strong>
                  <span>
                    {station.id} • {station.district}
                  </span>
                </div>

                <div className="station-row-reading">
                  <strong>{reading.temperature.toFixed(1)}°</strong>
                  <span>{reading.humidity}% RH</span>
                </div>

                <ChevronRight size={17} />
              </button>
            );
          })}
        </div>

        <div className="station-detail">
          <div className="detail-top">
            <div>
              <span className="eyebrow">STATION PROFILE</span>
              <h2>{selectedStation.name}</h2>
              <p>
                {selectedStation.district}, Kerala · {selectedStation.id}
              </p>
            </div>

            <span className="status-pill">
              <span />
              NORMAL
            </span>
          </div>

          <div className="coordinates">
            <MapPin size={16} />
            {selectedStation.lat}° N · {selectedStation.lon}° E
          </div>

          <div className="detail-sensors">
            <SensorBox
              icon={<Thermometer />}
              label="Temperature"
              value={`${(
                selectedStation.id === "AWS-001"
                  ? temperature
                  : selectedReading.temperature
              ).toFixed(1)}°C`}
            />
            <SensorBox
              icon={<CloudRain />}
              label="Relative Humidity"
              value={`${
                selectedStation.id === "AWS-001"
                  ? humidity
                  : selectedReading.humidity
              }%`}
            />
            <SensorBox
              icon={<Gauge />}
              label="Atmospheric Pressure"
              value={`${(
                selectedStation.id === "AWS-001"
                  ? pressure
                  : selectedReading.pressure
              ).toFixed(1)} hPa`}
            />
          </div>

          <div className="detail-section">
            <div className="section-title">
              <span>OBSERVATION QUALITY</span>
              <strong>{isAnomaly ? "ATTENTION" : "GOOD"}</strong>
            </div>

            <div className="quality-bar">
              <div
                className={isAnomaly ? "quality-fill anomaly-fill" : "quality-fill"}
                style={{ width: isAnomaly ? "48%" : "94%" }}
              />
            </div>

            <p>
              VYONIKSH evaluates temperature, humidity and pressure together
              before classifying an observation.
            </p>
          </div>

          <div className="detail-footer">
            <div>
              <span>STATION TYPE</span>
              <strong>Automatic Weather Station</strong>
            </div>
            <div>
              <span>DATA QUALITY</span>
              <strong>Good</strong>
            </div>
            <div>
              <span>LAST OBSERVATION</span>
              <strong>Just now</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function AnomaliesPage({
  mlResult,
  temperature,
  simulateAnomaly,
  resetNormal,
  loading,
}) {
  const anomaly = mlResult?.status === "ANOMALY";

  return (
    <>
      <PageHeader
        eyebrow="INTELLIGENT QUALITY ASSURANCE"
        title="Anomaly center."
        description="Review observations identified as unusual by the VYONIKSH ML engine."
      >
        <button
          className="danger-button"
          onClick={simulateAnomaly}
          disabled={loading}
        >
          <AlertTriangle size={16} />
          Test anomaly
        </button>
      </PageHeader>

      <div className={`anomaly-hero ${anomaly ? "active" : ""}`}>
        <div className="anomaly-symbol">
          <AlertTriangle size={32} />
        </div>
        <div>
          <span className="eyebrow">CURRENT ASSESSMENT</span>
          <h2>{anomaly ? "Unusual observation detected" : "No active anomaly"}</h2>
          <p>
            {anomaly
              ? `The model flagged the current ${temperature.toFixed(
                  1
                )}°C observation as unusual.`
              : "All currently displayed observations are within the learned normal pattern."}
          </p>
        </div>
        <button className="ghost-button" onClick={resetNormal}>
          <RefreshCw size={16} />
          Reset
        </button>
      </div>

      <div className="evidence-grid">
        <div className="evidence-card">
          <span className="eyebrow">MODEL</span>
          <h3>Isolation Forest</h3>
          <p>Multivariate anomaly detection</p>
        </div>

        <div className="evidence-card">
          <span className="eyebrow">FEATURES</span>
          <h3>Temperature + RH + Pressure</h3>
          <p>Joint observation analysis</p>
        </div>

        <div className="evidence-card">
          <span className="eyebrow">STATUS</span>
          <h3>{anomaly ? "Investigation required" : "All clear"}</h3>
          <p>Human review remains part of the workflow</p>
        </div>
      </div>
    </>
  );
}

function SensorHealthPage() {
  const health = [
    ["Temperature", "Healthy", "98%"],
    ["Relative Humidity", "Healthy", "96%"],
    ["Pressure", "Healthy", "99%"],
    ["Communication", "Healthy", "100%"],
  ];

  return (
    <>
      <PageHeader
        eyebrow="SENSOR QUALITY"
        title="Sensor health."
        description="Monitor the quality and availability of the observation layer."
      />

      <div className="health-grid">
        {health.map(([name, status, value]) => (
          <div className="health-card" key={name}>
            <div className="health-icon">
              <ShieldCheck size={20} />
            </div>
            <span>{name}</span>
            <strong>{value}</strong>
            <div className="health-status">
              <span />
              {status}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function MLEnginePage({ backendConnected }) {
  return (
    <>
      <PageHeader
        eyebrow="MACHINE LEARNING"
        title="ML engine."
        description="The intelligence layer used by VYONIKSH to assess AWS observations."
      />

      <div className="engine-card">
        <div className="engine-icon">
          <Zap size={30} />
        </div>

        <div>
          <span className="eyebrow">ACTIVE MODEL</span>
          <h2>Isolation Forest</h2>
          <p>
            The prototype evaluates multivariate weather observations and
            identifies patterns that differ from learned normal observations.
          </p>
        </div>

        <div className={`engine-status ${backendConnected ? "online" : ""}`}>
          <span />
          {backendConnected ? "ONLINE" : "OFFLINE"}
        </div>
      </div>
    </>
  );
}

function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="SYSTEM CONFIGURATION"
        title="Settings."
        description="Prototype configuration and monitoring preferences."
      />

      <div className="settings-card">
        <div className="setting-row">
          <div>
            <strong>Observation monitoring</strong>
            <span>Continuously evaluate incoming AWS observations.</span>
          </div>
          <div className="toggle active-toggle">
            <span />
          </div>
        </div>

        <div className="setting-row">
          <div>
            <strong>ML anomaly detection</strong>
            <span>Enable Isolation Forest classification.</span>
          </div>
          <div className="toggle active-toggle">
            <span />
          </div>
        </div>

        <div className="setting-row">
          <div>
            <strong>Prototype mode</strong>
            <span>Current readings are demonstration values.</span>
          </div>
          <div className="toggle">
            <span />
          </div>
        </div>
      </div>
    </>
  );
}

export default App;