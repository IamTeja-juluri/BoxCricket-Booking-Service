'use strict';
/** @type {import('sequelize-cli').Migration} */
const {Enums}=require('../utils/common');
const {BOOKED,CANCELLED,INITIATED,PENDING}=Enums.BOOKING_STATUS;
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MakeBookings', {
    id: {
      allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
    boxCricketId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
    bookingDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    startTime: {
        type: Sequelize.TIME,
        allowNull: false
    },
    endTime: {
        type: Sequelize.TIME,
        allowNull: false
    },
    status: {
      type:Sequelize.ENUM,
      values:[BOOKED,CANCELLED,INITIATED,PENDING],
      defaultValue:INITIATED,
      allowNull:false
    },
    price:{
        type: Sequelize.INTEGER,
        allowNull:false
    },
    createdAt: {
        type: Sequelize.DATE,
        allowNull: false
    },
    updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
    }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MakeBookings');
  }
};