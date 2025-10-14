# Desktop CRM Application

A cross-platform desktop CRM application built with Electron, Firebase Authentication, and Asana API.  
This app allows your team to view projects, manage tasks, execute SQL scripts (with VPN validation), and export results seamlessly.  
It also includes an auto-update system to keep everyone on the latest version.

---

## CODE-BASED DOCUMENTATION
 - https://docs.google.com/document/d/1b9tTVm5YiPbzEmJaU-06VTIltWG2NRfUBWcdgMujeHQ/edit?tab=t.0#heading=h.eqcbckosw6ix

## CRM DOCUMENTATION
 - https://docs.google.com/document/d/1g85EoelhAUnTyQTx6Gg_098ONfZGFDwNCcvkkGizf24/edit?tab=t.0#heading=h.njimr9c794c8

## CRM TEST CASE
 - https://docs.google.com/document/d/1Gel1BtFtKXhT3Pm9qACAP7kmghpb6LBaKGKIepW_Dck/edit?tab=t.0#heading=h.ocnjtk163l4d
   
## Installation & Setup

### 1. For End Users (Installer Setup)
1. Download the installer package.
2. Run the setup wizard.
3. Launch the application from your desktop or start menu.

The application will automatically check for updates at startup.

---

### 2. For Developers (Cloning & Running Locally)

If you want to run or modify the project locally, follow these steps:

# Clone the repository
1. https://github.com/bajidata/CRM_DESKTOP.git
2. cd desktop-crm

# Install dependencies
npm install

# Install Chromium for Playwright
npx playwright install

### 3. Then, request the configuration file from the dev team and place it here:

src/electron/config/firebase-admin.json


### 4. Finally, you can run the app in development mode:

npm run dev
