const {StatusCodes}=require('http-status-codes')
const { Sequelize,Op } = require("sequelize");
const { MakeBooking }=require('../models');
const {Enums}=require('../utils/common');
const {INITIATED,CANCELLED,BOOKED}=Enums.BOOKING_STATUS;
const CrudRepository = require('./crud-repository');

class BookingRepository extends CrudRepository{

    constructor(){
        super(Booking);
    }

    async createBooking(data,transaction){
        const response = await MakeBooking.create(data,{transaction:transaction});
        return response;
    }

    async getBookings(bookingData){
        const response = await MakeBooking.findAll({
          where: {
             bookingDate: bookingData.bookingDate,
             boxCricketId: bookingData.boxCricketId,
             [Op.or]:[
                {
                    startTime: {
                        [Op.between] : [bookingData.startTime,bookingData.endTime]
                    }
                },
                {
                    endTime: {
                        [Op.between] : [bookingData.startTime,bookingData.endTime]
                    }
                },
                {
                    [Op.and]:[
                        {
                            startTime:{ 
                                [Op.lte] : bookingData.startTime
                            }
                        },
                        {
                            endTime:{
                                [Op.gte] : bookingData.endTime
                            }
                        }
                    ]
                }
             ]
          }
        });
        return response;
    }

    async get(data,transaction){
        const response=await MakeBooking.findByPk(data,{transaction:transaction});
        if(!response)
            throw new AppError("Not able to find resource",StatusCodes.NOT_FOUND);
        return response;
    }

    async update(id,data,transaction){
        const response=await MakeBooking.update(data,{
            where :{
                id:id
            }
        },{transaction:transaction});
        console.log(response);
        return response;
    }

    async cancelOldBookings(timeStamp){
       const response = await MakeBooking.update({status:CANCELLED},{
        where :{
            [Op.and]:[
                {
                    createdAt: {
                        [Op.lt] : timeStamp
                    }
                },
                {
                    status : {
                        [Op.ne] : BOOKED 
                    }
                },
                {
                    status:{
                        [Op.ne]:CANCELLED
                    }
                }
            ]
        }
       });
       return response;
    }

}

module.exports=BookingRepository;
