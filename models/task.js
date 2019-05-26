'use strict';
module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    name: DataTypes.STRING,
    award: DataTypes.STRING,
    completed: DataTypes.BOOLEAN,
    userId: DataTypes.BIGINT,
    time: DataTypes.STRING,
    priority: DataTypes.INTEGER,
    category: DataTypes.STRING
  }, {});
  Task.associate = function(models) {
    // associations can be defined here
  };
  return Task;
};