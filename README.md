# Banking Transaction API

REST API for managing banking accounts and transactions with daily withdrawal limits, built with TypeScript, Node.js 22, and Express.js.

## Getting Started

### Requirements
- Node.js 22+ (uses native TypeScript support)
- npm or yarn

### Installation (MAKE SURE TO USE NODE.JS 22+)
```bash
npm install
```

### Testing
```bash
npm run test
```
or
```bash
npm test
```

### Development
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

## Development Process

### 1. Project Setup & Planning

- Analyzed the assignment requirements and identified core components: Person management, Account operations, Transaction history, and Daily withdrawal limits
- Used in-memory Maps for simplicity (in a real app I would use PostgreSQL/MongoDB)

### 2. Building the Type System

**Challenge:** Ensuring type safety across the entire application
**Solution:** Created centralized interfaces and custom exception handling in `src/types/index.ts`

- `Person`, `Account`, `Transaction` interfaces with strict typing
- `ApiResponse<T>` envelope for consistent response format
- `BusinessException` class for error handling
- Error codes mapped to HTTP status codes

### 3. Building the Database Layer

**Challenge:** Managing state without a real database
**Solution:** Implemented Database singleton with TypeScript Maps (`src/database/index.ts`)

- Automatically incrementing ID counters for each type
- API operations for Person, Account, Transaction
- `getDailyWithdrawalTotal()` for limit enforcement
- Transaction filtering by date range
- Mock data initialization for testing

### 4. Building the Business Logic (Services)

**Challenge:** Separating business rules from HTTP concerns
**Solution:** Created service layer in `src/services/index.ts` with all validation

**PersonService:**
- Create person with validation (non-empty name, document, valid birthdate)
- Retrieve person by ID

**AccountService:**
- Create account (must link to existing person)
- Deposit money (only to active accounts)
- Withdraw money with dual validation:
  - **Balance check**: Ensure sufficient funds
  - **Daily limit check**: Enforce withdrawal limit per calendar day
- Block/unblock accounts
- Generate statements with optional date filtering

**Some Rules:**
- Daily withdrawal limits reset at midnight
- Blocked accounts cannot deposit or withdraw

### 5. Building the API Layer

**Challenge:** Handling HTTP requests and send to service calls
**Solution:** Created controllers in `src/controllers/index.ts`

**PersonController:**
- `POST /persons` - Create new person

**AccountController:**
- `POST /accounts` - Create new account
- `GET /accounts/:accountId/balance` - Check balance
- `POST /accounts/:accountId/deposit` - Deposit funds
- `POST /accounts/:accountId/withdraw` - Withdraw funds
- `POST /accounts/:accountId/block` - Block account
- `POST /accounts/:accountId/unblock` - Unblock account
- `GET /accounts/:accountId/statement` - Get transactions (with optional date filter)

**Error handling:**
- Validates required fields at controller layer
- Catches BusinessException and translates to HTTP responses
- Returns proper status codes (201, 200, 400, 403, 404, 500)

### 6. Building the Routes & Server

**Challenge:** Organizing endpoints and middleware
**Solution:** Separated routing logic and server initialization

**Routes (`src/routes/index.ts`):**
- All 9 endpoints mapped with HTTP methods
- Health check endpoint for monitoring

**Server (`src/index.ts`):**
- Express middleware for JSON/URL-encoded parsing
- Request logging with timestamps
- 404 handler for undefined routes
- Global error handler for unexpected errors
- Graceful shutdown on SIGTERM/SIGINT

### 7. Testing (using Jest)

**Challenge:** Testing with Database singleton
**Solution:** Used `jest.resetModules()` in `beforeEach()` to force database reload

**Test Structure (`src/services/__tests__/services.test.ts`):**

**Test Coverage:** All of the core business logic