import jwt from 'jsonwebtoken';

export const tokenDecodeMiddware = (req, res, next) => {
    const authorization = req.headers['authorization'];

    const token = authorization && authorization.split(' ')[1];

    if (token) {
        try {
            let secret = process.env.ACCESS_TOKEN_SECRET;

            if (req.url === '/api/auth/token' && req.method === 'POST') {
                secret = process.env.REFRESH_TOKEN_SECRET;
            }

            const decoded = jwt.verify(token, secret);
        
            req.user = decoded; 
        } catch(err) {
            console.log('--- tokenDecodeMiddware target error ---');
            console.log(err);
            if ((req.url === '/api/auth/logout' && req.method === 'DELETE') ||
                (req.url === '/api/auth/token' && req.method === 'POST')) {
                next();
                return;
            }

            return res.status(401).json({ message: err.message });
        }
    }

    next();
};