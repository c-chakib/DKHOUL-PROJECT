const sanitize = (obj) => {
    if (obj instanceof Object) {
        for (const key in obj) {
            // Remove keys starting with $ (MongoDB operators)
            if (/^\$/.test(key)) {
                console.warn(`[Security] Potential NoSQL Injection detected. Removing key: ${key}`);
                delete obj[key];
            } else {
                sanitize(obj[key]);
            }
        }
    }
    return obj;
};

module.exports = (req, res, next) => {
    req.body = sanitize(req.body);
    req.query = sanitize(req.query);
    req.params = sanitize(req.params);
    next();
};
