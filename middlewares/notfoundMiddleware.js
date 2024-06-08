export const notfoundMiddleware = (req, res, next) => {
    const error = new Error('Request Not Found!');
    error.statusCode = 404;
    next(error);
};