const { createClient } = require("@supabase/supabase-js/dist/index.cjs");
const { uploadToS3, getPresignedUrl } = require('../utils/s3');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const bcrypt = require('bcrypt');


const SALT_ROUNDS = 10;

const userLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const { data: userData, error: dbError } = await supabase
            .from('users')
            .select('password')
            .eq('email', email)
            .single();

        if (dbError || !userData) return res.status(400).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, userData.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return res.status(400).json({ error: error.message });
        const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        res.status(200).json({ 
            message: "User logged in successfully", 
            data: {
                session: data.session,
                user: dbUser  // your users table data with your own id
            }
        });
    } catch (err) { next(err); }
}

const userRegistration = async (req, res, next) => {
    try {
        const { name, email, password, image_url, dob } = req.body;
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const { data, error } = await supabase.auth.signUp({
            email, password,
            options: { data: { name, image_url, dob, provider: 'email', role: 'Viewer' } }
        });
        if (error) return res.status(400).json({ error: error.message });

        const { error: insertError } = await supabase
            .from('users')
            .insert([{ name, email, password: hashedPassword, image_url, dob }]);

        if (insertError) return res.status(400).json({ error: insertError.message });

        const { data: dbUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        res.status(201).json({ 
            message: "User registered successfully", 
            data: {
                session: data.session,
                user: dbUser
            }
        });
    } catch (err) { next(err); }
}


const googleLogin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return res.status(401).json({ error: 'Invalid token' });

        const { data: existingUser } = await supabase
            .from('users').select('*').eq('email', user?.email).single();

        if (!existingUser) {
            const { error: insertError } = await supabase
                .from('users')
                .insert([{
                    name: user.user_metadata?.full_name || '',
                    email: user.email,
                    password: "",
                    image_url: user.user_metadata?.avatar_url || '',
                    role: 'Viewer',
                    provider: 'google',
                }]);
            if (insertError) return res.status(400).json({ error: insertError.message });
            
            const { data: newUser } = await supabase
                .from('users').select('*').eq('email', user.email).single();

            return res.status(201).json({ message: 'User created', user: newUser, isNewUser: true });
        }

        res.status(200).json({ message: 'User logged in', user: existingUser, isNewUser: false });
    } catch (err) { next(err); }
}

const updateProfile = async (req, res, next) => {
    try {
        const user = req.user;
        const { name, phone_number, image_url } = req.body;
        let imageKey = image_url;

        if (image_url && image_url.startsWith('data:image')) {
            imageKey = await uploadToS3(image_url, user.id);
        }

        const { error: dbError } = await supabase
            .from('users')
            .update({ name, phone_number, image_url: imageKey })
            .eq('email', user.email);

        if (dbError) return res.status(400).json({ error: dbError.message });
        res.status(200).json({ message: 'Profile updated successfully', image_key: imageKey });
    } catch (err) { next(err); }
}

const getProfileImage = async (req, res, next) => {
    try {
        const user = req.user;
        const { suffix = 'medium' } = req.query;

        const { data: userData } = await supabase
            .from('users').select('image_url').eq('email', user.email).single();

        if (!userData?.image_url) return res.status(200).json({ url: null });

        if (userData.image_url.startsWith('http')) {
            return res.status(200).json({ url: userData.image_url });
        }

        const url = await getPresignedUrl(userData.image_url, suffix);
        res.status(200).json({ url });
    } catch (err) { next(err); }
}


module.exports = { userRegistration, userLogin, googleLogin, updateProfile, getProfileImage };
