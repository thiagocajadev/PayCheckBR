/**
 * Standard Result pattern implementation for the application.
 * Consistent with Staff Engineering Law of Resilience.
 */

const success = (value) => ({
    isSuccess: true,
    isFailure: false,
    value,
    error: null
});

const failure = (message, code) => ({
    isSuccess: false,
    isFailure: true,
    value: null,
    error: { message, code }
});

export {
    success,
    failure
};
