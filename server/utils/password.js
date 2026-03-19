const crypto = require('crypto');

const bcrypt = require('bcrypt');

/**
 * Metin2 Password Hashing (Equivalent to MySQL PASSWORD() and CMSLite hashPassword)
 * @param {string} password 
 * @returns {string} Hashed password starting with *
 */
function hashPassword(password) {
    const rawSha1 = crypto.createHash('sha1').update(password).digest();
    const hexSha1 = crypto.createHash('sha1').update(rawSha1).digest('hex');
    return '*' + hexSha1.toUpperCase();
}

/**
 * Modern Bcrypt Hashing
 * @param {string} password 
 * @returns {Promise<string>}
 */
async function bcryptHash(password) {
    return bcrypt.hash(password, 10);
}

module.exports = { hashPassword, bcryptHash };
