# Stay Smart App (задеплоин: staysmart.kemalthes.ru)

Stay Smart App - учебный сервис для поиска, публикации и бронирования жилья. Проект состоит из React-фронтенда и Spring Boot-бэкенда, работает с PostgreSQL, Redis, Cloudinary, Cloudflare Turnstile, email-подтверждением и WebSocket-уведомлениями.

## Возможности

- регистрация, вход, подтверждение почты и обновление access token через httpOnly refresh cookie;
- роли пользователя и администратора;
- публикация объявлений с загрузкой изображений в Cloudinary;
- модерация объявлений и документов пользователя;
- каталог объявлений с фильтрацией, сортировкой и пагинацией;
- избранное с мержем локального избранного после авторизации;
- бронирования и изменение периода аренды;
- отзывы и рейтинг по шкале от 0 до 5;
- уведомления через WebSocket и REST;
- кэширование объявлений через Redis;
- OpenAPI-спецификация и сгенерированный frontend API-клиент.

## Стек

### Frontend

- React
- TypeScript
- Vite
- React Router
- Zustand
- Ant Design
- React Hook Form
- Zod
- `@hey-api/openapi-ts`
- `@stomp/stompjs`

### Backend

- Java 21
- Spring Boot
- Spring MVC REST
- Spring Security
- Spring Data JPA
- PostgreSQL
- Liquibase
- Redis Cache
- WebSocket STOMP
- Spring Mail
- Springdoc OpenAPI
- Lombok

## Структура

```txt
stay-smart-app/
  frontend/       React-приложение
  server/         Spring Boot API
  docker-compose.yml
  .env.sample
```

## Запуск через Docker

1. Создать `.env` из примера:

```bash
cp .env.sample .env
```

2. Заполнить переменные в `.env`:

- данные PostgreSQL;
- JWT secrets;
- Cloudinary credentials;
- Cloudflare Turnstile keys;
- SMTP-доступы для отправки писем;
- `FRONTEND_URL`;
- `CORS_ALLOWED_ORIGINS`.

3. Собрать jar для сервера:

```bash
cd server
./gradlew clean bootJar
cd ..
```

4. Запустить проект:

```bash
docker compose up --build
```

По умолчанию:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui`
- OpenAPI yaml: `http://localhost:8080/api-docs.yaml`

## Локальный запуск без Docker

### Backend

```bash
cd server
./gradlew bootRun
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Генерация API-клиента на фронте

Когда backend запущен:

```bash
cd frontend
npm run api:sync
```

Команда скачивает OpenAPI yaml с backend и генерирует клиент в `frontend/src/shared/api`.

## HTTP-тесты

HTTP-файлы можно запускать из IntelliJ IDEA через кнопку запуска рядом с запросом. Перед этим нужно поднять backend и заполнить `.env`.

## Безопасность

В проекте используются:

- JWT access token;
- refresh token в httpOnly cookie;
- Spring Security;
- BCrypt для паролей;
- Cloudflare Turnstile при регистрации;
- подтверждение email;
- CORS-настройки;
- валидация DTO;
- ограничения в Liquibase;
- защита WebSocket через STOMP `Authorization` header;
- безопасная обработка ошибок через общий exception handler.

## Деплой

Для простого деплоя достаточно:

1. скопировать проект на сервер;
2. заполнить `.env`;
3. собрать backend jar;
4. запустить `docker compose up --build -d`;
5. настроить nginx как reverse proxy на frontend и backend.

## Автор

Проект выполнен как семестровая работа.

https://github.com/user-attachments/assets/f523a610-e412-4349-a292-ad2087414a5b
