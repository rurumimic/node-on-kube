const { Sequelize } = require('sequelize');
var express = require('express');
var router = express.Router();

const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
host: process.env.MYSQL_HOST,
  dialect: 'mariadb',
  dialectOptions: {
    'timezone': 'Etc/GMT0'
  }
});

router.get('/', async function(req, res, next) {
  const [pets, _metadata] = await sequelize.query('SELECT * FROM pet');
  res.render('pet', { 
    title: 'Pet',
    pets: pets
  });
});

module.exports = router;
