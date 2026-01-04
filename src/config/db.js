const mongoose = require('mongoose');

const connectDB = async (mongoUri = process.env.MONGO_URI) => {
	if (!mongoUri) {
		throw new Error('Missing MONGO_URI in environment variables');
	}

	await mongoose.connect(mongoUri, {
		serverSelectionTimeoutMS: 10_000,
	});

	return mongoose.connection;
};

module.exports = { connectDB };
