const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');

async function start() {
    try {
        await connectDB();

        app.listen(config.PORT, () => {
            console.log(`http://localhost:${config.PORT}`);
            console.log(`${config.NODE_ENV}`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }


}

start();
