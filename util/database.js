const Sequelize = require('sequelize');
const sequelize = new Sequelize('node_complete', 'root', 'kho12345', {dialect: 'mysql', host: 'localhost'});

module.exports = sequelize; 