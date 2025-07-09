const checkAuth = (req, res, next) => {
    const authPaths = ['/auth/login', '/auth/register', '/auth/google', '/auth/github', '/auth/google/callback', '/auth/github/callback']
    if (authPaths.includes(req.path)) {return next()}
    if (!req.isAuthenticated()) {return res.status(401).json({ code: '006' })}
    return next()
}

const authorize = (req, res, next) => {
    next()
}


module.exports = { checkAuth, authorize }