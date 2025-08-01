const checkAuth = (req, res, next) => {
    const authPaths = ['/auth/login', '/auth/register', '/auth/google', '/auth/github', '/auth/google/callback', '/auth/github/callback']
    if (authPaths.includes(req.path)) {return next()}
    if (!req.isAuthenticated()) {return res.status(401).json({ code: '006' })}
    return next()
}

const permissions = {
    user: [
        'create_post', 
        'edit_own_profile', 
        'edit_own_post', 
        'delete_own_post', 
        'delete_own_reaction',
        'delete_own_comment'],
    admin: [
        'create_post', 
        'edit_any_profile', 
        'ban_any_user', 
        'delete_any_post', 
        'delete_own_reaction',
        'delete_any_comment'],
    banned: []
};

const can = (action, user, resource = null) => {
    const rolePerms = permissions[user?.role] || [];

    // Handle '_own_' actions
    if (action.includes('_own_') && resource) {
        const [verb, scope, type] = action.split('_'); // e.g., 'edit_own_post'
        if (resource.authorID?.toString?.() === user?._id?.toString?.()) {
            return rolePerms.includes(action);
        }
        return false;
    }

    // General permission check
    return rolePerms.includes(action);
};

const authorize = (actions, resourceFetcher = null) => {
    return async function (req, res, next) {
        try {
            const user = req.user;

            let resource = null;
            if (typeof resourceFetcher === 'function') {
                resource = await resourceFetcher(req);
            }

            const isAllowed = actions.some(action => can(action, user, resource));


            if (isAllowed) {
                return next();
            } else {
                return res.status(403).json({ code: '403', data: 'Forbidden: insufficient permissions' });
            }
        } catch (err) {
            return res.status(500).json({ code: '550', data: 'Server error during authorization' });
        }
    };
};



module.exports = { checkAuth, authorize }