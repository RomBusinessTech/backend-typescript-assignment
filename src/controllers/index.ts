import { Request, Response } from 'express';
import { AccountService, PersonService } from '../services';
import { ApiResponse, BusinessException } from '../types';

interface AccountParams {
  accountId: string;
}

export class AccountController {
    private accountService: AccountService;
    private personService: PersonService;

    constructor() {
        this.accountService = new AccountService();
        this.personService = new PersonService();
    }

    createAccount = (req: Request, res: Response): void => {
        try {
            const { personId, dailyWithdrawalLimit, accountType } = req.body;

            // Validation
            if (personId === undefined) {
                res.status(400).json({
                    success: false,
                    error: { 
                        code: 'MISSING_FIELD', 
                        message: 'personId is required' 
                    },
                } as ApiResponse<null>);

                return;
            }

            if (dailyWithdrawalLimit === undefined) {
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'MISSING_FIELD',
                        message: 'dailyWithdrawalLimit is required',
                    },
                } as ApiResponse<null>);

                return;
            }

            if (accountType === undefined) {
                res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELD', message: 'accountType is required' },
                } as ApiResponse<null>);

                return;
            }

            const account = this.accountService.createAccount(
                personId,
                dailyWithdrawalLimit,
                accountType
            );

            res.status(201).json({
                success: true,
                data: account,
            } as ApiResponse<typeof account>);
        } catch (error) {
            this.handleError(error, res);
        }
    };

    getBalance = (req: Request<AccountParams>, res: Response): void => {
        try {
            const { accountId } = req.params;

            if (!accountId) {
                res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELD', message: 'accountId is required' },
                } as ApiResponse<null>);

                return;
            }

            const balance = this.accountService.getBalance(parseInt(accountId));

            res.status(200).json({
                success: true,
                data: { balance },
            } as ApiResponse<{ balance: number }>);
        } catch (error) {
            this.handleError(error, res);
        }
    };

    deposit = (req: Request<AccountParams>, res: Response): void => {
        try {
            const { accountId } = req.params;
            const { amount } = req.body;

            if (!accountId) {
                res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELD', message: 'accountId is required' },
                } as ApiResponse<null>);

                return;
            }

            if (amount === undefined) {
                res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELD', message: 'amount is required' },
                } as ApiResponse<null>);

                return;
            }

            const transaction = this.accountService.deposit(
                parseInt(accountId),
                amount
            );
            const account = this.accountService.getAccount(parseInt(accountId));

            res.status(200).json({
                success: true,
                data: { transaction, account },
            } as ApiResponse<{ transaction: typeof transaction; account: typeof account }>);
        } catch (error) {
            this.handleError(error, res);
        }
    };

    withdraw = (req: Request<AccountParams>, res: Response): void => {
        try {
            const { accountId } = req.params;
            const { amount } = req.body;

            if (!accountId) {
                res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELD', message: 'accountId is required' },
                } as ApiResponse<null>);

                return;
            }

            if (amount === undefined) {
                res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELD', message: 'amount is required' },
                } as ApiResponse<null>);

                return;
            }

            const transaction = this.accountService.withdraw(
                parseInt(accountId),
                amount
            );
            const account = this.accountService.getAccount(parseInt(accountId));

            res.status(200).json({
                success: true,
                data: { transaction, account },
            } as ApiResponse<{ transaction: typeof transaction; account: typeof account }>);
        } catch (error) {
            this.handleError(error, res);
        }
    };

    blockAccount = (req: Request<AccountParams>, res: Response): void => {
        try {
            const { accountId } = req.params;

            if (!accountId) {
                res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELD', message: 'accountId is required' },
                } as ApiResponse<null>);

                return;
            }

            const account = this.accountService.blockAccount(parseInt(accountId));

            res.status(200).json({
                success: true,
                data: account,
            } as ApiResponse<typeof account>);
        } catch (error) {
            this.handleError(error, res);
        }
    };

    unblockAccount = (req: Request<AccountParams>, res: Response): void => {
        try {
            const { accountId } = req.params;

            if (!accountId) {
                res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELD', message: 'accountId is required' },
                } as ApiResponse<null>);

                return;
            }

            const account = this.accountService.unblockAccount(parseInt(accountId));

            res.status(200).json({
                success: true,
                data: account,
            } as ApiResponse<typeof account>);
        } catch (error) {
            this.handleError(error, res);
        }
    };

    getStatement = (req: Request<AccountParams>, res: Response): void => {
        try {
            const { accountId } = req.params;
            const { startDate, endDate } = req.query;

            if (!accountId) {
                res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELD', message: 'accountId is required' },
                } as ApiResponse<null>);

                return;
            }

            let parsedStartDate: Date | undefined;
            let parsedEndDate: Date | undefined;

            if (startDate && typeof startDate === 'string') {
                parsedStartDate = new Date(startDate);

                if (isNaN(parsedStartDate.getTime())) {
                    res.status(400).json({
                        success: false,
                        error: {
                            code: 'INVALID_DATE',
                            message: 'Invalid startDate format. Use ISO 8601 format',
                        },
                    } as ApiResponse<null>);

                    return;
                }
            }

            if (endDate && typeof endDate === 'string') {
                parsedEndDate = new Date(endDate);

                if (isNaN(parsedEndDate.getTime())) {
                    res.status(400).json({
                        success: false,
                        error: {
                            code: 'INVALID_DATE',
                            message: 'Invalid endDate format. Use ISO 8601 format',
                        },
                    } as ApiResponse<null>);

                    return;
                }
            }

            const statement = this.accountService.getStatement(
                parseInt(accountId),
                parsedStartDate,
                parsedEndDate
            );

            res.status(200).json({
                success: true,
                data: statement,
            } as ApiResponse<typeof statement>);
        } catch (error) {
            this.handleError(error, res);
        }
    };

    private handleError(error: unknown, res: Response): void {
        if (error instanceof BusinessException) {
            res.status(error.statusCode).json({
                success: false,
                error: {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                },
            } as ApiResponse<null>);
        } else {
            console.error('Unexpected error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'An unexpected error occurred',
                },
            } as ApiResponse<null>);
        }
    }
}

export class PersonController {
    private personService: PersonService;

    constructor() {
        this.personService = new PersonService();
    }

    createPerson = (req: Request, res: Response): void => {
        try {
            const { name, document, birthDate } = req.body;

            if (!name) {
                res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELD', message: 'name is required' },
                } as ApiResponse<null>);

                return;
            }

            if (!document) {
                res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELD', message: 'document is required' },
                } as ApiResponse<null>);

                return;
            }

            if (!birthDate) {
                res.status(400).json({
                    success: false,
                    error: { code: 'MISSING_FIELD', message: 'birthDate is required' },
                } as ApiResponse<null>);

                return;
            }

            const person = this.personService.createPerson(
                name,
                document,
                new Date(birthDate)
            );

            res.status(201).json({
                success: true,
                data: person,
            } as ApiResponse<typeof person>);
        } catch (error) {
            this.handleError(error, res);
        }
    };

    private handleError(error: unknown, res: Response): void {
        if (error instanceof BusinessException) {
            res.status(error.statusCode).json({
                success: false,
                error: {
                    code: error.code,
                    message: error.message,
                    details: error.details,
                },
            } as ApiResponse<null>);
        } else {
            console.error('Unexpected error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'An unexpected error occurred',
                },
            } as ApiResponse<null>);
        }
    }
}
