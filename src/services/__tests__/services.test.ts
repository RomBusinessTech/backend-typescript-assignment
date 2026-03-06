import { AccountService, PersonService } from '../../services';
import { BusinessException } from '../../types';

describe('AccountService', () => {
    let accountService: AccountService;
    let personService: PersonService;

    beforeEach(() => {
        // Reset Database data for clean tests
        jest.resetModules();
        accountService = new AccountService();
        personService = new PersonService();
    });

    describe('createAccount', () => {
        it('create an account successfully', () => {
            const person = personService.createPerson(
                'Test Testing',
                '98765432100',
                new Date('1999-01-01')
            );

            const account = accountService.createAccount(person.personId, 1000, 1);

            expect(account).toBeDefined();
            expect(account.personId).toBe(person.personId);
            expect(account.balance).toBe(0);
            expect(account.dailyWithdrawalLimit).toBe(1000);
            expect(account.activeFlag).toBe(true);
        });

        it('throw error for non-existent person', () => {
            expect(() => {
                accountService.createAccount(9999, 1000, 1);
            }).toThrow(BusinessException);
        });

        it('throw error for negative daily limit', () => {
            const person = personService.createPerson(
                'Test Testing',
                '98765432100',
                new Date('1999-01-01')
            );

            expect(() => {
                accountService.createAccount(person.personId, -500, 1);
            }).toThrow(BusinessException);
        });
    });

    describe('getBalance', () => {
        it('return account balance', () => {
            const person = personService.createPerson(
                'Test Testing',
                '98765432100',
                new Date('1999-01-01')
            );

            const account = accountService.createAccount(person.personId, 1000, 1);
            const balance = accountService.getBalance(account.accountId);

            expect(balance).toBe(0);
        });

        it('throw error for non-existent account', () => {
            expect(() => {
                accountService.getBalance(9999);
            }).toThrow(BusinessException);
        });
    });

    describe('deposit', () => {
        it('successfully deposit money', () => {
            const person = personService.createPerson(
                'Test Testing',
                '98765432100',
                new Date('1999-01-01')
            );

            const account = accountService.createAccount(person.personId, 1000, 1);
            const transaction = accountService.deposit(account.accountId, 500);

            expect(transaction).toBeDefined();
            expect(transaction.value).toBe(500);
            expect(transaction.type).toBe('DEPOSIT');

            const updatedBalance = accountService.getBalance(account.accountId);
            expect(updatedBalance).toBe(500);
        });

        it('throw error for negative deposit', () => {
            const person = personService.createPerson(
                'Test Testing',
                '98765432100',
                new Date('1999-01-01')
            );

            const account = accountService.createAccount(person.personId, 1000, 1);

            expect(() => {
                accountService.deposit(account.accountId, -100);
            }).toThrow(BusinessException);
        });

        it('throw error on inactive account', () => {
            const person = personService.createPerson(
                'Test Testing',
                '98765432100',
                new Date('1999-01-01')
            );

            const account = accountService.createAccount(person.personId, 1000, 1);
            accountService.blockAccount(account.accountId);

            expect(() => {
                accountService.deposit(account.accountId, 500);
            }).toThrow(BusinessException);
        });
    });

    describe('withdraw', () => {
        it('successfully withdraw money', () => {
            const person = personService.createPerson(
                'Test Testing',
                '98765432100',
                new Date('1999-01-01')
            );

            const account = accountService.createAccount(person.personId, 1000, 1);
            accountService.deposit(account.accountId, 1000);

            const transaction = accountService.withdraw(account.accountId, 500);

            expect(transaction).toBeDefined();
            expect(transaction.value).toBe(500);
            expect(transaction.type).toBe('WITHDRAWAL');

            const updatedBalance = accountService.getBalance(account.accountId);
            expect(updatedBalance).toBe(500);
        });

        it('throw error for insufficient balance', () => {
            const person = personService.createPerson(
                'Test Testing',
                '98765432100',
                new Date('1999-01-01')
            );

            const account = accountService.createAccount(person.personId, 1000, 1);
            accountService.deposit(account.accountId, 100);

            expect(() => {
                accountService.withdraw(account.accountId, 500);
            }).toThrow(BusinessException);
        });

        it('throw error when exceeding daily limit', () => {
            const person = personService.createPerson(
                'Test Testing',
                '98765432100',
                new Date('1999-01-01')
            );

            const account = accountService.createAccount(person.personId, 500, 1);
            accountService.deposit(account.accountId, 2000);

            expect(() => {
                accountService.withdraw(account.accountId, 600);
            }).toThrow(BusinessException);
        });

        it('allow multiple withdrawals within daily limit', () => {
            const person = personService.createPerson(
                'Test Testing',
                '98765432100',
                new Date('1999-01-01')
            );

            const account = accountService.createAccount(person.personId, 1500, 1);
            accountService.deposit(account.accountId, 2000);

            accountService.withdraw(account.accountId, 500);
            accountService.withdraw(account.accountId, 600);

            const balance = accountService.getBalance(account.accountId);
            expect(balance).toBe(900);
        });

        it('throw error on inactive account', () => {
            const person = personService.createPerson(
                'Test Testing',
                '98765432100',
                new Date('1999-01-01')
            );

            const account = accountService.createAccount(person.personId, 1000, 1);
            accountService.deposit(account.accountId, 1000);
            accountService.blockAccount(account.accountId);

            expect(() => {
                accountService.withdraw(account.accountId, 500);
            }).toThrow(BusinessException);
        });
    });

    describe('blockAccount', () => {
        it('block an active account', () => {
            const person = personService.createPerson(
                'Test Testing',
                '98765432100',
                new Date('1999-01-01')
            );

            const account = accountService.createAccount(person.personId, 1000, 1);
            const blockedAccount = accountService.blockAccount(account.accountId);

            expect(blockedAccount.activeFlag).toBe(false);
        });

        it('throw error when blocking already blocked account', () => {
            const person = personService.createPerson(
                'Test Testing',
                '98765432100',
                new Date('1999-01-01')
            );

            const account = accountService.createAccount(person.personId, 1000, 1);
            accountService.blockAccount(account.accountId);

            expect(() => {
                accountService.blockAccount(account.accountId);
            }).toThrow(BusinessException);
        });
    });

    describe('getStatement', () => {
        it('return statement with all transactions', () => {
            const person = personService.createPerson(
                'Test Testing',
                '98765432100',
                new Date('1999-01-01')
            );

            const account = accountService.createAccount(person.personId, 1000, 1);
            accountService.deposit(account.accountId, 500);
            accountService.withdraw(account.accountId, 100);

            const statement = accountService.getStatement(account.accountId);

            expect(statement).toBeDefined();
            expect(statement.accountId).toBe(account.accountId);
            expect(statement.accountHolder).toBe(person.name);
            expect(statement.balance).toBe(400);
            expect(statement.transactions.length).toBeGreaterThan(0);
        });

        it('filter transactions by date range', () => {
            const person = personService.createPerson(
                'Test Testing',
                '98765432100',
                new Date('1999-01-01')
            );

            const account = accountService.createAccount(person.personId, 1000, 1);
            accountService.deposit(account.accountId, 500);

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 1);
            const endDate = new Date();

            const statement = accountService.getStatement(
                account.accountId,
                startDate,
                endDate
            );

            expect(statement.transactions.length).toBeGreaterThan(0);
        });
    });
});

describe('PersonService', () => {
    let personService: PersonService;

    beforeEach(() => {
        jest.resetModules();
        personService = new PersonService();
    });

    describe('createPerson', () => {
        it('create a person successfully', () => {
            const person = personService.createPerson(
                'Test Testing',
                '98765432100',
                new Date('1999-01-01')
            );

            expect(person).toBeDefined();
            expect(person.name).toBe('Test Testing');
            expect(person.document).toBe('98765432100');
        });

        it('throw error for empty name', () => {
            expect(() => {
                personService.createPerson('', '11122233344', new Date('1990-06-20'));
            }).toThrow(BusinessException);
        });

        it('throw error for empty document', () => {
            expect(() => {
                personService.createPerson('Test Testing', '', new Date('1990-06-20'));
            }).toThrow(BusinessException);
        });

        it('throw error for invalid birthdate', () => {
            expect(() => {
                personService.createPerson('Test Testing', '98765432100', new Date('invalid'));
            }).toThrow(BusinessException);
        });
    });

    describe('getPerson', () => {
        it('retrieve a person by ID', () => {
            const person = personService.createPerson(
                'Test Testing',
                '98765432100',
                new Date('1999-01-01')
            );

            const retrieved = personService.getPerson(person.personId);

            expect(retrieved).toBeDefined();
            expect(retrieved.name).toBe(person.name);
        });

        it('throw error for non-existent person', () => {
            expect(() => {
                personService.getPerson(9999);
            }).toThrow(BusinessException);
        });
    });
});
