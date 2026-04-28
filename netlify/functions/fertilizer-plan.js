const jsonHeaders = { "Content-Type": "application/json" };

function response(statusCode, body) {
  return { statusCode, headers: jsonHeaders, body: JSON.stringify(body) };
}

function calculateFertilizerType(crop, ph) {
  if (ph < 6) return `${crop} Acidic Soil Blend (NPK 12-32-16)`;
  if (ph > 7.5) return `${crop} Alkaline Correction Blend (NPK 10-26-26 + Sulphur)`;
  return `${crop} Balanced Growth Blend (NPK 20-20-20)`;
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") return response(405, { error: "Method not allowed" });
    const body = JSON.parse(event.body || "{}");
    const { crop, npkN = 0, npkP = 0, npkK = 0, ph = 7 } = body;
    if (!crop) return response(400, { error: "Crop is required." });

    const deficiency = Math.max(0, 180 - (Number(npkN) + Number(npkP) + Number(npkK)));
    const quantity = `${(deficiency / 3 + 40).toFixed(1)} kg/acre`;

    return response(200, {
      type: calculateFertilizerType(crop, Number(ph)),
      quantity,
      schedule: [
        { day: "Day 0", action: "Apply 35% basal dose during sowing." },
        { day: "Day 20", action: "Apply 25% top dressing with light irrigation." },
        { day: "Day 40", action: "Apply 25% booster with micronutrients." },
        { day: "Flowering", action: "Apply 15% potassium-rich foliar spray." }
      ]
    });
  } catch (error) {
    return response(500, { error: error.message || "Unexpected server error." });
  }
};
