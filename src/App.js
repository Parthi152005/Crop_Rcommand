import { useEffect, useMemo, useRef, useState } from "react";
import jsPDF from "jspdf";
import {
  FileDown,
  Leaf,
  Loader2,
  Sprout,
  TestTube2,
  TriangleAlert
} from "lucide-react";
import {
  detectDisease,
  getFertilizerPlan,
  predictSoilFromImage,
  validateSoilImage
} from "./api";

const initialSoilForm = {
  imageBase64: "",
  npkN: "",
  npkP: "",
  npkK: "",
  ph: "",
  weatherTemp: "",
  weatherHumidity: "",
  weatherRainfall: ""
};

const initialLeafForm = {
  imageBase64: ""
};

const translations = {
  en: {
    appTitle: "Smart Agriculture AI",
    appSubtitle: "Crop recommendation, leaf disease detection, fertilizer planning, and PDF reporting.",
    language: "Language",
    cropRecommendation: "Crop Recommendation",
    leafDetection: "Leaf Disease Detection",
    nitrogen: "Nitrogen (N)",
    phosphorus: "Phosphorus (P)",
    potassium: "Potassium (K)",
    temperature: "Temperature (C)",
    humidity: "Humidity (%)",
    rainfall: "Rainfall (mm)",
    captureSoil: "Capture clear soil image",
    captureLeaf: "Capture clear leaf image",
    openLandCamera: "Open Camera (Land Image)",
    openLeafCamera: "Open Camera (Leaf Image)",
    detectLeafDisease: "Detect Leaf Disease",
    getCropSuggestions: "Get Crop Suggestions",
    retake: "Retake",
    recommendationResults: "Recommendation Results",
    topCrops: "Top Crops",
    topCropPlan: "Top Crop Plan",
    generateFertilizer: "Generate Fertilizer Plan",
    exportPdf: "Export PDF",
    fertilizerTop3: "Fertilizer Plans (Top 3 Crops)",
    crop: "Crop",
    fertilizerName: "Fertilizer Name",
    quantity: "Quantity",
    disease: "Disease",
    confidence: "Confidence",
    treatment: "Treatment",
    timePeriodInstructions: "Crop Farming Time Period Instructions",
    unknownSoil: "Unknown image uploaded, please upload soil image.",
    unknownLeaf: "Unknown image uploaded, please upload leaf image.",
    locationRequired: "Location access required",
    weatherFail: "Unable to fetch weather data",
    analyzeSoil: "Analyzing soil image for N, P, K, pH..."
  },
  ta: {
    appTitle: "சிறந்த வேளாண்மை AI",
    appSubtitle: "பயிர் பரிந்துரை, இலை நோய் கண்டறிதல், உர திட்டம் மற்றும் PDF அறிக்கை.",
    language: "மொழி",
    cropRecommendation: "பயிர் பரிந்துரை",
    leafDetection: "இலை நோய் கண்டறிதல்",
    nitrogen: "நைட்ரஜன் (N)",
    phosphorus: "பாஸ்பரஸ் (P)",
    potassium: "பொட்டாசியம் (K)",
    temperature: "வெப்பநிலை (C)",
    humidity: "ஈரப்பதம் (%)",
    rainfall: "மழை (mm)",
    captureSoil: "தெளிவான மண் படத்தை எடுக்கவும்",
    captureLeaf: "தெளிவான இலை படத்தை எடுக்கவும்",
    openLandCamera: "கேமரா திற (மண் படம்)",
    openLeafCamera: "கேமரா திற (இலை படம்)",
    detectLeafDisease: "இலை நோய் கண்டறி",
    getCropSuggestions: "பயிர் பரிந்துரைகள் பெற",
    retake: "மீண்டும் எடு",
    recommendationResults: "பரிந்துரை முடிவுகள்",
    topCrops: "சிறந்த பயிர்கள்",
    topCropPlan: "சிறந்த பயிர் திட்டம்",
    generateFertilizer: "உர திட்டம் உருவாக்கு",
    exportPdf: "PDF ஏற்றுமதி",
    fertilizerTop3: "உர திட்டங்கள் (முதல் 3 பயிர்கள்)",
    crop: "பயிர்",
    fertilizerName: "உரத்தின் பெயர்",
    quantity: "அளவு",
    disease: "நோய்",
    confidence: "நம்பிக்கை",
    treatment: "சிகிச்சை",
    timePeriodInstructions: "பயிர் கால கட்ட வழிமுறைகள்",
    unknownSoil: "அறியப்படாத படம் பதிவேற்றப்பட்டது, தயவு செய்து மண் படம் பதிவேற்றவும்.",
    unknownLeaf: "அறியப்படாத படம் பதிவேற்றப்பட்டது, தயவு செய்து இலை படம் பதிவேற்றவும்.",
    locationRequired: "இருப்பிட அனுமதி தேவை",
    weatherFail: "வானிலை தரவை பெற முடியவில்லை",
    analyzeSoil: "மண் படத்திலிருந்து N, P, K, pH பகுப்பாய்வு செய்கிறது..."
  },
  hi: {
    appTitle: "स्मार्ट एग्रीकल्चर AI",
    appSubtitle: "फसल सुझाव, पत्ती रोग पहचान, उर्वरक योजना और PDF रिपोर्ट।",
    language: "भाषा",
    cropRecommendation: "फसल सुझाव",
    leafDetection: "पत्ती रोग पहचान",
    nitrogen: "नाइट्रोजन (N)",
    phosphorus: "फॉस्फोरस (P)",
    potassium: "पोटैशियम (K)",
    temperature: "तापमान (C)",
    humidity: "आर्द्रता (%)",
    rainfall: "वर्षा (mm)",
    captureSoil: "स्पष्ट मिट्टी की तस्वीर लें",
    captureLeaf: "स्पष्ट पत्ती की तस्वीर लें",
    openLandCamera: "कैमरा खोलें (मिट्टी चित्र)",
    openLeafCamera: "कैमरा खोलें (पत्ती चित्र)",
    detectLeafDisease: "पत्ती रोग पहचानें",
    getCropSuggestions: "फसल सुझाव प्राप्त करें",
    retake: "फिर से लें",
    recommendationResults: "सुझाव परिणाम",
    topCrops: "शीर्ष फसलें",
    topCropPlan: "शीर्ष फसल योजना",
    generateFertilizer: "उर्वरक योजना बनाएं",
    exportPdf: "PDF निर्यात",
    fertilizerTop3: "उर्वरक योजनाएं (शीर्ष 3 फसलें)",
    crop: "फसल",
    fertilizerName: "उर्वरक का नाम",
    quantity: "मात्रा",
    disease: "रोग",
    confidence: "विश्वास",
    treatment: "उपचार",
    timePeriodInstructions: "फसल समयावधि निर्देश",
    unknownSoil: "अज्ञात छवि अपलोड की गई, कृपया मिट्टी की छवि अपलोड करें।",
    unknownLeaf: "अज्ञात छवि अपलोड की गई, कृपया पत्ती की छवि अपलोड करें।",
    locationRequired: "स्थान अनुमति आवश्यक है",
    weatherFail: "मौसम डेटा प्राप्त नहीं हो सका",
    analyzeSoil: "मिट्टी की छवि से N, P, K, pH विश्लेषण हो रहा है..."
  }
};

function App() {
  const [soilForm, setSoilForm] = useState(initialSoilForm);
  const [leafForm, setLeafForm] = useState(initialLeafForm);
  const [cropResult, setCropResult] = useState(null);
  const [leafResult, setLeafResult] = useState(null);
  const [fertilizerResult, setFertilizerResult] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [error, setError] = useState("");
  const [loadingKey, setLoadingKey] = useState("");
  const [weatherStatus, setWeatherStatus] = useState("");
  const [landCameraOpen, setLandCameraOpen] = useState(false);
  const [leafCameraOpen, setLeafCameraOpen] = useState(false);
  const [landCameraStatus, setLandCameraStatus] = useState("");
  const [leafCameraStatus, setLeafCameraStatus] = useState("");
  const [language, setLanguage] = useState("en");

  const landVideoRef = useRef(null);
  const leafVideoRef = useRef(null);
  const landCanvasRef = useRef(null);
  const leafCanvasRef = useRef(null);
  const landStreamRef = useRef(null);
  const leafStreamRef = useRef(null);

  const topCrop = useMemo(() => {
    if (!cropResult?.recommendations?.length) return "";
    return selectedCrop || cropResult.recommendations[0].crop;
  }, [cropResult, selectedCrop]);
  const activePlan = useMemo(() => {
    if (!cropResult) return null;
    return cropResult.cropPlans?.[topCrop] || cropResult.topCropPlan || null;
  }, [cropResult, topCrop]);
  const t = translations[language];

  const LabeledValue = ({ label, value }) => (
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/45 p-2 text-sm flex items-center justify-between">
      <span className="text-emerald-100/80">{label}</span>
      <span className="font-medium">{value || "-"}</span>
    </div>
  );

  const makeTopCropPlan = (cropName) => {
    const cropRules = {
      Rice: { harvestDays: "110-130", irrigation: "Maintain 2-5 cm standing water after establishment." },
      Wheat: { harvestDays: "105-125", irrigation: "Irrigate at crown root initiation, tillering, flowering, grain fill." },
      Maize: { harvestDays: "95-115", irrigation: "Irrigate at knee-high, tasseling, silking, and grain filling stages." },
      Cotton: { harvestDays: "150-180", irrigation: "Light but regular irrigation; avoid waterlogging at flowering." },
      Groundnut: { harvestDays: "100-120", irrigation: "Irrigate at flowering, pegging, and pod development stages." }
    };
    const rule = cropRules[cropName] || {
      harvestDays: "95-120",
      irrigation: "Irrigate according to soil moisture and weather."
    };

    return {
      landPreparation: `Deep plough and add well-decomposed FYM/compost before sowing ${cropName}.`,
      irrigationPlan: rule.irrigation,
      diseasePrediction: "Scout field every 5-7 days; apply control at early symptom stage.",
      harvestTimeline: `Estimated harvest in ${rule.harvestDays} days.`,
      timePeriods: [
        { stage: "Pre-sowing (Day -10 to 0)", action: "Plough 2-3 times, remove weeds, apply FYM/compost, prepare beds." },
        { stage: "Sowing/Transplanting (Day 0)", action: "Use quality seeds/seedlings, maintain spacing, apply basal fertilizer." },
        { stage: "Early vegetative (Day 10-20)", action: "Gap filling, first weeding, first top dressing, light irrigation." },
        { stage: "Active growth (Day 20-40)", action: "Second weeding, top dressing, monitor pests and nutrient deficiency." },
        { stage: "Flowering/Reproductive", action: "Critical irrigation, potassium support, protect from pests/diseases." },
        { stage: "Maturity & Harvest", action: "Reduce irrigation near maturity, harvest at physiological maturity, dry and store properly." }
      ]
    };
  };

  const inferSoilName = (n, p, k, ph) => {
    if (ph < 6) return "Acidic Loamy Soil";
    if (ph > 7.5) return "Alkaline Clay Soil";
    if (k > n && k > p) return "Potash-Rich Loam";
    if (n > p && n > k) return "Nitrogen-Rich Alluvial Soil";
    return "Balanced Loamy Soil";
  };

  const generateCropRecommendations = ({ n, p, k, ph, temp, humidity, rainfall }) => {
    const cropProfiles = [
      { crop: "Rice", n: 280, p: 60, k: 260, phMin: 5.5, phMax: 7.5, temp: 30, humidity: 78, rainfall: 6 },
      { crop: "Wheat", n: 220, p: 50, k: 230, phMin: 6.0, phMax: 7.8, temp: 23, humidity: 60, rainfall: 2 },
      { crop: "Maize", n: 240, p: 45, k: 210, phMin: 5.8, phMax: 7.5, temp: 27, humidity: 65, rainfall: 3 },
      { crop: "Cotton", n: 200, p: 40, k: 300, phMin: 6.0, phMax: 8.0, temp: 30, humidity: 58, rainfall: 2 },
      { crop: "Groundnut", n: 180, p: 55, k: 220, phMin: 6.0, phMax: 7.5, temp: 28, humidity: 62, rainfall: 2.5 }
    ];

    const scored = cropProfiles.map((profile) => {
      const npkDiff = Math.abs(n - profile.n) + Math.abs(p - profile.p) + Math.abs(k - profile.k);
      const weatherDiff =
        Math.abs(temp - profile.temp) +
        Math.abs(humidity - profile.humidity) / 4 +
        Math.abs(rainfall - profile.rainfall) * 4;
      const phPenalty = ph < profile.phMin || ph > profile.phMax ? 35 : 0;
      const score = Math.max(1, 100 - (npkDiff / 20 + weatherDiff + phPenalty));
      return { crop: profile.crop, score };
    });

    const total = scored.reduce((acc, item) => acc + item.score, 0) || 1;
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => ({
        crop: item.crop,
        probability: Number(((item.score / total) * 100).toFixed(2))
      }));
  };

  const dataUrlToFile = async (dataUrl, filename) => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type || "image/jpeg" });
  };

  const fetchNpkPhFromImage = async (source) => {
    setLoadingKey("soil-analyze");
    setError("");
    try {
      const file =
        source instanceof File ? source : await dataUrlToFile(source, "captured-soil.jpg");
      const validation = await validateSoilImage(file);
      if (!validation?.isSoil) {
        setSoilForm((prev) => ({
          ...prev,
          npkN: "",
          npkP: "",
          npkK: "",
          ph: ""
        }));
        setCropResult(null);
        throw new Error(t.unknownSoil);
      }
      const result = await predictSoilFromImage(file);
      setSoilForm((prev) => ({
        ...prev,
        npkN: String(result.N ?? ""),
        npkP: String(result.P ?? ""),
        npkK: String(result.K ?? ""),
        ph: String(result.pH ?? "")
      }));
    } catch (err) {
      setError(err.message || t.unknownSoil);
    } finally {
      setLoadingKey("");
    }
  };

  const stopCameraStream = (target) => {
    const streamRef = target === "soil" ? landStreamRef : leafStreamRef;
    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const openCamera = async (target) => {
    const setStatus = target === "soil" ? setLandCameraStatus : setLeafCameraStatus;
    const videoRef = target === "soil" ? landVideoRef : leafVideoRef;
    const streamRef = target === "soil" ? landStreamRef : leafStreamRef;
    const setOpen = target === "soil" ? setLandCameraOpen : setLeafCameraOpen;

    try {
      setStatus("Requesting camera access...");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus("Camera not available, please upload image");
        return;
      }

      if (navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some((device) => device.kind === "videoinput");
        if (!hasCamera) {
          setStatus("No camera device found");
          return;
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stopCameraStream(target);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setOpen(true);
      setStatus("");
    } catch (cameraError) {
      if (cameraError?.name === "NotAllowedError") {
        setStatus("Camera access denied");
      } else if (cameraError?.name === "NotFoundError") {
        setStatus("No camera device found");
      } else {
        setStatus("Camera not available, please upload image");
      }
    }
  };

  const captureFromCamera = async (target) => {
    const videoRef = target === "soil" ? landVideoRef : leafVideoRef;
    const canvasRef = target === "soil" ? landCanvasRef : leafCanvasRef;
    const setStatus = target === "soil" ? setLandCameraStatus : setLeafCameraStatus;
    const setOpen = target === "soil" ? setLandCameraOpen : setLeafCameraOpen;
    const setImage = target === "soil" ? setSoilForm : setLeafForm;

    if (!videoRef.current || !canvasRef.current) return;

    setLoadingKey(target === "soil" ? "capture-soil" : "capture-leaf");
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const context = canvas.getContext("2d");
    if (!context) {
      setStatus("Camera not available, please upload image");
      setLoadingKey("");
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/jpeg", 0.92);

    if (target === "soil") {
      setImage((prev) => ({ ...prev, imageBase64: base64 }));
      fetchWeatherByLocation();
      await fetchNpkPhFromImage(base64);
    } else {
      setImage((prev) => ({ ...prev, imageBase64: base64 }));
    }

    stopCameraStream(target);
    setOpen(false);
    setStatus("Image captured successfully.");
    setLoadingKey("");
  };

  const retakeImage = (target) => {
    if (target === "soil") {
      setSoilForm((prev) => ({ ...prev, imageBase64: "" }));
      setLandCameraStatus("");
    } else {
      setLeafForm((prev) => ({ ...prev, imageBase64: "" }));
      setLeafCameraStatus("");
    }
    openCamera(target);
  };

  const fetchWeatherByLocation = () => {
    if (!navigator.geolocation) {
      setError(t.locationRequired);
      return;
    }

    setWeatherStatus("Fetching location...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setWeatherStatus("Fetching weather data...");
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation`
          );
          if (!response.ok) {
            throw new Error("weather fetch failed");
          }
          const weatherData = await response.json();
          const current = weatherData.current || {};
          setSoilForm((prev) => ({
            ...prev,
            weatherTemp: String(current.temperature_2m ?? ""),
            weatherHumidity: String(current.relative_humidity_2m ?? ""),
            weatherRainfall: String(current.precipitation ?? "")
          }));
          setWeatherStatus("");
        } catch (err) {
          setWeatherStatus("");
          setError(t.weatherFail);
        }
      },
      () => {
        setWeatherStatus("");
        setError(t.locationRequired);
      }
    );
  };

  useEffect(() => {
    fetchWeatherByLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      stopCameraStream("soil");
      stopCameraStream("leaf");
    };
  }, []);

  const onImageUpload = async (file, target) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      if (target === "soil") {
        setSoilForm((prev) => ({ ...prev, imageBase64: base64 }));
        fetchWeatherByLocation();
        fetchNpkPhFromImage(file);
      }
      if (target === "leaf") setLeafForm((prev) => ({ ...prev, imageBase64: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const runCropRecommendation = async (e) => {
    e.preventDefault();
    setError("");
    setLoadingKey("crop");
    setCropResult(null);
    try {
      if (!soilForm.imageBase64) {
        throw new Error("Please upload soil image.");
      }
      if (
        !soilForm.npkN ||
        !soilForm.npkP ||
        !soilForm.npkK ||
        !soilForm.ph ||
        !soilForm.weatherTemp ||
        !soilForm.weatherHumidity ||
        !soilForm.weatherRainfall
      ) {
        throw new Error("Soil metrics or weather data are not ready yet.");
      }
      const recommendations = generateCropRecommendations({
        n: Number(soilForm.npkN),
        p: Number(soilForm.npkP),
        k: Number(soilForm.npkK),
        ph: Number(soilForm.ph),
        temp: Number(soilForm.weatherTemp),
        humidity: Number(soilForm.weatherHumidity),
        rainfall: Number(soilForm.weatherRainfall)
      });
      const detectedSoilName = inferSoilName(
        Number(soilForm.npkN),
        Number(soilForm.npkP),
        Number(soilForm.npkK),
        Number(soilForm.ph)
      );
      const cropPlans = recommendations.reduce((acc, rec) => {
        acc[rec.crop] = {
          ...makeTopCropPlan(rec.crop),
          soilName: detectedSoilName
        };
        return acc;
      }, {});
      setCropResult({
        recommendations,
        topCropPlan: cropPlans[recommendations[0]?.crop] || makeTopCropPlan("Crop"),
        cropPlans,
        soilName: detectedSoilName
      });
      setSelectedCrop(recommendations?.[0]?.crop || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingKey("");
    }
  };

  const runLeafDetection = async (e) => {
    e.preventDefault();
    setError("");
    setLoadingKey("leaf");
    setLeafResult(null);
    try {
      const data = await detectDisease(leafForm);
      setLeafResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingKey("");
    }
  };

  const runFertilizerPlan = async () => {
    if (!cropResult?.recommendations?.length) return setError("Get crop recommendations first.");
    setError("");
    setLoadingKey("fertilizer");
    try {
      const plans = await Promise.all(
        cropResult.recommendations.slice(0, 3).map(async (item) => {
          const data = await getFertilizerPlan({
            crop: item.crop,
            npkN: Number(soilForm.npkN),
            npkP: Number(soilForm.npkP),
            npkK: Number(soilForm.npkK),
            ph: Number(soilForm.ph)
          });
          return { crop: item.crop, ...data };
        })
      );
      setFertilizerResult(plans);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingKey("");
    }
  };

  const generatePdf = () => {
    if (!cropResult) return setError("Run crop recommendation before exporting PDF.");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Smart Agriculture AI Report", 14, 15);
    doc.setFontSize(11);
    doc.text(`Detected Soil Name: ${cropResult.soilName || "-"}`, 14, 25);
    doc.text("Top 3 Crop Recommendations:", 14, 35);
    let y = 42;

    cropResult.recommendations.forEach((item, index) => {
      const plan = cropResult.cropPlans?.[item.crop] || {};
      doc.text(`${index + 1}. ${item.crop} - ${item.probability}%`, 18, y);
      y += 6;
      doc.text(`   Soil: ${plan.soilName || cropResult.soilName || "-"}`, 20, y);
      y += 6;
      doc.text(`   Harvest Time: ${plan.harvestTimeline || "-"}`, 20, y);
      y += 8;
    });

    doc.text("Top 3 Fertilizer Plans:", 14, y);
    y += 7;
    if (fertilizerResult?.length) {
      fertilizerResult.forEach((plan) => {
        doc.text(`- ${plan.crop}: ${plan.type}`, 18, y);
        y += 6;
        doc.text(`  Quantity: ${plan.quantity}`, 20, y);
        y += 6;
        plan.schedule.forEach((sch) => {
          doc.text(`  ${sch.day}: ${sch.action}`, 20, y);
          y += 6;
        });
        y += 2;
      });
    } else {
      doc.text("- Generate fertilizer plan to include this section.", 18, y);
    }

    doc.save("smart-agri-report.pdf");
  };

  return (
    <div className="min-h-screen p-6 md:p-10 text-emerald-50">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-emerald-400/30 bg-emerald-950/45 p-6 shadow-[0_14px_50px_rgba(16,185,129,0.2)] backdrop-blur-lg">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold">{t.appTitle}</h1>
            <div className="flex items-center gap-2 text-sm">
              <span>{t.language}</span>
              <select
                className="rounded border border-emerald-500/40 bg-emerald-900/70 px-2 py-1 text-emerald-50"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="en">English</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>
          <p className="mt-2 text-emerald-100/80">
            {t.appSubtitle}
          </p>
        </header>

        {error && (
          <div className="rounded-xl border border-red-400/40 bg-red-500/20 p-3 text-red-100 flex items-center gap-2">
            <TriangleAlert size={16} />
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-emerald-400/30 bg-emerald-950/45 p-6 shadow-[0_14px_45px_rgba(16,185,129,0.18)] backdrop-blur-lg">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Sprout size={20} /> {t.cropRecommendation}
            </h2>
            <form className="mt-4 space-y-3" onSubmit={runCropRecommendation}>
              <LabeledValue label={t.nitrogen} value={soilForm.npkN} />
              <LabeledValue label={t.phosphorus} value={soilForm.npkP} />
              <LabeledValue label={t.potassium} value={soilForm.npkK} />
              <LabeledValue label="pH" value={soilForm.ph} />
              <LabeledValue label={t.temperature} value={soilForm.weatherTemp} />
              <LabeledValue label={t.humidity} value={soilForm.weatherHumidity} />
              <LabeledValue label={t.rainfall} value={soilForm.weatherRainfall} />
              {weatherStatus && <p className="text-sm text-emerald-100/80">{weatherStatus}</p>}
              {loadingKey === "soil-analyze" && <p className="text-sm text-emerald-100/80">{t.analyzeSoil}</p>}
              <p className="text-sm text-emerald-100/80">{t.captureSoil}</p>
              <button
                type="button"
                className="w-full rounded-lg bg-emerald-700 p-2 hover:bg-emerald-600"
                onClick={() => openCamera("soil")}
              >
                {t.openLandCamera}
              </button>
              {landCameraStatus && <p className="text-sm text-emerald-100/80">{landCameraStatus}</p>}
              {landCameraOpen && (
                <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-950/60 p-3">
                  <video ref={landVideoRef} className="w-full rounded-lg" autoPlay playsInline muted />
                  <canvas ref={landCanvasRef} className="hidden" />
                  <button
                    type="button"
                    className="w-full rounded-lg bg-green-700 p-2 hover:bg-green-600 disabled:opacity-60"
                    onClick={() => captureFromCamera("soil")}
                    disabled={loadingKey === "capture-soil"}
                  >
                    {loadingKey === "capture-soil" ? "Capturing..." : "Capture"}
                  </button>
                </div>
              )}
              {soilForm.imageBase64 && (
                <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-950/60 p-3">
                  <img src={soilForm.imageBase64} alt="Captured soil" className="w-full rounded-lg object-cover max-h-56" />
                  <button type="button" className="w-full rounded-lg bg-emerald-800 p-2 hover:bg-emerald-700" onClick={() => retakeImage("soil")}>
                    {t.retake}
                  </button>
                </div>
              )}
              <input type="file" accept="image/*" className="w-full rounded-lg border border-emerald-500/25 bg-emerald-950/60 p-2" onChange={(e) => onImageUpload(e.target.files[0], "soil")} required={!soilForm.imageBase64} />
              <button type="submit" className="w-full rounded-lg bg-lime-600 p-2 font-medium text-emerald-950 hover:bg-lime-500 disabled:opacity-60" disabled={loadingKey === "crop" || Boolean(weatherStatus)}>
                {loadingKey === "crop" ? <Loader2 className="mx-auto animate-spin" size={18} /> : t.getCropSuggestions}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-emerald-400/30 bg-emerald-950/45 p-6 shadow-[0_14px_45px_rgba(16,185,129,0.18)] backdrop-blur-lg">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Leaf size={20} /> {t.leafDetection}
            </h2>
            <form className="mt-4 space-y-3" onSubmit={runLeafDetection}>
              <p className="text-sm text-emerald-100/80">{t.captureLeaf}</p>
              <button
                type="button"
                className="w-full rounded-lg bg-emerald-700 p-2 hover:bg-emerald-600"
                onClick={() => openCamera("leaf")}
              >
                {t.openLeafCamera}
              </button>
              {leafCameraStatus && <p className="text-sm text-emerald-100/80">{leafCameraStatus}</p>}
              {leafCameraOpen && (
                <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-950/60 p-3">
                  <video ref={leafVideoRef} className="w-full rounded-lg" autoPlay playsInline muted />
                  <canvas ref={leafCanvasRef} className="hidden" />
                  <button
                    type="button"
                    className="w-full rounded-lg bg-green-700 p-2 hover:bg-green-600 disabled:opacity-60"
                    onClick={() => captureFromCamera("leaf")}
                    disabled={loadingKey === "capture-leaf"}
                  >
                    {loadingKey === "capture-leaf" ? "Capturing..." : "Capture"}
                  </button>
                </div>
              )}
              {leafForm.imageBase64 && (
                <div className="space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-950/60 p-3">
                  <img src={leafForm.imageBase64} alt="Captured leaf" className="w-full rounded-lg object-cover max-h-56" />
                  <button type="button" className="w-full rounded-lg bg-emerald-800 p-2 hover:bg-emerald-700" onClick={() => retakeImage("leaf")}>
                    {t.retake}
                  </button>
                </div>
              )}
              <input type="file" accept="image/*" className="w-full rounded-lg border border-emerald-500/25 bg-emerald-950/60 p-2" onChange={(e) => onImageUpload(e.target.files[0], "leaf")} required={!leafForm.imageBase64} />
              <button type="submit" className="w-full rounded-lg bg-lime-600 p-2 font-medium text-emerald-950 hover:bg-lime-500 disabled:opacity-60" disabled={loadingKey === "leaf"}>
                {loadingKey === "leaf" ? <Loader2 className="mx-auto animate-spin" size={18} /> : t.detectLeafDisease}
              </button>
            </form>
            {leafResult && (
              <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-950/60 p-3 text-sm">
                <p><strong>{t.disease}:</strong> {leafResult.disease}</p>
                <p><strong>{t.confidence}:</strong> {leafResult.confidence}%</p>
                <p><strong>{t.treatment}:</strong> {leafResult.treatment}</p>
              </div>
            )}
          </section>
        </div>

        {cropResult && (
          <section className="rounded-2xl border border-emerald-400/30 bg-emerald-950/45 p-6 shadow-[0_14px_45px_rgba(16,185,129,0.18)] backdrop-blur-lg space-y-4">
            <h2 className="text-xl font-semibold">{t.recommendationResults}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/60 p-4">
                <h3 className="font-semibold">{t.topCrops}</h3>
                <div className="mt-2 space-y-2">
                  {cropResult.recommendations.map((item) => (
                    <button key={item.crop} className={`w-full rounded-lg p-2 text-left ${topCrop === item.crop ? "bg-lime-600/70 text-emerald-950" : "bg-emerald-900/70 text-emerald-50"}`} onClick={() => setSelectedCrop(item.crop)}>
                      {item.crop} ({item.probability}%)
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/60 p-4">
                <h3 className="font-semibold">{t.topCropPlan}: {topCrop}</h3>
                <p className="text-sm mt-2"><strong>Soil Name:</strong> {activePlan?.soilName || cropResult.soilName || "-"}</p>
                <ul className="mt-2 text-sm space-y-1">
                  <li><strong>Land:</strong> {activePlan?.landPreparation}</li>
                  <li><strong>Irrigation:</strong> {activePlan?.irrigationPlan}</li>
                  <li><strong>Disease:</strong> {activePlan?.diseasePrediction}</li>
                  <li><strong>Harvest:</strong> {activePlan?.harvestTimeline}</li>
                </ul>
                <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-900/55 p-3">
                  <h4 className="font-medium text-sm mb-2">{t.timePeriodInstructions}</h4>
                  <ul className="text-xs space-y-1">
                    {(activePlan?.timePeriods || []).map((item) => (
                      <li key={item.stage}>
                        <strong>{item.stage}:</strong> {item.action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="rounded-lg bg-emerald-600 px-4 py-2 hover:bg-emerald-500 flex items-center gap-2 disabled:opacity-60" onClick={runFertilizerPlan} disabled={loadingKey === "fertilizer"}>
                {loadingKey === "fertilizer" ? <Loader2 className="animate-spin" size={16} /> : <TestTube2 size={16} />}
                {t.generateFertilizer}
              </button>
              <button className="rounded-lg bg-green-700 px-4 py-2 hover:bg-green-600 flex items-center gap-2" onClick={generatePdf}>
                <FileDown size={16} /> {t.exportPdf}
              </button>
            </div>

            {fertilizerResult?.length > 0 && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/60 p-4">
                <h3 className="font-semibold">{t.fertilizerTop3}</h3>
                <div className="mt-2 space-y-3">
                  {fertilizerResult.map((plan) => (
                    <div key={plan.crop} className="rounded-lg border border-emerald-500/15 bg-emerald-900/55 p-3">
                      <p className="text-sm"><strong>{t.crop}:</strong> {plan.crop}</p>
                      <p className="text-sm"><strong>{t.fertilizerName}:</strong> {plan.type}</p>
                      <p className="text-sm"><strong>{t.quantity}:</strong> {plan.quantity}</p>
                      <ul className="text-sm mt-2 space-y-1">
                        {plan.schedule.map((item) => (
                          <li key={`${plan.crop}-${item.day}`}>
                            <strong>{item.day}:</strong> {item.action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
