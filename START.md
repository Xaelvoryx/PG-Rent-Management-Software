



# 1. Start Backend API Server (Port 4000)
npm run start:dev --workspace=backend

# 2. Start Frontend Desktop UI (Port 3000)
npm run dev --workspace=frontend

# 3. Run Backend Unit Tests
npm run test --workspace=backend

# 4. Package Windows Installer Executable (PG-Rent-Manager-Setup.exe)
cd desktop
npm run dist


npm run mobile:android --workspace=frontend




# 🚀 PG Rent Manager — Quick Start Commands

## ✅ Step 1 — Start the Backend (NestJS API)
Open a terminal and run:
```
cd C:\Users\gobin\OneDrive\Desktop\pgrent\backend
npx nest start --watch
```
Wait until you see: `Application is running on: http://[::1]:4000`

---

## ✅ Step 2 — Start the Frontend (Next.js Web UI)
Open a **second** terminal and run:
```
cd C:\Users\gobin\OneDrive\Desktop\pgrent\frontend
npm run dev
```
Wait until you see: `Ready on http://localhost:3000`

---

## ✅ Step 3 — Open the App
Open your browser and go to:
```
http://localhost:3000
```

---

## 💻 Step 4 (Optional) — Launch the Desktop App (Electron)
Open a **third** terminal and run:
```
cd C:\Users\gobin\OneDrive\Desktop\pgrent\desktop
npx electron .
```

---

## 📱 Step 5 (Optional) — Build Android APK
```
cd C:\Users\gobin\OneDrive\Desktop\pgrent\frontend
npm run build
npx cap sync android
npx cap open android
```
Then in Android Studio: **Build > Build APK(s)**

---

## 📦 Step 6 (Optional) — Build Windows Installer (.exe)
```
cd C:\Users\gobin\OneDrive\Desktop\pgrent\desktop
npm run dist
```
Installer will be at: `desktop\dist\PG Rent Manager Setup 1.0.0.exe`

---

## 🔁 Git — Commit & Push Changes
```
git add <filename>
git commit -m "Your message here"
git push origin main
```

---

## 🛑 Stop Everything
Press `Ctrl + C` in each terminal window to stop the servers.



