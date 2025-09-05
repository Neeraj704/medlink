const bcrypt = require('bcrypt');
const { createHash } = require('crypto');

const HASH_SALT_ROUNDS = 10;

const hashPassword = async (password) => {
    return bcrypt.hash(password, HASH_SALT_ROUNDS);
};

const comparePassword = async (password, hash) => {
    return bcrypt.compare(password, hash);
};

// Refresh tokens are not user-input, so a simple, fast, non-salted hash is acceptable for indexing.
// This prevents storing the raw token while still allowing fast lookups.
const hashToken = (token) => {
    return createHash('sha256').update(token).digest('hex');
};

module.exports = {
    hashPassword,
    comparePassword,
    hashToken,
};