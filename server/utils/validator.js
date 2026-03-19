/**
 * Centralized Validation Utility for CMS
 */
class Validator {
    /**
     * Validates a username (4-16 alphanumeric characters)
     */
    isValidUsername(username) {
        return /^[a-zA-Z0-9]{4,16}$/.test(username);
    }

    /**
     * Validates an email address
     */
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /**
     * Validates a password (min 5 characters)
     */
    isValidPassword(password) {
        return password && password.length >= 8;
    }

    /**
     * Validates a social ID / deletion code (7 digits)
     */
    isValidSocialId(socialId) {
        return /^[0-9]{7}$/.test(socialId);
    }

    /**
     * Common validation runner for registration
     */
    validateRegistration(data) {
        const { registerSchema } = require('../modules/auth/validation');
        const { error } = registerSchema.validate(data);
        if (error) return error.details[0].message;
        return null; // No error
    }
}

module.exports = new Validator();
