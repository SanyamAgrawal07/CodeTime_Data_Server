const Sequelize = require('sequelize');
// const dbConfig = require('../config/db.config.js')
const sequelize = new Sequelize(`${process.env.POSTGRES_CONN_STRING}?sslmode=no-verify`)
// const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
//   host: dbConfig.HOST,
//   dialect: dbConfig.dialect,
//   dialectOptions:{
//     keepAlive: true
//   }
// //   operatorsAliases: false,

// //   pool: {
// //     max: dbConfig.pool.max,
// //     min: dbConfig.pool.min,
// //     acquire: dbConfig.pool.acquire,
// //     idle: dbConfig.pool.idle
// //   }
// });

// const sequelize = new Sequelize(process.env.POSTGRES_CONN_STRING, {
//     host: dbConfig.HOST,
//     dialect: dbConfig.dialect,
//     dialectOptions:{
//       keepAlive: true
//     }
//   });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model.js")(sequelize, Sequelize);

module.exports = db;