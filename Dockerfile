# Tahap 1: Build Aplikasi Vue.js
# Menggunakan image Node.js sebagai dasar untuk tahap build
FROM node:22-alpine AS build-stage

# Menentukan direktori kerja di dalam container
WORKDIR /app

# Menyalin package.json dan yarn.lock (atau package-lock.json jika menggunakan npm)
COPY package.json yarn.lock ./

# Menginstal semua dependencies
RUN yarn install

# Menyalin semua file proyek ke dalam container
COPY . .

# Menjalankan perintah build untuk menghasilkan file statis di folder /app/dist
RUN yarn build

# Tahap 2: Sajikan Aplikasi dengan Nginx
# Menggunakan image Nginx yang ringan sebagai dasar
FROM nginx:stable-alpine AS production-stage

# Menyalin hasil build (folder dist) dari tahap build-stage ke direktori default Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# (Opsional) Menyalin konfigurasi Nginx kustom jika ada
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Memberitahu Docker bahwa container akan berjalan di port 80
EXPOSE 80

# Perintah untuk menjalankan Nginx saat container dimulai
CMD ["nginx", "-g", "daemon off;"]