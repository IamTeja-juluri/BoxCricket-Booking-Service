'use strict';
const {
  Model
} = require('sequelize');
const {Enums}=require('../utils/common');
const {BOOKED,CANCELLED,INITIATED,PENDING}=Enums.BOOKING_STATUS;


module.exports = (sequelize, DataTypes) => {
  class MakeBooking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
    }
  }
  MakeBooking.init({
  userId: {
      type: DataTypes.INTEGER,
      allowNull: false
  },
  boxCricketId: {
      type: DataTypes.INTEGER,
      allowNull: false
  },
  bookingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
  },
  startTime: {
      type: DataTypes.TIME,
      allowNull: false
  },
  endTime: {
      type: DataTypes.TIME,
      allowNull: false
  },
  status: {
    type:DataTypes.ENUM,
    values:[BOOKED,CANCELLED,INITIATED,PENDING],
    defaultValue:INITIATED,
    allowNull:false
  }, 
  price: {
    type: DataTypes.INTEGER,
    allowNull:false
  }
  }, {
    sequelize,
    modelName: 'MakeBooking',
    indexes: [
      // Add unique index constraint
      {
        unique: true,
        fields: ['bookingDate', 'startTime', 'endTime'],
        name: 'unique_booking'
      }
    ]
  });
  return MakeBooking;
};