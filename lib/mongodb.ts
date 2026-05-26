import mongoose from "mongoose";

function getMongoConfig() {
    const uri = process.env.MONGODB_URI?.trim() ?? "";
    const dbName = process.env.MONGODB_DB_NAME?.trim() || "dubai-adventures";

    if (!uri) {
        throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
    }

    return { uri, dbName };
}

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
    dbName: string | null;
    uri: string | null;
}

declare global {
    var dubaiAdventuresMongooseCache: MongooseCache | undefined;
}

const cached = globalThis.dubaiAdventuresMongooseCache ?? {
    conn: null,
    promise: null,
    dbName: null,
    uri: null,
};
globalThis.dubaiAdventuresMongooseCache = cached;

async function connectToDatabase(): Promise<typeof mongoose> {
    const { uri: mongoUri, dbName } = getMongoConfig();
    const hasMatchingConnection =
        cached.conn &&
        cached.uri === mongoUri &&
        cached.dbName === dbName &&
        cached.conn.connection.readyState === 1;

    if (hasMatchingConnection) {
        return cached.conn as typeof mongoose;
    }

    const hasStaleConnection =
        cached.conn &&
        (cached.uri !== mongoUri || cached.dbName !== dbName);

    if (hasStaleConnection && mongoose.connection.readyState !== 0) {
        console.log(`[MongoDB] Database configuration changed. Reconnecting...`);
        await mongoose.disconnect();
        cached.conn = null;
        cached.promise = null;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            dbName,
            maxPoolSize: 50,
            minPoolSize: 5,
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 20000,
            waitQueueTimeoutMS: 30000,
        };

        const maskedUri = mongoUri.replace(/:([^@]+)@/, ':****@');
        console.log(`[MongoDB] Initializing connection to ${maskedUri}...`);

        cached.uri = mongoUri;
        cached.dbName = dbName;
        cached.promise = mongoose.connect(mongoUri, opts).then((mongooseInstance) => {
            const resolvedDbName = mongooseInstance.connection.name;
            console.log(`[MongoDB] SUCCESS: Connected to "${resolvedDbName}"`);
            
            if (resolvedDbName !== dbName) {
                console.warn(`[MongoDB] WARNING: Connected to unexpected database "${resolvedDbName}" instead of "${dbName}"`);
            }

            return mongooseInstance;
        });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        console.error(`[MongoDB] FAILURE: Could not connect to database.`);
        console.error(error);
        
        // Clear cached promise so next request retries a fresh connection
        cached.promise = null;
        cached.conn = null;
        throw error;
    }
}

export default connectToDatabase;
