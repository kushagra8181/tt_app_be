const { createClient } = require("@supabase/supabase-js/dist/index.cjs");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.createTournament = async (req, res, next) => {
    try {
        const { name, description, location, status, start_time, end_time, start_date, end_date, registration_end_date, type, total_rounds } = req.body;

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', req.user.email)
            .single();

        if (userError || !userData) return res.status(400).json({ error: 'User not found' });

        const { data, error } = await supabase
            .from('tournaments')
            .insert([{ name, description, location, organizer_id: userData.id, status, start_time, end_time, start_date, end_date, registration_end_date, type, total_rounds }])
            .select();

        if (error) return res.status(400).json({ error: error.message });
        res.status(201).json({ message: "Tournament created successfully", data });
    } catch (err) { next(err); }
}


exports.getTournaments = async (req, res, next) => {
    try {
        const { data, error } = await supabase
            .from('tournaments').select('*').order('created_at', { ascending: false });
        if (error) return res.status(400).json({ error: error.message });
        res.status(200).json({ message: "Tournaments retrieved successfully", data });
    } catch (err) { next(err); }
}

exports.getTournamentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('tournaments').select('*').eq('id', id);
        if (error) return res.status(400).json({ error: error.message });
        res.status(200).json({ message: `Tournament with ID ${id} retrieved successfully`, data });
    } catch (err) { next(err); }
}
