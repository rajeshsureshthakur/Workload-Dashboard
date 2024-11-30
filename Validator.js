export class Validator {
    static validateNumber(value, options = {}) {
        const { min, max, required = true } = options;
        
        if (required && (value === null || value === undefined || value === '')) {
            throw new Error('Value is required');
        }

        const num = Number(value);
        if (isNaN(num)) {
            throw new Error('Value must be a number');
        }

        if (min !== undefined && num < min) {
            throw new Error(`Value must be greater than or equal to ${min}`);
        }

        if (max !== undefined && num > max) {
            throw new Error(`Value must be less than or equal to ${max}`);
        }

        return num;
    }

    static validateString(value, options = {}) {
        const { minLength, maxLength, pattern, required = true } = options;

        if (required && !value) {
            throw new Error('Value is required');
        }

        if (!required && !value) {
            return value;
        }

        if (minLength !== undefined && value.length < minLength) {
            throw new Error(`Value must be at least ${minLength} characters long`);
        }

        if (maxLength !== undefined && value.length > maxLength) {
            throw new Error(`Value must be no more than ${maxLength} characters long`);
        }

        if (pattern && !pattern.test(value)) {
            throw new Error('Value does not match the required pattern');
        }

        return value;
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email address');
        }
        return email;
    }

    static validateDate(value, options = {}) {
        const { min, max, required = true } = options;

        if (required && !value) {
            throw new Error('Date is required');
        }

        if (!required && !value) {
            return value;
        }

        const date = new Date(value);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }

        if (min && date < new Date(min)) {
            throw new Error(`Date must be after ${min}`);
        }

        if (max && date > new Date(max)) {
            throw new Error(`Date must be before ${max}`);
        }

        return date;
    }

    static validateArray(value, options = {}) {
        const { minLength, maxLength, itemValidator, required = true } = options;

        if (required && !Array.isArray(value)) {
            throw new Error('Value must be an array');
        }

        if (!required && !value) {
            return value;
        }

        if (minLength !== undefined && value.length < minLength) {
            throw new Error(`Array must contain at least ${minLength} items`);
        }

        if (maxLength !== undefined && value.length > maxLength) {
            throw new Error(`Array must contain no more than ${maxLength} items`);
        }

        if (itemValidator) {
            return value.map((item, index) => {
                try {
                    return itemValidator(item);
                } catch (error) {
                    throw new Error(`Invalid item at index ${index}: ${error.message}`);
                }
            });
        }

        return value;
    }
}

export function validateForm(formData, schema) {
    const errors = {};
    const validData = {};

    for (const [field, validator] of Object.entries(schema)) {
        try {
            validData[field] = validator(formData[field]);
        } catch (error) {
            errors[field] = error.message;
        }
    }

    if (Object.keys(errors).length > 0) {
        throw { errors, validData };
    }

    return validData;
}