export interface Person {
    personId: number;
    name: string;
    document: string;
    birthDate: Date;
}

export interface Account {
    accountId: number;
    personId: number;
    balance: number;
    dailyWithdrawalLimit: number;
    activeFlag: boolean;
    accountType: number;
    createDate: Date;
}

export interface Transaction {
    transactionId: number;
    accountId: number;
    value: number;
    transactionDate: Date;
    type: 'DEPOSIT' | 'WITHDRAWAL';
}

export interface StatementRequest {
    accountId: number;
    startDate?: Date;
    endDate?: Date;
}

export interface StatementResponse {
    accountId: number;
    accountHolder: string;
    balance: number;
    transactions: Transaction[];
    statementPeriod: {
        startDate: Date;
        endDate: Date;
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
}

export class BusinessException extends Error {
    constructor(
        public code: string,
        public message: string,
        public statusCode: number = 400,
        public details?: Record<string, unknown>
    ) {
        super(message);
        Object.setPrototypeOf(this, BusinessException.prototype);
    }
}

export const ErrorCodes = {
    PERSON_NOT_FOUND: 'PERSON_NOT_FOUND',
    ACCOUNT_NOT_FOUND: 'ACCOUNT_NOT_FOUND',
    INVALID_PERSON_DATA: 'INVALID_PERSON_DATA',
    INVALID_AMOUNT: 'INVALID_AMOUNT',
    INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
    DAILY_LIMIT_EXCEEDED: 'DAILY_LIMIT_EXCEEDED',
    ACCOUNT_BLOCKED: 'ACCOUNT_BLOCKED',
    ACCOUNT_ALREADY_BLOCKED: 'ACCOUNT_ALREADY_BLOCKED',
    INVALID_REQUEST: 'INVALID_REQUEST',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    INVALID_DAILY_LIMIT: 'INVALID_DAILY_LIMIT',
    INVALID_ACCOUNT_TYPE: 'INVALID_ACCOUNT_TYPE',
    ACCOUNT_CREATION_FAILED: 'ACCOUNT_CREATION_FAILED',
    ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
    BLOCK_ACCOUNT_FAILED: 'BLOCK_ACCOUNT_FAILED',
    ACCOUNT_ALREADY_ACTIVE: 'ACCOUNT_ALREADY_ACTIVE',
    INVALID_NAME: 'INVALID_NAME',
    INVALID_DOCUMENT: 'INVALID_DOCUMENT',
    INVALID_BIRTHDATE: 'INVALID_BIRTHDATE',
} as const;