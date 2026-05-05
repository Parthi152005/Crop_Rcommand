import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  getPredictionHistory,
  predictSoilFromImage,
  predictSoilManual
} from "./api";

const MAX_VALUES = { N: 500, P: 150, K: 600, pH: 14 };

function GaugeBar({ label, value, status, max }) {
  const width = Math.max(0, Math.min(100, (Number(value) / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}: {value}</span>
        <span className="text-emerald-100/80">{status}</span>
      </div>
      <div className="h-2 rounded bg-emerald-900/70">
        <div className="h-2 rounded bg-lime-500" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default function SoilHealthPanel() {
  const [soilImage, setSoilImage] = useState(null);
  const [manualForm, setManualForm] = useState({
    soil_type: "",
    crop: "",
    region: "",
    condition: ""
  });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  const runImagePrediction = async () => {
    if (!soilImage) return setError("Please upload soil image first.");
    setLoading("image");
    setError("");
    try {
      const data = await predictSoilFromImage(soilImage);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading("");
    }
  };

  const runManualPrediction = async (e) => {
    e.preventDefault();
    setLoading("manual");
    setError("");
    try {
      const data = await predictSoilManual(manualForm);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading("");
    }
  };

  const loadHistory = async () => {
    setLoading("history");
    setError("");
    try {
      const data = await getPredictionHistory();
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading("");
    }
  };

  return (
    <section className="rounded-2xl border border-emerald-400/30 bg-emerald-950/45 p-6 shadow-[0_14px_45px_rgba(16,185,129,0.18)] backdrop-blur-lg space-y-4">
      <h2 className="text-xl font-semibold">Soil NPK + pH Analyzer</h2>
      {error && <p className="text-sm text-red-300">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-lg border border-emerald-500/20 bg-emerald-950/55 p-4">
          <p className="text-sm text-emerald-100/80">Upload soil image (CNN prediction)</p>
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-lg border border-emerald-500/25 bg-emerald-950/60 p-2"
            onChange={(e) => setSoilImage(e.target.files?.[0] || null)}
          />
          <button
            className="w-full rounded-lg bg-lime-600 p-2 text-emerald-950 hover:bg-lime-500 disabled:opacity-60"
            onClick={runImagePrediction}
            disabled={loading === "image"}
          >
            {loading === "image" ? <Loader2 className="mx-auto animate-spin" size={18} /> : "Predict from Image"}
          </button>
        </div>

        <form className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-950/55 p-4" onSubmit={runManualPrediction}>
          <p className="text-sm text-emerald-100/80">Manual fallback prediction</p>
          <input className="w-full rounded border border-emerald-500/25 bg-emerald-950/60 p-2" placeholder="Soil type" value={manualForm.soil_type} onChange={(e) => setManualForm((p) => ({ ...p, soil_type: e.target.value }))} required />
          <input className="w-full rounded border border-emerald-500/25 bg-emerald-950/60 p-2" placeholder="Crop" value={manualForm.crop} onChange={(e) => setManualForm((p) => ({ ...p, crop: e.target.value }))} required />
          <input className="w-full rounded border border-emerald-500/25 bg-emerald-950/60 p-2" placeholder="Region" value={manualForm.region} onChange={(e) => setManualForm((p) => ({ ...p, region: e.target.value }))} required />
          <input className="w-full rounded border border-emerald-500/25 bg-emerald-950/60 p-2" placeholder="Condition" value={manualForm.condition} onChange={(e) => setManualForm((p) => ({ ...p, condition: e.target.value }))} required />
          <button type="submit" className="w-full rounded-lg bg-lime-600 p-2 text-emerald-950 hover:bg-lime-500 disabled:opacity-60" disabled={loading === "manual"}>
            {loading === "manual" ? <Loader2 className="mx-auto animate-spin" size={18} /> : "Predict Manually"}
          </button>
        </form>
      </div>

      {result && (
        <div className="space-y-3 rounded-lg border border-emerald-500/20 bg-emerald-950/55 p-4">
          <GaugeBar label="Nitrogen (N)" value={result.N} status={result.N_status} max={MAX_VALUES.N} />
          <GaugeBar label="Phosphorus (P)" value={result.P} status={result.P_status} max={MAX_VALUES.P} />
          <GaugeBar label="Potassium (K)" value={result.K} status={result.K_status} max={MAX_VALUES.K} />
          <GaugeBar label="pH" value={result.pH} status={result.pH_status} max={MAX_VALUES.pH} />
          <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-sm">
            <strong>Fertilizer Recommendation:</strong> {result.recommendation}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button className="rounded-lg bg-emerald-700 px-4 py-2 hover:bg-emerald-600 disabled:opacity-60" onClick={loadHistory} disabled={loading === "history"}>
          {loading === "history" ? "Loading..." : "Load Prediction History"}
        </button>
        {history.length > 0 && (
          <div className="max-h-48 overflow-auto rounded-lg border border-emerald-500/20 bg-emerald-950/55 p-3 text-sm space-y-2">
            {history.map((item) => (
              <div key={item.id} className="border-b border-emerald-500/25 pb-1">
                #{item.id} [{item.source}] N:{item.N} P:{item.P} K:{item.K} pH:{item.pH}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
