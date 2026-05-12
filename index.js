const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 7000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-refresh-token, x-new-access-token, x-new-refresh-token');
  next();
});

app.use("/v1", require("./v1"))

// app.get('/user', async (req, res) => {
//  const { data, error } = await supabase.from('users').select('*');

//  if (error) return res.status(400).json({ error: error.message });

//  res.status(200).json(data);
// });

// app.post('/user', async (req, res) => {
//  const { name, email, password } = req.body;

//  const { data, error } = await supabase
//  .from('users')
//  .insert([{ name, email, password }]);

//  if (error) return res.status(400).json({ error: error.message });

//  res.status(201).json(data);
// });



app.listen(port, () => {
 console.log(`The server is running on http://localhost:${port}`);
});