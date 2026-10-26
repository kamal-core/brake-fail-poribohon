# বাপের রাস্তা (Baper Rasta) - 3D Dhaka Street Driving Game

A standalone, browser-based 3D arcade driving game inspired by **Baper Rasta** ([baperrasta.com](https://baperrasta.com/)), set in an authentic Dhaka, Bangladesh street environment with realistic 3D characters, event-based Bengali street dialogues, and comedic slapstick crowd pursuit.

Built with **HTML5**, **CSS3**, **JavaScript (ES Modules)**, **Three.js**, **Web Audio API**, and **Vite**.

---

## 🌟 Features

### 1. 🏙️ Authentic Dhaka Urban Street Environment
- **Multi-Lane Urban Highway**: Realistic multi-lane layout with dashed markings, asphalt patches, and alternating yellow-and-black painted curbs.
- **Dhaka Metro Rail Viaduct**: Overhead elevated rail tracks running down the central median, supported by massive concrete pillars plastered with authentic Dhaka posters:
  - *"পরিচ্ছন্ন শহর সবুজ শহর - আমার শহর, আমার দায়িত্ব"*
  - *"পাত্রী চাই - পাত্র বুয়েট ইঞ্জিনিয়ার"*
  - *"টু-লেট (TO-LET) - ২ রুমের ফ্ল্যাট"*
- **Chaotic Overhead Electrical Wires**: Drooping wire bundles and utility poles spanning the street.
- **Dhaka Architecture & Roadside Details**: Multi-story mixed-use brick and concrete buildings with rooftop water tanks, balconies, and ground-floor storefronts with Bengali signboards (*"মা ফার্মেসি"*, *"ভাই ভাই টেলিকম"*, *"আল্লার দান বিরিয়ানি"*).
- **Roadside Tea Stalls (টং দোকান)**: Red canopy umbrellas, wooden benches, tea kettles, and biscuit jars.
- **Battery Charging Stations ("হলুদ ড্রেন লাইন")**: Special roadside charging pads that replenish vehicle battery.
- **Atmospheric Golden Fog**: Dhaka afternoon sunlight and haze.

### 2. 🛺 Rigged Realistic 3D Characters & Bangladeshi Auto-Rickshaw
- **Realistic Rickshaw Driver Model**: High-poly rigged humanoid model with authentic South Asian proportions, dressed in polo shirt, traditional lungi, red-and-white Dhaka Gamcha (গামছা), and prayer cap (জালি টুপি).
- **Natural Seated Cockpit Posture**: Ergonomically seated on the driver's bench with hands naturally gripping the steering handlebars, dynamically counter-steering and leaning into high-speed corners.
- **Realistic Pedestrians**: Animated pedestrians walking with realistic skeletal cadence across zebra crossings and walkways.
- **Authentic Rickshaw Art**: High-resolution canvas artwork on the rear panel featuring *"বাপের রাস্তা"*, *"সুপারহিট!"*, floral motifs, and swaying ornamental tassels.
- **Lights & Physics**: Glowing headlights, red brake lights that illuminate when decelerating, speed-sensitive steering with chassis body tilt/lean when cornering.

### 3. 🗣️ Event-Based Bengali Street Dialogues & Slapstick Crowd Pursuit
- **Comic 6-Stage Incident Sequence**:
  1. **Normal Driving**: Cruise through Dhaka streets.
  2. **Pedestrian Collision**: Colliding with a pedestrian triggers angry Bengali dialogue (*"ওই মিয়া! দেইখা চালাইতে পারেন না?"*) and a collision fine.
  3. **Crowd Reaction**: Surrounding crowd shouts (*"ধর শালারে! ধর!"*) and chases after the rickshaw on foot!
  4. **Crowd Catches Driver**: Comedic non-graphic slapstick fight sounds (*"ধিসুম! ধাসুম! কিল! ফুঁসি! চিত-পটাং!"*).
  5. **Driver Pleads**: Driver raises hands in comic terror (*"ভাই, গরিব মানুষ, ছাইড়া দেন!"*).
  6. **Final Line & Game Over**: Crowd delivers final verdict (*"পাইছি তোরে! খাইছি তোরে! পালাবি কই?"*) with summary modal.
- **Dialogue Manager**: Sequential queueing, mute toggle button, and procedural vocal synthesizer fallback if audio files are ever missing.

### 4. 🎥 Multiple Dynamic Camera Modes
- **Chase View (Default)**: Dynamic third-person rear camera with boost FOV kick and trauma camera shake.
- **Driver Cockpit View**: Immersive first-person perspective showing the handlebars, hands, and roadside street view.
- **Wide View**: Cinematic wide third-person chase angle.
- Press **C** on keyboard to toggle camera views at any time!

### 5. 🎮 Complete Bengali UI & HUD
- Start menu directly matching the reference visual style: *"রাস্তা কি আপনার বাপের? - আপনার সন্তানকে টেসলা দিন: নো লাইসেন্স, নো ব্রেক।"*
- In-game HUD: *"জাতীয় ক্ষতি"* damage counter with animated Bengali digits, battery meter (*"চার্জ %"*), speedometer (*"কিমি/ঘণ্টা"*), and VIP convoy warning alerts.
- Dedicated Dialogue Mute button on top-left of the HUD.
- Game Over screen with destruction statistics, collision penalty summary, and high score persistence in `localStorage`.
- Full mobile touch controls with virtual thumb buttons.

---

## 🕹️ Controls

### Desktop Keyboard Controls
| Key | Action | বাংলা |
|---|---|---|
| **W** or **↑** | Accelerate | চালান |
| **S** or **↓** | Brake / Reverse | ব্রেক / রিভার্স |
| **A** or **←** | Steer Left | বামে ঘোরান |
| **D** or **→** | Steer Right | ডানে ঘোরান |
| **Shift** | Turbo Boost | টান (বুস্ট) |
| **Space** | Handbrake | হ্যান্ডব্রেক |
| **H** | Dhaka Horn | হর্ন |
| **C** | Change Camera | ক্যামেরা কোণ পরিবর্তন |
| **M** | Toggle Sound | সাউন্ড অন/অফ |
| **Esc** / **P** | Pause / Resume | পজ করুন |

### Mobile Touch Controls
- **Left Thumb**: Virtual ◀ and ▶ steer buttons.
- **Right Thumb**:
  - 🟢 **চালান** (Gas / Accelerate)
  - 🛑 **ব্রেক** (Brake / Reverse)
  - ⚡ **টান!** (Turbo Boost)
  - 📢 **হর্ন** (Air Horn)

---

## 🚀 Setup & Running Locally

### Prerequisites
- Node.js (v18+ or v20+)

### 1. Installation
In the project directory:
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
The game will launch at `http://localhost:5173/`.

### 3. Production Build
```bash
npm run build
```
Builds the optimized production assets in the `dist/` directory.

### 4. Preview Production Build
```bash
npm run preview
```

---

## 🌐 Deploy to Vercel (One-Click)

1. Push your code to your GitHub repository (see steps below).
2. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
3. Click **"Add New..."** -> **"Project"**.
4. Select the `baper-rasta` repository and click **Import**.
5. Vercel automatically detects Vite:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**. In under a minute, your game will be live with a free `.vercel.app` public URL!

---

## 🐙 Upload to GitHub

```bash
# 1. Initialize git (if not already done)
git init

# 2. Add files
git add .

# 3. Commit
git commit -m "Fix driver pose, audio dialogue system, and prepare for Vercel deployment"

# 4. Link to your GitHub repo
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/baper-rasta.git

# 5. Push to GitHub
git push -u origin main
```
