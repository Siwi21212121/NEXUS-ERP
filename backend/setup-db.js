require("dotenv").config();
const { Pool, Client } = require("pg");
const fs = require("fs");
const path = require("path");

const dbConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

const dbName = process.env.DATABASE_NAME;

async function setupDatabase() {
  const client = new Client(dbConfig);

  try {
    // Connect to postgres (default database)
    await client.connect();
    console.log("Connected to PostgreSQL server");

    // Check if database exists
    const result = await client.query(
      `SELECT datname FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (result.rows.length === 0) {
      console.log(`Creating database '${dbName}'...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✓ Database '${dbName}' created successfully`);
    } else {
      console.log(`✓ Database '${dbName}' already exists`);
    }

    await client.end();

    // Now connect to the created database and run migrations
    const poolWithDb = new Pool({
      ...dbConfig,
      database: dbName,
    });

    console.log("\nRunning migrations...");

    const migrationsDir = path.join(__dirname, "src", "migrations");
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (file.endsWith(".sql")) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, "utf-8");

        console.log(`Running migration: ${file}`);
        await poolWithDb.query(sql);
        console.log(`✓ ${file} completed`);
      }
    }

    console.log("\n✓ Database setup completed successfully!");
    console.log(`Database: ${dbName}`);
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);

    await poolWithDb.end();
  } catch (error) {
    console.error("❌ Database setup error:", error.message);
    process.exit(1);
  }
}

setupDatabase();
