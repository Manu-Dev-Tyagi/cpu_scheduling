// server.js
const express = require('express');
const bodyParser = require('body-parser');
const scheduleRoutes = require('./routes/schedule');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 12000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/schedule', scheduleRoutes);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:12000`);
});
