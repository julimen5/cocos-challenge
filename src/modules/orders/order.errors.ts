import { AppError } from "../shared/errors";

export class OrderError extends AppError {
    constructor(message: string, code: string) {
        super(message, code);
        this.name = 'OrderError';
    }
}