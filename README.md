# Proyek Tasty Recipes - Otomatisasi CI/CD dengan GitHub Actions & Firebase Hosting

Dokumen ini adalah panduan lengkap untuk proyek "Tasty Recipes", mencakup setup lokal, konfigurasi alat DevOps, dan alur kerja Continuous Integration (CI) & Continuous Deployment (CD) yang diotomatisasi menggunakan GitHub Actions.

---

### **Link Penting**
* **[Dokumentasi Workflow Error & Fix](https://docs.google.com/document/d/1R3basPKRNH7FpCWSepo-N0FijlgODOAqzrsVq6TEmvk/edit?usp=sharing)**

---

## Daftar Isi
1.  [Arsitektur Pipeline](#1-arsitektur-pipeline)
2.  [Prasyarat](#2-prasyarat)
3.  [Setup Lokal](#3-setup-lokal)
4.  [Step-by-Step Setup Tools & Kredensial](#4-step-by-step-setup-tools--kredensial)
    * [Google Cloud (GCP) & Firebase](#a-google-cloud-gcp--firebase)
    * [SonarCloud](#b-sonarcloud)
5.  [Konfigurasi GitHub Secrets](#5-konfigurasi-github-secrets)
6.  [Alur Kerja CI/CD Otomatis](#6-alur-kerja-cicd-otomatis)
    * [Pemicu (Trigger)](#pemicu-trigger)
    * [Struktur Workflow (`ci-cd.yml`)](#struktur-workflow-ci-cdyml)
7.  [Tools Utama yang Digunakan](#7-tools-utama-yang-digunakan)
8.  [Deployment Manual (Alternatif)](#8-deployment-manual-alternatif)

---

## 1. Arsitektur Pipeline
Pipeline kami dirancang untuk mengotomatiskan proses dari penulisan kode hingga deployment dalam satu alur kerja yang terintegrasi.

`Developer` --(*Push/PR ke branch 'main'*)--> `GitHub` --> `Trigger GitHub Actions (ci-cd.yml)`

**Workflow `ci-cd.yml`:**
* **Job 1: `build_test_analyze_package` (Tahap CI)**
    1.  Membangun aplikasi Vue.js (`npm run build`).
    2.  Menjalankan unit test (`npx vitest run`).
    3.  Menganalisis kode dengan SonarCloud.
    4.  Membuat 2 artefak:
        * **File Statis `dist/`**: Diunggah ke GitHub Actions untuk digunakan oleh job berikutnya.
        * **Docker Image**: Diunggah ke GitHub Container Registry (GHCR).
* **Job 2: `provision_and_deploy` (Tahap CD)**
    * Berjalan **setelah** job CI sukses.
    * (Opsional) Menjalankan Terraform untuk memastikan konfigurasi proyek di Google Cloud/Firebase sudah benar.
    * Men-deploy ke Firebase Hosting.

---

## 2. Prasyarat

Sebelum memulai, pastikan Anda memiliki:
* Node.js (v22.x atau yang sesuai).
* npm (terinstal bersama Node.js).
* Firebase CLI terinstal secara global (`npm install -g firebase-tools`) dan sudah login (`firebase login`).
* Akun Google dengan akses ke Google Cloud Platform (GCP) dan Firebase.
* (Opsional) Terraform CLI v1.5.0+ untuk pengujian lokal.

---

## 3. Setup Lokal

Untuk menjalankan aplikasi ini di komputer Anda sendiri:

1.  **Clone Repositori**:
    ```sh
    git clone [https://github.com/EzraBimantara/FP_PSO_Kel5.git](https://github.com/EzraBimantara/FP_PSO_Kel5.git) # Ganti dengan URL repositori Anda
    cd FP_PSO_Kel5
    ```

2.  **Install Dependensi**:
    ```sh
    npm install --legacy-peer-deps
    ```
    Atau `npm ci --legacy-peer-deps` untuk instalasi yang bersih berdasarkan `package-lock.json`.

3.  **Buat File `.env`**:
    File ini digunakan untuk menyimpan konfigurasi Firebase khusus untuk lingkungan development lokal Anda. Buat file bernama `.env` di direktori root proyek.
    * **Dapatkan Konfigurasi**: Buka [Firebase Console](https://console.firebase.google.com/), pilih proyek Anda, pergi ke **Project Settings (⚙️) > General**, scroll ke bawah ke "Your apps", pilih web app Anda, dan salin konfigurasi dari **SDK setup and configuration > Config**.
    * Isi file `.env` dengan format berikut (diawali `VITE_`):
        ```plaintext
        # .env (Contoh - JANGAN COMMIT FILE INI)
        VITE_FIREBASE_API_KEY="NILAI_DARI_FIREBASE_CONSOLE"
        VITE_FIREBASE_AUTH_DOMAIN="NILAI_DARI_FIREBASE_CONSOLE"
        VITE_FIREBASE_DATABASE_URL="NILAI_DARI_FIREBASE_CONSOLE"
        VITE_FIREBASE_PROJECT_ID="NILAI_DARI_FIREBASE_CONSOLE"
        # ...dan variabel Firebase lainnya...
        ```
    * **PENTING**: Pastikan file `.env` sudah ditambahkan ke `.gitignore` agar tidak ter-commit ke repositori.

4.  **Jalankan Aplikasi**:
    ```sh
    npm run dev
    ```
    Aplikasi akan berjalan di `http://localhost:xxxx` (port akan ditampilkan di terminal).

---

## 4. Step-by-Step Setup Tools & Kredensial

Untuk menjalankan CI/CD otomatis, Anda perlu melakukan setup berikut satu kali dan menyimpan kredensialnya sebagai GitHub Secrets.

### a. Google Cloud (GCP) & Firebase
Keduanya terhubung erat. Setup ini untuk otentikasi Terraform dan Firebase Deployment.

1.  **Pilih Proyek GCP**: Di [Google Cloud Console](https://console.cloud.google.com/), pilih proyek yang terhubung dengan Firebase Anda (misalnya, `timedoorezra`).
2.  **Buat Service Account**:
    * Pergi ke `IAM & Admin > Service Accounts` > `+ CREATE SERVICE ACCOUNT`.
    * Beri nama (misal: `github-actions-deployer`).
    * Berikan *Roles* (izin) berikut: `Firebase Admin`, `Service Usage Admin`, `Storage Admin` (jika menggunakan Terraform dengan GCS backend).
3.  **Buat Kunci JSON**:
    * Masuk ke *service account* yang baru dibuat, pilih tab `KEYS` > `ADD KEY` > `Create new key`.
    * Pilih tipe **JSON**. File kunci akan otomatis terunduh. **Jaga kerahasiaan file ini.**
    * 🔑 **Kredensial yang didapat**: Konten file JSON ini akan digunakan untuk *secret* `GCP_SA_KEY`.
4.  **Buat GCS Bucket (untuk Terraform State)**:
    * Di `Cloud Storage > Buckets` > `CREATE BUCKET`.
    * Beri nama unik global (misal: `tfstate-tastyrecipes-kelompok5-xyz`).
    * Pilih `Location type: Region`, `Storage class: Standard`, dan **aktifkan `Object versioning`**.
    * 🔑 **Kredensial yang didapat**: Nama bucket ini akan digunakan untuk *secret* `TF_STATE_BUCKET`.

### b. SonarCloud
Untuk analisis kualitas kode.

1.  **Impor Proyek**:
    * Login ke [SonarCloud.io](https://sonarcloud.io) via akun GitHub.
    * Buat/pilih Organisasi, lalu klik `Analyze new project` dan pilih repositori Anda.
2.  **Dapatkan Kunci Proyek & Organisasi**:
    * Setelah proyek dibuat, catat **Organization Key** (misal: `ezra-bimantara`) dan **Project Key** (misal: `EzraBimantara_FP_PSO_Kel5`). Ini akan dimasukkan langsung ke file workflow.
3.  **Generate Token**:
    * Di SonarCloud, pergi ke `My Account > Security > Generate Token`.
    * 🔑 **Kredensial yang didapat**: Token ini akan digunakan untuk *secret* `SONAR_TOKEN`.

---

## 5. Konfigurasi GitHub Secrets

Simpan semua kredensial yang didapat sebagai *secrets* di `Settings > Secrets and variables > Actions` repositori GitHub Anda.

* `GCP_SA_KEY`: Konten file JSON kunci Service Account Google Cloud.
* `GCP_PROJECT_ID`: ID Proyek Google Cloud Anda (misal: `timedoorezra`).
* `TF_STATE_BUCKET`: Nama Google Cloud Storage bucket untuk Terraform state.
* `SONAR_TOKEN`: Token API dari SonarCloud.
* `FIREBASE_TOKEN`: Token CI dari `firebase login:ci` (untuk metode deploy dengan token).
* `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, dst.: Semua variabel environment dari `firebaseConfig` Anda.

---

## 6. Alur Kerja CI/CD Otomatis

Pipeline diatur dalam satu file di direktori `.github/workflows/` (misalnya, `ci-cd.yml`) yang berisi dua *jobs* yang berjalan secara berurutan.

### Pemicu (Trigger)
* Berjalan pada setiap `push` atau `pull_request` yang menargetkan `branch main`.

### Struktur Workflow (`ci-cd.yml`)
#### Job 1: `build_test_analyze_package` (Tahap CI)
1.  **Checkout & Setup**: Mengunduh kode dan menyiapkan lingkungan Node.js.
2.  **Install & Test**: Menjalankan `npm ci --legacy-peer-deps` dan `npx vitest run`.
3.  **Build**: Menjalankan `npm run build` untuk menghasilkan aset statis di folder `dist/`.
4.  **Analisis SonarCloud**: Mengirim kode untuk analisis kualitas.
5.  **Membuat Artefak**:
    * **File Statis**: Mengunggah folder `dist/` sebagai artefak untuk digunakan oleh job CD.
    * **Docker Image**: (Opsional) Membangun dan mendorong Docker image ke GitHub Container Registry (GHCR).

#### Job 2: `provision_and_deploy` (Tahap CD)
* **Ketergantungan**: Job ini hanya akan berjalan jika job `build_test_analyze_package` **selesai dengan sukses** (`needs: build_test_analyze_package`).
* **Langkah Utama**:
    1. **(Opsional) Menjalankan Terraform**: Memastikan konfigurasi proyek di GCP/Firebase sudah benar.
    2. **Setup & Build (Lagi)**: Workflow ini saat ini mengulang proses setup Node.js, instalasi dependensi, pembuatan `.env` dari *secrets*, dan `npm run build`.
    3. **Deploy ke Firebase Hosting**: Men-deploy konten `dist/` ke channel `live` proyek Firebase Anda.

---

## 7. Tools Utama yang Digunakan

* **Platform & Otomatisasi**: GitHub, GitHub Actions, Firebase Hosting.
* **Backend & Database**: Firebase Authentication, Firebase Realtime Database.
* **Frontend**: Vue.js, Vite, Vitest.
* **DevOps & Kualitas**: SonarCloud, Terraform, Docker, GCP, GCS.

---

## 8. Deployment Manual (Alternatif)

Jika Anda perlu melakukan deployment manual ke Firebase Hosting:
1.  Pastikan Anda sudah login: `firebase login`
2.  Bangun aplikasi: `npm run build`
3.  Deploy:
    ```sh
    firebase deploy --only hosting --project ID_PROYEK_FIREBASE_ANDA
    ```
