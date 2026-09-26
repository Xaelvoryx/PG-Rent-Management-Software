# Windows Desktop Packaging & Installer Guide — PG Rent Manager

## 📦 Building Windows Executable Setup (`PG-Rent-Manager-Setup.exe`)

### Step 1: Build Production Bundles
```bash
# Build backend NestJS bundle
npm run build:backend

# Build frontend Next.js production bundle
npm run build:frontend
```

### Step 2: Package Windows Desktop Shell
```bash
cd desktop
npm install
npm run dist
```

The installer executable will be output in `desktop/dist/PG-Rent-Manager-Setup.exe`.

---

## 🚀 Installed User Experience
1. The end-user double-clicks `PG-Rent-Manager-Setup.exe`.
2. The installation wizard installs the application to `C:\Program Files\PG Rent Manager`.
3. The application opens cleanly like standard desktop software with no terminal windows required.
