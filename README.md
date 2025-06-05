# TimeDoor (Pro)ject

Ini adalah config untuk trigger ci cd sampai bisa deploy ke web firebase hosting

---

## Prasyarat

- Node.js v22.x
- npm
- Akun Google Cloud & Firebase Project
- Service Account Key (JSON) untuk Google Cloud
- Firebase Hosting sudah di-setup
- Terraform v1.5.0

---

## Setup Lokal

1. **Clone repo**
    ```sh
    git clone https://github.com/username/TimeDoor-Project.git
    cd TimeDoor-Project
    ```

2. **Install dependencies**
    ```sh
    npm ci
    ```

3. **Buat file `.env`**
    ```
    VITE_FIREBASE_AUTH_DOMAIN=...
    VITE_FIREBASE_DATABASE_URL=...
    VITE_FIREBASE_PROJECT_ID=...
    VITE_FIREBASE_STORAGE_BUCKET=...
    VITE_FIREBASE_MESSAGING_SENDER_ID=...
    VITE_FIREBASE_APP_ID=...
    VITE_FIREBASE_API_KEY_REGISTER=...
    VITE_FIREBASE_API_KEY_LOGIN=...
    ```

4. **Jalankan aplikasi**
    ```sh
    npm run dev
    ```

---

## CI/CD Otomatis

### 1. **Trigger**
- Workflow akan berjalan otomatis pada push ke branch tertentu (misal: `deploy_1`).

### 2. **Langkah Utama Workflow**
- **Checkout code**
- **Setup Node.js & install dependencies**
- **Setup Terraform & Google Cloud CLI**
- **Terraform init, validate, plan, apply**
- **Build aplikasi (`npm run build`)**
- **Deploy ke Firebase Hosting menggunakan Firebase CLI**

### 3. **Secrets yang Dibutuhkan**
Tambahkan secrets berikut di GitHub repo:
- `GCP_SA_KEY` : Service Account Key Google Cloud (JSON)
- `GCP_PROJECT_ID` : Project ID Google Cloud
- `TF_STATE_BUCKET` : Nama bucket untuk Terraform state
- `FIREBASE_TOKEN` : Token CI/CD Firebase Hosting
- `VITE_FIREBASE_AUTH_DOMAIN`, dst: Semua variabel environment untuk Firebase

---

## Deployment Manual

Jika ingin deploy manual:
```sh
npm run build
npm install -g firebase-tools
firebase deploy --only hosting --token <FIREBASE_TOKEN> --project <GCP_PROJECT_ID>
```