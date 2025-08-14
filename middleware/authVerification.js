const checkAuth = (req, res, next) => {
    const authPaths = ['/auth/login', '/auth/register', '/auth/google', '/auth/github', '/auth/google/callback', '/auth/github/callback']
    if (authPaths.includes(req.path)) {return next()}
    if (!req.isAuthenticated()) {return res.status(401).json({ code: '006' })}
    return next()
}

const powerMap = {
    'deleted': -2,
    'restricted': -1,
    'user': 0,
    'moderator': 1,
    'admin': 2
}

const perms = {
    CREATE_POST: 'create_post',
    EDIT_OWN_POST: 'edit_own_post',
    EDIT_ANY_POST: 'edit_any_post',
    DELETE_OWN_POST: 'delete_own_post',
    DELETE_ANY_POST: 'delete_any_post',
    VIEW_POSTS: 'view_posts',

    MAKE_REACTION: 'make_reaction',
    DELETE_OWN_REACTION: 'delete_own_reaction',

    MAKE_COMMENT: 'make_comment',
    DELETE_OWN_COMMENT: 'delete_own_comment',
    EDIT_OWN_COMMENT: 'edit_own_comment',
    EDIT_ANY_COMMENT: 'edit_any_comment',
    DELETE_ANY_COMMENT: 'delete_any_comment',
    VIEW_COMMENTS: 'view_comments',

    EDIT_OWN_PROFILE: 'edit_own_profile',
    EDIT_ANY_PROFILE: 'edit_any_profile',

    RESTRICT_LEVEL_1: 'restrict_user_level_1',
    RESTRICT_LEVEL_2: 'restrict_user_level_2',
    RESTRICT_LEVEL_3: 'restrict_user_level_3'
}

const classified_permissions = {
    user: [
        perms.EDIT_OWN_PROFILE,

        perms.CREATE_POST,
        perms.EDIT_OWN_POST,
        perms.DELETE_OWN_POST,
        perms.VIEW_POSTS,

        perms.MAKE_REACTION,
        perms.DELETE_OWN_REACTION,

        perms.MAKE_COMMENT,
        perms.EDIT_OWN_COMMENT,
        perms.DELETE_OWN_COMMENT,
        perms.VIEW_COMMENTS,
    ],
    moderator: [
        perms.EDIT_OWN_PROFILE,

        perms.CREATE_POST,
        perms.EDIT_OWN_POST,
        perms.DELETE_OWN_POST,
        perms.DELETE_ANY_POST,
        perms.VIEW_POSTS,

        perms.MAKE_REACTION,
        perms.DELETE_OWN_REACTION,

        perms.MAKE_COMMENT,
        perms.EDIT_OWN_COMMENT,
        perms.DELETE_OWN_COMMENT,
        perms.DELETE_ANY_COMMENT,
        perms.VIEW_COMMENTS,
        
        perms.RESTRICT_LEVEL_1,
        perms.RESTRICT_LEVEL_2
    ],
    admin: Object.values(perms),
    restricted_l1: [
        perms.EDIT_OWN_PROFILE,
        perms.MAKE_COMMENT,
        perms.EDIT_OWN_COMMENT,
        perms.DELETE_OWN_COMMENT,
        perms.MAKE_REACTION,
        perms.DELETE_OWN_REACTION,

        perms.VIEW_COMMENTS,
        perms.VIEW_POSTS
    ],
    restricted_l2: [
        perms.EDIT_OWN_COMMENT,
        perms.MAKE_REACTION,
        perms.DELETE_OWN_REACTION,
        
        perms.VIEW_COMMENTS,
        perms.VIEW_POSTS
    ],
    restricted_l3: []
};

const can = (action, user, resource = null) => {
    const roleOfUserPerformingAction = user?.role
    let rolePerms = []
    if (roleOfUserPerformingAction == 'restricted') {
        rolePerms = classified_permissions[`restricted_l${user?.restrictionObject?.level}`] || []
    } else {
        rolePerms = classified_permissions[roleOfUserPerformingAction] || []
    }

    // Handle '_own_' actions
    if (action.includes('_own_') && resource) {
        if (resource.authorID?.toString?.() === user?._id?.toString?.()) {
            return rolePerms.includes(action);
        }
        return false;
    }

    // Handle '_any_' actions
    if (action.includes('_any_') && resource) {
        const ownerOfResource = resource?.authorID
        const roleOfOwnerOfResource = ownerOfResource?.role || 'deleted'

        if (powerMap[roleOfUserPerformingAction] <= powerMap[roleOfOwnerOfResource]) {
            return false
        }
        return true
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

const checkRestriction = () => {
    return async function (req, res, next) {
        const authPaths = ['/auth/login', '/auth/register', '/auth/google', '/auth/github', '/auth/google/callback', '/auth/github/callback']
        if (authPaths.includes(req.path)) {return next()}

        const user = req.user
        const restrictionObject = user?.restrictionObject
        const now = new Date();

        if (!restrictionObject) {
            return next()
        }

        if (restrictionObject.level > 0 && restrictionObject.expiresAt <= now) {
            restrictionObject.level = 0;
            restrictionObject.reason = null;
            restrictionObject.expiresAt = null
            user.role = 'user'
            await req.user.save()
        }

        next()
    }
}


module.exports = { checkAuth, authorize, checkRestriction }