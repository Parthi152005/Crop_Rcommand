# Smart Agriculture AI Web Application

Deployable React + Netlify Functions project for:
- Crop recommendation (self-hosted CNN + KNN ML backend)
- Leaf disease detection (CNN API)
- Fertilizer planning (logic-based)
- PDF report generation (frontend)

## Stack
- Frontend: React + Tailwind CSS
- Serverless API: Netlify Functions
- Hosting: Netlify
- ML: Self-hosted FastAPI backend (`ml-backend/`)

## Project Structure
- `src/` - React frontend UI and client API calls
- `netlify/functions/` - serverless function handlers
- `public/` - static assets

## Environment Variables
Copy `.env.example` to `.env` and set values:

```bash
REACT_APP_API_BASE=/api
REACT_APP_ML_API_BASE=https://your-self-hosted-ml-api.com
```

## Self-Hosted ML Backend (No API Keys)
Use the Python backend in `ml-backend/` with these endpoints:
- `POST /predict` -> predicts `N`, `P`, `K`, `pH` from soil image
- `POST /predict-manual` -> manual fallback prediction
- `POST /validate-soil-image` -> rejects non-soil images
- `POST /detect-disease` -> returns disease, confidence, treatment
- `POST /fertilizer-plan` -> fertilizer type, quantity, schedule
- `GET /history` -> recent prediction history

### Backend model files
Optional trained file:
- `ml-backend/models/npk_resnet50.pth`

If the file is present, the backend uses the trained model.
If the file is missing, the backend still runs in fallback inference mode for demo usage.

### Run ML backend locally
```bash
cd ml-backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Set frontend `.env`:
```bash
REACT_APP_ML_API_BASE=http://localhost:8000
```

## Run Locally
```bash
npm install
npm start
```

For full Netlify function testing locally:
```bash
npm install -g netlify-cli
netlify dev
```

## Netlify Deployment
Already configured in `netlify.toml`:
- Build command: `npm run build`
- Publish folder: `build`
- Functions folder: `netlify/functions`

Push to your Git provider and import into Netlify. Add env vars in Netlify site settings.

## Deploy ML Backend On Render
`ml-backend/render.yaml` is included for Render deployment and `ml-backend/runtime.txt` pins Python 3.11 for compatibility.

### Option 1: Blueprint deploy
1. Push this repository to GitHub.
2. In Render, click `New` -> `Blueprint`.
3. Select your GitHub repository.
4. Render will detect `ml-backend/render.yaml`.
5. Approve the service creation.
6. Wait for build + deploy to complete.
7. Open the deployed backend URL and verify a route such as `/history`.

### Option 2: Manual web service
1. In Render, click `New` -> `Web Service`.
2. Connect your GitHub repository.
3. Set:
   - Root Directory: `ml-backend`
   - Runtime: `Python`
   - Build Command: `pip install --upgrade pip && pip install -r requirements.txt`
   - Start Command: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Deploy the service.

### After backend deploy
1. Copy your Render backend URL, for example:
   - `https://smart-agri-ml-api.onrender.com`
2. In Netlify site settings, add:
   - `REACT_APP_ML_API_BASE=https://your-render-url.onrender.com`
3. Trigger a new Netlify deploy.

### Notes
- Render free instances may sleep when idle, so the first request can be slow.
- `soil_predictions.db` is local file storage; on free hosting it should be treated as non-persistent.
- If you later add `npk_resnet50.pth`, redeploy Render to use the trained model.
