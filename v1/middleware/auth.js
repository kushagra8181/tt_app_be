const { createClient } = require('@supabase/supabase-js/dist/index.cjs');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const refreshToken = req.headers['x-refresh-token'];
        
        if (!token) return res.status(401).json({ error: 'No token provided' });

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (!error && user) {
            req.user = user;
            return next();
        }

        if (!refreshToken) return res.status(401).json({ error: 'Token expired, no refresh token provided' });

        const { data, error: refreshError } = await supabase.auth.refreshSession({ 
            refresh_token: refreshToken 
        });

        if (refreshError || !data.session) {
            return res.status(401).json({ error: 'Session expired, please login again' });
        }

        res.setHeader('x-new-access-token', data.session.access_token);
        res.setHeader('x-new-refresh-token', data.session.refresh_token);

        req.user = data.user;
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = { verifyToken };
