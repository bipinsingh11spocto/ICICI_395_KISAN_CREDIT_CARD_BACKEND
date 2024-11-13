require('dotenv').config()

const mysqlconnection = {
  host: process.env.DB_PROD_HOST,
  user: process.env.DB_PROD_USER,
  password: process.env.DB_PROD_PASSWORD,
  database: process.env.DB_PROD_DATABASE,
  port: process.env.DB_PROD_PORT
}

// const mysqlconnection = {
//   host: process.env.DB_TEST_HOST,
//   user: process.env.DB_TEST_USER,
//   password: process.env.DB_TEST_PASSWORD,
//   database: process.env.DB_TEST_DATABASE,
//   port: process.env.DB_TEST_PORT
// }


module.exports = {
  mysqlconnection
}