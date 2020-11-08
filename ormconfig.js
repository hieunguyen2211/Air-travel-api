const seedingFolderName = "seed-development";
module.exports = [
  {
    "name": "default",
    "type": "postgres",
    "url": process.env.DB_URI,
    "migrations": ["src/database/migrations/*.ts"],
    "entities": ["src/**/*.entity{.ts,.js}"],
    "factories": ["src/database/factories/**/*.factory{.ts,.js}"],
    "seeds": [`src/database/${seedingFolderName}/**/*.seed{.ts,.js}`],
    "cli": {
      migrationsDir: "src/database/migrations"
    }
  }
];
