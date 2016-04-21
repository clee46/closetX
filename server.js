const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/app_dev');

const authRouter = require(__dirname + '/routes/auth_routes.js');
const userRouter = require(__dirname + '/routes/user_routes.js');
const itemRouter = require(__dirname + '/routes/item_routes.js');

app.use('/api', authRouter);
app.use('/api', userRouter);
app.use('/api', itemRouter);

var PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server up on port: ' + PORT));
