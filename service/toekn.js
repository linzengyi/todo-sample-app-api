import jwt from 'jsonwebtoken';

export const TOKEN_TYPE = {
    ACCESS_TOKEN: 'ACCESS_TOEKN',
    REFRESH_TOKEN: 'REFRESH_TOKEN'
};


export function generateToken(type, user) {
    let token = '';
    if (type === TOKEN_TYPE.ACCESS_TOKEN) {
        token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
    } else {
        token = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '5m' });
    }

    return token;
}