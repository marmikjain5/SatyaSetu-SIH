# SatyaDrishti — Mobile Camera & Live Video Testing Guide
**Secure Contexts (HTTPS), Hardware Verification & Development Tunneling**  
*SIH 2026 Problem Statement: SIH26034*

---

## 1. Executive Summary & Browser Security Mandate

Modern mobile web browsers (Chrome Mobile on Android, Safari on iOS, Firefox Mobile) strictly enforce the **W3C Media Capture and Streams specification**. Under this specification:

> **`navigator.mediaDevices.getUserMedia()` is only exposed in Secure Contexts (`window.isSecureContext === true`).**

A Secure Context is defined by modern browser engines as:
1. `https://` (any valid TLS connection)
2. `http://localhost` or `http://127.0.0.1` (loopback origin on the same machine)

### Why `http://192.168.1.X:3000` Fails on Mobile Phones
When accessing the local development server from a physical smartphone on the same Wi-Fi network using the local LAN IP (e.g., `http://192.168.1.3:3000`):
- The connection is plain **HTTP**.
- The origin is **not localhost** to the phone (it is a remote LAN IP).
- Therefore, `window.isSecureContext` evaluates to `false`.
- The browser either sets `navigator.mediaDevices` to `undefined` or throws a security exception (`NotAllowedError` / `SecurityError`) when calling `getUserMedia()`.

**Do NOT attempt to bypass browser security.** Modern browser engines do not permit JavaScript workarounds for hardware access over insecure origins. Instead, follow the standard development tunneling procedures below.

---

## 2. In-App Detection & User Experience

SatyaDrishti implements clean, unintrusive security detection in:
- `src/components/scanner/LiveProductCapture.tsx` (Manufacturer Packaging)
- `src/components/hygiene/LiveFactoryVideoRecorder.tsx` (Manufacturer Hygiene)

### Key Implementation Principles:
1. **No Permanent Warning Banners**: The user is presented with a clean, task-oriented idle screen with a prominent action button (`[📷 Start Camera]` / `[🎥 Record Video]`).
2. **On-Demand Error Presentation**: Only after the user taps the action button does the component check `window.isSecureContext` and initialize the camera.
3. **Clean Human-Readable Error Message**:
   - `"Camera requires a secure connection."`
   - `"Mobile browsers require HTTPS for camera access."`
4. **Collapsible Technical Troubleshooting**: A collapsible helper (`"How to enable camera on mobile (HTTPS)"`) provides exact terminal commands for tunneling.

---

## 3. How to Test on a Real Mobile Phone (HTTPS Tunneling)

To test live camera and video capture on a physical Android or iOS device, choose one of the following methods to establish an HTTPS connection to your local development server (`localhost:3000`).

---

### Method A: Cloudflare Tunnel (Recommended — Free & No Signup Required)

Cloudflare provides instant, secure public HTTPS tunnels with zero account configuration.

1. **Install Cloudflare Tunnel (`cloudflared`)**:
   - **Windows** (via winget or Chocolatey):
     ```powershell
     winget install --id Cloudflare.cloudflared
     ```
   - Or download the binary from [Cloudflare Releases](https://github.com/cloudflare/cloudflared/releases).

2. **Start your SatyaDrishti dev server**:
   ```bash
   npm run dev
   ```
   *(Ensure Vite is running at `http://localhost:3000`)*

3. **Start the HTTPS Tunnel**:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

4. **Open the Generated HTTPS URL on your phone**:
   In the console output, look for the line:
   ```text
   Your quick Tunnel has been created! Visit it at:
   https://random-words-subdomain.trycloudflare.com
   ```
   Open this URL in Chrome on your Android device or Safari on iOS. Camera permissions will be natively requested and granted.

---

### Method B: ngrok (Popular Alternative)

1. **Install ngrok**:
   ```bash
   npm install -g ngrok
   # or
   winget install ngrok
   ```

2. **Start the tunnel on port 3000**:
   ```bash
   ngrok http 3000
   ```

3. **Open the HTTPS Forwarding URL**:
   Copy the `https://xxxx.ngrok-free.app` URL and open it on your mobile phone.

---

### Method C: Chrome Flag for LAN Testing (Android Chrome Only)

If you must test directly over `http://192.168.1.3:3000` without third-party tunnels:

1. On your Android phone, open Chrome and navigate to:
   ```text
   chrome://flags/#unsafely-treat-insecure-origin-as-secure
   ```
2. Enable the flag.
3. In the input box, enter your LAN address:
   ```text
   http://192.168.1.3:3000
   ```
4. Tap **Relaunch** at the bottom.
5. Chrome will now treat `http://192.168.1.3:3000` as a Secure Context and allow camera access.

---

## 4. Strict Role & Workflow Separation Matrix

SatyaDrishti strictly enforces role-specific media capture workflows to maintain legal evidence integrity and prevent falsification:

| Workflow | Page Route | Role | Permitted Capture Methods | Forbidden Elements |
|---|---|---|---|---|
| **Product Packaging** | `/dashboard/scanner` | Manufacturer | **LIVE CAMERA ONLY** (`LiveProductCapture.tsx`) | ❌ NO "Browse Files"<br>❌ NO "Choose File"<br>❌ NO "Upload Image"<br>❌ NO gallery fallback<br>❌ NO drag-and-drop |
| **Factory Hygiene Proof** | `/dashboard/factory-certification` | Manufacturer | **LIVE VIDEO ONLY** (`LiveFactoryVideoRecorder.tsx`) | ❌ NO image upload<br>❌ NO "Browse Files"<br>❌ NO "Choose File"<br>❌ NO "Take Photo" |
| **Inspector Visual Inspection** | `/dashboard/hygiene` | Inspector | **IMAGE UPLOAD & DETERMINISTIC VISION** (`FactoryImageInspection.tsx`) | Retains 3 deterministic reference benchmarks (`factory-reference-01.jpg`, etc.) for reproducible regulatory evaluation |

---

## 5. Physical Mobile Verification Checklist

When validating on a real device:

- [ ] **Viewport scaling**: Page renders cleanly between 360px and 430px wide without horizontal scrolling.
- [ ] **Touch targets**: All primary buttons are at least 44px tall (capture buttons 64px circular).
- [ ] **Camera rear-facing default**: Requests `facingMode: { ideal: "environment" }` by default for physical labels.
- [ ] **Camera switch**: Toggle switches seamlessly between back and front cameras if hardware supports it.
- [ ] **Stream garbage collection**: When exiting or navigating away from the scanner, camera indicator lights turn off immediately (`stream.getTracks().forEach(t => t.stop())`).
- [ ] **Video duration cap**: Factory video recorder caps clips at 30 seconds with a real-time countdown timer.
- [ ] **Audio toggle**: Factory video allows capturing ambient machinery sound with a 1-tap mute/unmute switch.
- [ ] **Bottom navigation**: 5 items maximum on mobile bottom bar; labels are short ("Packaging", "Hygiene", "More") with zero ellipsis truncation.
