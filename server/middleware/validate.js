/**
 * Joi Validation Middleware
 * Ensures req.body, req.query, or req.params match a given schema.
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true,
            allowUnknown: true
        });

        if (error) {
            const details = error.details.map(i => i.message).join(', ');
            return res.status(400).json({
                success: false,
                message: 'Ungültige Eingabedaten.',
                details: details
            });
        }
        
        next();
    };
};

module.exports = validate;
