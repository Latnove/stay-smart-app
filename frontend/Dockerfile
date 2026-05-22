FROM node:22-alpine
WORKDIR /app
ENV HUSKY=0
COPY package*.json ./
RUN npm ci
COPY index.html vite.config.ts tsconfig*.json ./
COPY public public
COPY src src
ARG VITE_TURNSTILE_SITE_KEY
ENV VITE_API_URL=
ENV VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY
RUN npm run build

EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
