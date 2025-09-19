# Costa Rica MLS - Multiple Listing Service

A comprehensive property registry system for Costa Rica real estate.

## Features
- 🏠 Property Search and Filtering
- 📊 Advanced Analytics Dashboard
- 💳 PayPal Integration for Contact Access
- 📱 Responsive Design
- 🔒 Agent Authentication
- 📈 Market Analysis Reports
- 🌐 IPFS Hosting Support

## Development Setup
```bash
git clone https://github.com/urmt/CR_MLS.git
cd CR_MLS
docker-compose up --build
Access:

Frontend: http://localhost:3000
Backend: http://localhost:5000
MongoDB: mongodb://localhost:27017/cr_mls
plaintext


### 2. Client Directory (React Frontend)
**Directory:** `/client`

**File:** `/client/Dockerfile`  
```dockerfile
# Development stage
FROM node:18-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
