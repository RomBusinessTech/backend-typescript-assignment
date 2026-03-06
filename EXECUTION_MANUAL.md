# Banking Transaction API - Execution Manual

### 1. Setup Environment

```bash
# Use correct Node version
nvm use 22

# Install dependencies
npm install
```

### 2. Run the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm run build

npm start
```

The server will start on `http://localhost:3000`

### 3. Verify Installation

```bash
# Check health endpoint
curl http://localhost:3000/api/health
```

## Testing

### Run Tests

```bash
npm test
```

### Test Results

The test suite includes tests covering:
- Account creation and validation
- Deposit and withdrawal operations
- Daily withdrawal limits
- Account blocking/unblocking
- Statement generation with date filtering
- Person management
- Error handling
```

## API Usage Examples

### 1. Create a Person

```bash
curl -X POST http://localhost:3000/api/persons \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Name Naming",
    "document": "12345678900",
    "birthDate": "2000-01-15"
  }'
```

### 2. Create an Account

```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "personId": 1,
    "dailyWithdrawalLimit": 2000,
    "accountType": 1
  }'
```

### 3. Check Balance

```bash
curl http://localhost:3000/api/accounts/1/balance
```

### 4. Deposit Money

```bash
curl -X POST http://localhost:3000/api/accounts/1/deposit \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000}'
```

### 5. Withdraw Money

```bash
curl -X POST http://localhost:3000/api/accounts/1/withdraw \
  -H "Content-Type: application/json" \
  -d '{"amount": 500}'
```

### 6. Get Statement (All Transactions)

```bash
curl http://localhost:3000/api/accounts/1/statement
```

### 7. Get Statement (By Period)

```bash
curl "http://localhost:3000/api/accounts/1/statement?startDate=2024-01-01&endDate=2024-12-31"
```

### 8. Block Account

```bash
curl -X POST http://localhost:3000/api/accounts/1/block
```

### 9. Unblock Account

```bash
curl -X POST http://localhost:3000/api/accounts/1/unblock
```