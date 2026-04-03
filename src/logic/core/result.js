/**
 * Standard Result pattern implementation for the application.
 * Consistent with Staff Engineering Law of Resilience.
 */

export const success = (value) => ({
    isSuccess: true,
    isFailure: false,
    value,
    error: null
});

export const failure = (message, code) => ({
    isSuccess: false,
    isFailure: true,
    value: null,
    error: { message, code }
});
