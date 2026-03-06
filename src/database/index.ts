import { Account, BusinessException, ErrorCodes, Person, Transaction } from '../types';

export class Database {
    private static instance: Database;

    private persons: Map<number, Person> = new Map();
    private accounts: Map<number, Account> = new Map();
    private transactions: Map<number, Transaction> = new Map();

    private accountCounter: number = 1;
    private transactionCounter: number = 1;
    private personCounter: number = 1;

    private constructor() {
        this.initializeSampleData();
    }

    static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }

        return Database.instance;
    }

    private initializeSampleData(): void {
        // Mock person
        const person: Person = {
            personId: 1,
            name: 'Israel Israeli',
            document: '12345678900',
            birthDate: new Date('1999-01-01'),
        };

        this.persons.set(person.personId, person);
        this.personCounter = 2;

        // Mock account
        const account: Account = {
            accountId: 1,
            personId: 1,
            balance: 5000.0,
            dailyWithdrawalLimit: 2000.0,
            activeFlag: true,
            accountType: 1,
            createDate: new Date('2020-01-01'),
        };

        this.accounts.set(account.accountId, account);
        this.accountCounter = 2;

        // Mock transaction
        const transaction: Transaction = {
            transactionId: 1,
            accountId: 1,
            value: 5000.0,
            transactionDate: new Date('2020-01-01'),
            type: 'DEPOSIT',
        };

        this.transactions.set(transaction.transactionId, transaction);
        this.transactionCounter = 2;
    }

    // Person operations
    createPerson(name: string, document: string, birthDate: Date): Person {
        const person: Person = {
            personId: this.personCounter++,
            name,
            document,
            birthDate,
        };

        this.persons.set(person.personId, person);
        return person;
    }

    getPerson(personId: number): Person | undefined {
        const person = this.persons.get(personId);
        if (!person) {
            throw new BusinessException(
                ErrorCodes.PERSON_NOT_FOUND,
                `Person with ID ${personId} not found`,
                404
            );
        }

        return person;
    }

    // Account operations
    createAccount(
        personId: number,
        dailyWithdrawalLimit: number,
        accountType: number
    ): Account | null {
        if (!this.persons.has(personId)) {
            return null;
        }

        const account: Account = {
            accountId: this.accountCounter++,
            personId,
            balance: 0,
            dailyWithdrawalLimit,
            activeFlag: true,
            accountType,
            createDate: new Date(),
        };
        
        this.accounts.set(account.accountId, account);
        return account;
    }

    getAccount(accountId: number): Account | undefined {
        const account = this.accounts.get(accountId);
        if (!account) {
            throw new BusinessException(
                ErrorCodes.ACCOUNT_NOT_FOUND,
                `Account with ID ${accountId} not found`,
                404
            );
        }

        return account;
    }

    getAllAccounts(): Account[] {
        return Array.from(this.accounts.values());
    }

    updateAccount(account: Account): void {
        this.accounts.set(account.accountId, account);
    }

    deactivateAccount(accountId: number): boolean {
        const account = this.accounts.get(accountId);
        if (account) {
            account.activeFlag = false;
            this.accounts.set(accountId, account);
            return true;
        }

        return false;
    }

    // Transaction operations
    addTransaction(
        accountId: number,
        value: number,
        type: 'DEPOSIT' | 'WITHDRAWAL'
    ): Transaction {
        const transaction: Transaction = {
            transactionId: this.transactionCounter++,
            accountId,
            value,
            transactionDate: new Date(),
            type,
        };

        this.transactions.set(transaction.transactionId, transaction);
        return transaction;
    }

    getAccountTransactions(
        accountId: number,
        startDate?: Date,
        endDate?: Date
    ): Transaction[] {
        return Array.from(this.transactions.values()).filter((t) => {
            if (t.accountId !== accountId) return false;
            if (startDate && t.transactionDate < startDate) return false;
            if (endDate && t.transactionDate > endDate) return false;
            return true;
        });
    }

    getTransaction(transactionId: number): Transaction | undefined {
        return this.transactions.get(transactionId);
    }

    // DailyWithdrawal tracking
    getDailyWithdrawalTotal(accountId: number, date: Date): number {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return Array.from(this.transactions.values())
            .filter((t) => {
                return (
                    t.accountId === accountId &&
                    t.type === 'WITHDRAWAL' &&
                    t.transactionDate >= startOfDay &&
                    t.transactionDate <= endOfDay
                );
            })
            .reduce((sum, t) => sum + t.value, 0);
    }
}
