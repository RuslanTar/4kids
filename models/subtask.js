'use strict';
module.exports = (sequelize, DataTypes) => {
  const subTask = sequelize.define('subTask', {
    title: DataTypes.STRING,
    isDone: DataTypes.BOOLEAN,
    mainTaskId: DataTypes.INTEGER
  }, {});
  subTask.associate = function(models) {
    // associations can be defined here
  };
  return subTask;
};