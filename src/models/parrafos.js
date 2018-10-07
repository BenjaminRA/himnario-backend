module.exports = (sequelize, DataTypes) => 
  sequelize.define('parrafos', {
    himno_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'himnos',
        key: 'id'
      }
    },
    coro: DataTypes.BOOLEAN,
    parrafo: DataTypes.TEXT
  })
