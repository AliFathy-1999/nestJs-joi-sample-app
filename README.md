# NestJS Joi Validation with Localization

A production-grade reference implementation demonstrating how to integrate **Joi schema validation** into a NestJS application with **bilingual (Arabic/English) error localization**. Every validation error is returned in both languages simultaneously, making it suitable as a boilerplate for applications targeting Arabic-speaking markets.

---

## Overview

- **Business purpose**: Serve as a learning reference and starting template for NestJS projects that require schema-level validation and bilingual API responses.
- **Main functionality**: Accepts HTTP requests, validates request body, URL parameters, and query parameters against Joi schemas defined directly on DTO classes, and returns structured, localized error responses on failure.
- **Target users**: Backend developers building APIs for Arabic/English bilingual products with NestJS.
- **Key capabilities**:
  - Joi schemas co-located with DTO classes via decorators — no separate schema files needed.
  - All validation errors respond with both `en` and `ar` message fields.
  - Dynamic error interpolation (e.g. `"must be at least 8 characters"` from `{#limit}`).
  - Conditional field validation (e.g. `militaryStatus` required only when `gender` is `M`).
  - Array-of-objects validation with per-item and per-field error paths.
  - Unknown/extra request fields are rejected with explicit bilingual messages.

---

## Features

- **Joi-decorated DTOs** — `@JoiSchema()` from `joi-class-decorators` attaches validation rules directly to DTO properties.
- **Custom global validation pipe** — Extracts the Joi schema from any DTO class at runtime, validates, maps error types to localization keys, and throws `BadRequestException` with bilingual payloads.
- **Bilingual error messages** — Every error response includes `{ message: { en: "...", ar: "..." } }` at the HTTP layer.
- **JSON-based locale files** — English and Arabic messages live in `en/validation.json` and `ar/validation.json`; no third-party i18n library required.
- **Context-aware message interpolation** — Joi context values (e.g. `limit`, `label`) are injected into message templates using `{#key}` placeholders.
- **Conditional validation** — `Joi.when()` enables field requirements that depend on other field values.
- **Nested array validation** — Arrays of objects are validated with per-item error paths normalized to `item` keys.
- **Strict unknown-field rejection** — `allowUnknown: false` on all DTO schemas; extra fields return a specific bilingual error identifying the offending key.
- **Custom exception class** — `CustomException` wraps `HttpException` for typed bilingual error throwing from service layer code.
- **Global exception filter** — `HttpExceptionsFilter` catches all unhandled exceptions and normalizes the response shape.
- **URI-based API versioning** — All routes served under `/v1/` with NestJS built-in versioning.
- **Swagger / OpenAPI documentation** — Auto-generated interactive docs available at `/api-docs`.
- **Environment configuration** — `@nestjs/config` loads `.env` globally with `ConfigModule.forRoot({ isGlobal: true })`.

---

## Tech Stack

| Category | Technology |
|---|---|
| **Language** | TypeScript 5.x |
| **Framework** | NestJS 11 (Express adapter) |
| **Validation** | Joi 17, joi-class-decorators, nestjs-joi |
| **Serialization** | class-transformer |
| **API Documentation** | @nestjs/swagger (OpenAPI 3) |
| **Configuration** | @nestjs/config |
| **Testing** | Jest 29, @nestjs/testing, Supertest |
| **HTTP Server** | Express (via @nestjs/platform-express) |
| **Runtime** | Node.js (ES2021 target) |

---

## Project Structure

```
src/
├── main.ts                            # Bootstrap: versioning, Swagger setup, app.listen()
├── app.module.ts                      # Root module: registers global pipe, ConfigModule, feature modules
├── app.controller.ts                  # Root health-check controller
├── app.service.ts                     # Root service
│
├── common/                            # Shared infrastructure (registered globally)
│   ├── common.module.ts               # Provides APP_PIPE and APP_FILTER globally
│   ├── pipes/
│   │   └── validation.pipe.ts         # Custom Joi validation pipe (core of the project)
│   ├── filters/
│   │   └── http-exception.filter.ts   # Global exception filter — normalizes all error responses
│   ├── exceptions/
│   │   └── custom.exception.ts        # Typed bilingual HttpException subclass
│   ├── utils/
│   │   ├── localization.util.ts       # Key resolver: nested key traversal + {#placeholder} injection
│   │   └── file.util.ts               # fs.readFileSync wrapper for JSON locale loading
│   ├── constants/
│   │   ├── messages/
│   │   │   └── common.message.ts      # App-level response messages (success / unknown error)
│   │   └── localization/
│   │       ├── localization.ts        # Loads and exports { en, ar } locale objects at startup
│   │       ├── en/
│   │       │   └── validation.json    # English validation messages
│   │       └── ar/
│   │           └── validation.json    # Arabic validation messages
│   ├── enum/
│   │   ├── category.enum.ts           # CategoryEnum: Fashions | Electronics | MobilesPhones | Perfumes
│   │   └── localization.enum.ts       # Lang enum (EN/AR) and LocalizedMessage type
│   └── interfaces/
│       ├── localization.interface.ts  # ILocalize, ILanguages types
│       └── response-message.interface.ts  # AppResponseEntry, AppResponseMessagesInterface types
│
└── modules/
    └── test-module/                   # Feature module demonstrating all validation scenarios
        ├── test-module.module.ts
        ├── test-module.controller.ts  # POST /v1/test-module/testBody, GET /v1/test-module/testParams/:category
        ├── test-module.service.spec.ts
        ├── test-module.controller.spec.ts
        └── dto/
            └── validate.dto.ts        # validationBodyDto, validationParamDto, validationQueryParamDto
```

---

## Architecture

### Pattern

Layered NestJS modular monolith with a shared `CommonModule` providing globally-scoped cross-cutting concerns (validation, exception handling) and feature modules under `src/modules/`.

### Request Flow

```
HTTP Request
     │
     ▼
NestJS Router  (URI versioning: /v1/...)
     │
     ▼
ValidationPipe  (APP_PIPE — runs before every controller handler)
  1. plainToInstance() transforms the raw payload into a DTO class instance
  2. getClassSchema() retrieves the Joi schema compiled from @JoiSchema() decorators
  3. schema.validate() runs with abortEarly:true, allowUnknown:false
  4a. No error → passes the DTO instance to the handler
  4b. Error → builds a dot-notation localization key from Joi's error path + type
           → calls localizeMessage() twice (EN + AR)
           → throws BadRequestException({ message: { en, ar }, field, location })
     │
     ▼
Controller Handler
     │
     ▼
HttpExceptionsFilter  (APP_FILTER — catches all exceptions)
  - Reads exception status and message
  - Detects if message is already a LocalizedMessage object (has en/ar keys)
  - Falls back to AppResponseMessages.ERROR.UNKNOWN_ERROR for unstructured errors
  - Returns: res.status(status).json({ message: { en, ar } })
```

### Localization Key Resolution

The `localizeMessage()` utility resolves dot-notation keys against a loaded JSON locale tree:

```
Joi error path: ["reviews", 0, "comment"]  +  Joi type: "string.min"
       │
       ▼
pathSegments = ["reviews", "item", "comment"]   (numbers → "item")
errorKey     = "min"                            (last segment of Joi type)
key          = "reviews.item.comment.min"
       │
       ▼
Traverse locales["en"]["reviews"]["item"]["comment"]["min"]
       → "Comment must be at least {#limit} characters."
       │
       ▼
Inject context: { limit: 3 }
       → "Comment must be at least 3 characters."
```

### Module Interactions

```
AppModule
  ├── ConfigModule (global)
  ├── CommonModule ──► APP_PIPE (ValidationPipe)
  │                └► APP_FILTER (HttpExceptionsFilter)
  └── TestModuleModule ──► TestModuleController
                               ├── POST /v1/test-module/testBody      → validationBodyDto
                               └── GET  /v1/test-module/testParams/:category
                                       → validationParamDto + validationQueryParamDto
```

### Design Decisions

- **Joi over class-validator**: Joi provides richer conditional logic (`Joi.when()`), custom validators, and finer control over error message keys — important for mapping to a custom i18n system.
- **Error keys as Joi messages**: DTO schemas pass localization key strings as Joi `messages()` values (e.g. `'string.min': 'fullName.min'`). The pipe reads these keys and resolves them through the locale files, keeping validation rules and translations decoupled.
- **Dual-language response**: Both languages are resolved and included in every error response, letting frontend clients choose display language without a separate API call.
- **JSON locale files over in-code strings**: Translations are externalized to `en/validation.json` and `ar/validation.json`, making them easy to update or hand off to a translator.
- **Global pipe via APP_PIPE token**: Registering the pipe in `CommonModule` with `APP_PIPE` ensures it applies to every controller without decorating each one individually.

---

## Installation

### Prerequisites

- Node.js >= 18
- npm >= 9

### Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd nestJs-joi-sample-app

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and set PORT and NODE_ENV

# 4. Start in development mode (watch)
npm run start:dev

# 5. Open Swagger docs
# http://localhost:3000/api-docs
```

### Available Scripts

| Script | Description |
|---|---|
| `npm run start` | Start the app |
| `npm run start:dev` | Start with file-watch (development) |
| `npm run start:debug` | Start with debugger attached |
| `npm run start:prod` | Run compiled output from `dist/` |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:cov` | Run unit tests with coverage report |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Lint and auto-fix source files |
| `npm run format` | Format source files with Prettier |

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | Port the HTTP server listens on |
| `NODE_ENV` | No | — | Runtime environment (`development`, `production`) |

---

## API Reference

Interactive documentation is available at **`/api-docs`** once the server is running.

### `POST /v1/test-module/testBody`

Validates a full user profile payload.

**Request body fields:**

| Field | Type | Rules |
|---|---|---|
| `fullName` | `string` | Required. 8–50 chars. Arabic or English letters only. No consecutive spaces. |
| `phoneNumber` | `string` | Required. Exactly 11 digits. Must start with `010`, `011`, `012`, or `015`. |
| `email` | `string` | Optional. Must be a valid email format. |
| `gender` | `string` | Required. Must be `"M"` or `"F"`. |
| `militaryStatus` | `string` | Required when `gender` is `"M"`, otherwise optional. |
| `age` | `number` | Required. Between 14 and 100. |
| `reviews` | `object[]` | Required. Array of `{ rating: number (≥0.1), comment: string (3–300 chars) }`. |
| `profilePicture` | `string` | Optional. Allows empty string. |
| `profileFileName` | `string` | Required when `profilePicture` is provided. |
| `isVerified` | `boolean` | Required. |

**Success response (200):**

```json
{
  "fullName": "John Doe",
  "phoneNumber": "01012345678",
  "gender": "M",
  "militaryStatus": "Completed",
  "age": 25,
  "reviews": [{ "rating": 4.5, "comment": "Great!" }],
  "isVerified": true
}
```

**Error response (400):**

```json
{
  "message": {
    "en": "Full name must have at least 8 characters.",
    "ar": "يجب أن يحتوي الاسم الكامل على الأقل 8 حرفًا."
  }
}
```

### `GET /v1/test-module/testParams/:category`

Validates a URL path parameter and optional query parameters.

**URL parameter:**

| Param | Rules |
|---|---|
| `category` | Required. One of: `Fashions`, `Electronics`, `MobilesPhones`, `Perfumes`. |

**Query parameters:**

| Param | Type | Rules |
|---|---|---|
| `limit` | `number` | Optional. 0–100. |
| `page` | `number` | Optional. 0–100. |

**Success response (200):**

```json
{
  "category": { "category": "Electronics" },
  "limitAndPageSize": { "limit": 10, "page": 1 }
}
```

---

## Validation Pipe Internals

The `ValidationPipe` in [src/common/pipes/validation.pipe.ts](src/common/pipes/validation.pipe.ts) is the core learning artifact of this project:

1. **Schema discovery** — `getClassSchema(metatype)` from `joi-class-decorators` compiles all `@JoiSchema()` decorators on the DTO class into a single Joi object schema at runtime.
2. **Error key construction** — Joi's `error.details[0]` provides `path` (field path array) and `type` (e.g. `string.min`). The pipe joins normalized path segments with the error type suffix to form a dot-notation key like `reviews.item.comment.min`.
3. **Localization lookup** — `localizeMessage()` traverses the loaded JSON locale tree segment by segment, falls back from numeric indices to the `item` branch, and substitutes `{#placeholder}` tokens from Joi's error context.
4. **Unknown field handling** — `object.unknown` errors are handled separately, producing a message that names the disallowed field.

---

## Adding a New Validated Endpoint

1. Create a DTO class decorated with `@JoiSchemaOptions({ allowUnknown: false })`.
2. Add properties with `@Expose()` and `@JoiSchema(Joi.xxx().messages({ 'joi.type': 'field.key' }))`.
3. Add the corresponding translation keys to `src/common/constants/localization/en/validation.json` and `ar/validation.json`.
4. Use the DTO as a parameter type in a controller method — the global pipe handles validation automatically.

---

## Testing

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:cov

# End-to-end tests
npm run test:e2e
```

Test files are co-located with their modules (`.spec.ts` suffix). E2E tests live in the `test/` directory and use Supertest against a fully bootstrapped NestJS application.
