const Joi = require('joi');

const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(4).max(16).required().messages({
        'string.alphanum': 'Der Benutzername darf nur aus Buchstaben und Zahlen bestehen.',
        'string.min': 'Der Benutzername muss mindestens 4 Zeichen lang sein.',
        'string.max': 'Der Benutzername darf maximal 16 Zeichen lang sein.',
        'any.required': 'Benutzername ist erforderlich.'
    }),
    real_name: Joi.string().min(2).max(64).required().messages({
        'string.min': 'Bitte gib deinen vollständigen Namen an.',
        'any.required': 'Der richtige Name ist erforderlich.'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Bitte eine gültige E-Mail-Adresse angeben.',
        'any.required': 'E-Mail ist erforderlich.'
    }),
    confirmEmail: Joi.string().valid(Joi.ref('email')).required().messages({
        'any.only': 'Die E-Mail-Adressen stimmen nicht überein.',
        'any.required': 'E-Mail-Bestätigung ist erforderlich.'
    }),
    password: Joi.string().min(8).max(32).required().messages({
        'string.min': 'Das Passwort muss mindestens 8 Zeichen lang sein.',
        'any.required': 'Passwort ist erforderlich.'
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Die Passwörter stimmen nicht überein.',
        'any.required': 'Passwort-Bestätigung ist erforderlich.'
    }),
    social_id: Joi.string().length(7).pattern(/^[0-9]+$/).required().messages({
        'string.length': 'Die Social-ID (Löschcode) muss genau 7 Ziffern lang sein.',
        'string.pattern.base': 'Die Social-ID darf nur aus Zahlen bestehen.'
    }),
    question1: Joi.number().integer().min(1).max(5).required().messages({
        'any.required': 'Sicherheitsfrage ist erforderlich.'
    }),
    answer1: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Die Antwort ist zu kurz.',
        'any.required': 'Sicherheitsantwort ist erforderlich.'
    })
});

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

const updatePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(32).required(),
    confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
        'any.only': 'Die Passwörter stimmen nicht überein.',
        'any.required': 'Passwort-Bestätigung ist erforderlich.'
    })
});

const updateSecurityQuestionSchema = Joi.object({
    password: Joi.string().required(),
    question1: Joi.number().integer().min(1).max(5).required().messages({
        'any.required': 'Sicherheitsfrage ist erforderlich.'
    }),
    answer1: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Die Antwort ist zu kurz.',
        'any.required': 'Sicherheitsantwort ist erforderlich.'
    })
});

module.exports = {
    registerSchema,
    loginSchema,
    updatePasswordSchema,
    updateSecurityQuestionSchema
};
