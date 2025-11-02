# Gunakan image Node.js versi 20
FROM node:20


# Set direktori kerja
WORKDIR /app

# Salin file package.json dan package-lock.json (kalau ada)
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin semua source code
COPY . .

# Expose port yang digunakan app kamu (biasanya 3000)
EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "run", "dev"]
