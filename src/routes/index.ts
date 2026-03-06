import { Router } from 'express';
import { AccountController, PersonController } from '../controllers';

const router = Router();
const accountController = new AccountController();
const personController = new PersonController();

/**
 * Person Routes
*/

router.post('/persons', personController.createPerson);

/**
 * Account Routes
*/

// Create account
router.post('/accounts', accountController.createAccount);

// Get account balance
router.get('/accounts/:accountId/balance', accountController.getBalance);

// Deposit to account
router.post('/accounts/:accountId/deposit', accountController.deposit);

// Withdraw from account
router.post('/accounts/:accountId/withdraw', accountController.withdraw);

// Block account
router.post('/accounts/:accountId/block', accountController.blockAccount);

// Unblock account
router.post('/accounts/:accountId/unblock', accountController.unblockAccount);

// Get account statement (with optional date range)
// Example: GET /accounts/:accountId/statement?startDate=2024-01-01&endDate=2024-12-31
router.get('/accounts/:accountId/statement', accountController.getStatement);

// Health check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
