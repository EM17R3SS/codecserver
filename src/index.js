const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');

async function start() {
    await connectDB();

    app.listen(config.PORT, () => {
        console.log(`http://localhost:${config.PORT}`);
        console.log(`${config.NODE_ENV}`);
    });
}

start();
