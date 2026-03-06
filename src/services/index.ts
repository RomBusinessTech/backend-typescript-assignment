import { Database } from '../database';
import {
    Account,
    Transaction,
    Person,
    StatementResponse,
    BusinessException,
    ErrorCodes
} from '../types';

export class AccountService {
    private db: Database;

    constructor() {
        this.db = Database.getInstance();
    }

    createAccount(
        personId: number,
        dailyWithdrawalLimit: number,
        accountType: number
    ): Account {
        // Validate person exists
        const person = this.db.getPerson(personId);
        if (!person) {
            throw new BusinessException(
                ErrorCodes.PERSON_NOT_FOUND,
                `Person with ID ${personId} not found`,
                404
            );
        }

        // Validate inputs
        if (dailyWithdrawalLimit < 0) {
            throw new BusinessException(
                ErrorCodes.INVALID_DAILY_LIMIT,
                'Daily withdrawal limit cannot be negative',
                400
            );
        }

        if (accountType <= 0) {
            throw new BusinessException(
                ErrorCodes.INVALID_ACCOUNT_TYPE,
                'Account type must be positive',
                400
            );
        }

        const account = this.db.createAccount(
            personId,
            dailyWithdrawalLimit,
            accountType
        );

        if (!account) {
            throw new BusinessException(
                ErrorCodes.ACCOUNT_CREATION_FAILED,
                'Failed to create account',
                500
            );
        }

        // Log transaction
        this.db.addTransaction(account.accountId, 0, 'DEPOSIT');

        return account;
  }

    getAccount(accountId: number): Account {
        const account = this.db.getAccount(accountId);
        if (!account) {
            throw new BusinessException(
                ErrorCodes.ACCOUNT_NOT_FOUND,
                `Account with ID ${accountId} not found`,
                404
            );
        }

        return account;
    }

    getBalance(accountId: number): number {
        const account = this.getAccount(accountId);
        return account.balance;
    }

    deposit(accountId: number, amount: number): Transaction {
        // Validate account exists and is active
        const account = this.getAccount(accountId);

        if (!account.activeFlag) {
            throw new BusinessException(
                ErrorCodes.ACCOUNT_INACTIVE,
                'Cannot perform operations on an inactive account',
                403
            );
        }

        // Validate amount
        if (amount <= 0) {
            throw new BusinessException(
                ErrorCodes.INVALID_AMOUNT,
                'Deposit amount must be positive',
                400
            );
        }

        // Update balance
        account.balance += amount;
        this.db.updateAccount(account);

        // Record transaction
        const transaction = this.db.addTransaction(
            accountId,
            amount,
            'DEPOSIT'
        );

        return transaction;
    }

    withdraw(accountId: number, amount: number): Transaction {
        // Validate account exists and is active
        const account = this.getAccount(accountId);

        if (!account.activeFlag) {
            throw new BusinessException(
                ErrorCodes.ACCOUNT_INACTIVE,
                'Cannot perform operations on an inactive account',
                403
            );
        }

        // Validate amount
        if (amount <= 0) {
            throw new BusinessException(
                ErrorCodes.INVALID_AMOUNT,
                'Withdrawal amount must be positive',
                400
            );
        }

        // Check insufficient balance
        if (account.balance < amount) {
            throw new BusinessException(
                ErrorCodes.INSUFFICIENT_BALANCE,
                `Insufficient balance. Available: ${account.balance}, Requested: ${amount}`,
                400,
                { balance: account.balance, requested: amount }
            );
        }

        // Check daily withdrawal limit
        const dailyTotal = this.db.getDailyWithdrawalTotal(
            accountId,
            new Date()
        );

        if (dailyTotal + amount > account.dailyWithdrawalLimit) {
            throw new BusinessException(
                ErrorCodes.DAILY_LIMIT_EXCEEDED,
                `Daily withdrawal limit exceeded. Limit: ${account.dailyWithdrawalLimit}, Total today: ${dailyTotal}, Requested: ${amount}`,
                400,
                {
                    limit: account.dailyWithdrawalLimit,
                    usedToday: dailyTotal,
                    requested: amount,
                }
            );
        }

        // Update balance
        account.balance -= amount;
        this.db.updateAccount(account);

        // Record transaction
        const transaction = this.db.addTransaction(
            accountId,
            amount,
            'WITHDRAWAL'
        );

        return transaction;
    }

    blockAccount(accountId: number): Account {
        const account = this.getAccount(accountId);

        if (!account.activeFlag) {
            throw new BusinessException(
                ErrorCodes.ACCOUNT_ALREADY_BLOCKED,
                'Account is already blocked',
                400
            );
        }

        const success = this.db.deactivateAccount(accountId);
        if (!success) {
            throw new BusinessException(
                ErrorCodes.BLOCK_ACCOUNT_FAILED,
                'Failed to block account',
                500
            );
        }

        return this.getAccount(accountId);
    }

    unblockAccount(accountId: number): Account {
        const account = this.getAccount(accountId);

        if (account.activeFlag) {
            throw new BusinessException(
                ErrorCodes.ACCOUNT_ALREADY_ACTIVE,
                'Account is already active',
                400
            );
        }

        account.activeFlag = true;
        this.db.updateAccount(account);

        return account;
    }

    getStatement(
        accountId: number,
        startDate?: Date,
        endDate?: Date
    ): StatementResponse {
        const account = this.getAccount(accountId);
        const person = this.db.getPerson(account.personId);

        if (!person) {
            throw new BusinessException(
                ErrorCodes.PERSON_NOT_FOUND,
                'Associated person not found',
                404
            );
        }

        const transactions = this.db.getAccountTransactions(
            accountId,
            startDate,
            endDate
        );

        // Sort by date descending
        transactions.sort(
            (a, b) =>
                new Date(b.transactionDate).getTime() -
                new Date(a.transactionDate).getTime()
        );

        return {
            accountId,
            accountHolder: person.name,
            balance: account.balance,
            transactions,
            statementPeriod: {
                startDate: startDate || new Date('2000-01-01'),
                endDate: endDate || new Date(),
            },
        };
    }
}

export class PersonService {
    private db: Database;

    constructor() {
        this.db = Database.getInstance();
    }

    createPerson(
        name: string,
        document: string,
        birthDate: Date
    ): Person {
        // Validate inputs
        if (!name || name.trim().length === 0) {
            throw new BusinessException(
                ErrorCodes.INVALID_NAME,
                'Name cannot be empty',
                400
            );
        }

        if (!document || document.trim().length === 0) {
            throw new BusinessException(
                ErrorCodes.INVALID_DOCUMENT,
                'Document cannot be empty',
                400
            );
        }

        if (!birthDate || isNaN(birthDate.getTime())) {
            throw new BusinessException(
                ErrorCodes.INVALID_BIRTHDATE,
                'Invalid birth date',
                400
            );
        }

        return this.db.createPerson(name, document, birthDate);
    }

    getPerson(personId: number): Person {
        const person = this.db.getPerson(personId);
        if (!person) {
            throw new BusinessException(
                ErrorCodes.PERSON_NOT_FOUND,
                `Person with ID ${personId} not found`,
                404
            );
        }

        return person;
    }
}