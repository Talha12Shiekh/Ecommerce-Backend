require('dotenv').config();

const app = require("./app.js");
const { connectDB } = require('./config/db');

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
	try {
		await connectDB();
		console.log('MongoDB connected');

		app.listen(PORT, () => {
			console.log(`Server listening on port ${PORT}`);
		});
	} catch (error) {
		console.error('Failed to start server:', error);
		process.exit(1);
	}
};

startServer();

