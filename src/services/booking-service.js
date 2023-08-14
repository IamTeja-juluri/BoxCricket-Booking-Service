const axios = require('axios');
const {StatusCodes}=require('http-status-codes');

const { BookingRepository } = require('../repositories');
const { ServerConfig }=require('../config');
const db = require('../models');
const AppError=require('../utils/errors/app-error');
const { data } = require('../utils/common/error-response');
const { Enums } = require('../utils/common/');
const makebooking = require('../models/makebooking');
const {BOOKED,CANCELLED,PENDING,INITIATED} = Enums.BOOKING_STATUS

const bookingRepository= new BookingRepository();

async function createBooking(data){

    const transaction = await db.sequelize.transaction();

    try{
          console.log(data);
        // const boxCricket= await axios.get(`${ServerConfig.BOX_CRICKET_SERVICE}/api/v1/boxcricket/${data.boxCricketId}`);
        const boxCricket= await axios.get('http://localhost:6001/api/v1/boxcricket/2');


        const boxCricketData=boxCricket.data.data;
        console.log("boxCricketData=",boxCricketData);
        // const existingBookings=await getBookings(data);
        // console.log("existingBookings=",existingBookings);


        // if(existingBookings && existingBookings.length>1)
        //     throw new AppError('Slot already booked for the given time'); 
         
        const totalBillingAmount =  boxCricketData.price;
        console.log('totalBillingAmount=',totalBillingAmount);
        const bookingPayload = { ...data , price: totalBillingAmount};
        console.log('bookingPayload=',bookingPayload);
        const booking = await bookingRepository.createBooking(bookingPayload,transaction);
        await transaction.commit();
    
        return booking;

    }catch(error){
        console.log("rolling back");
        await transaction.rollback();
        throw error;
    }
        
}


async function getBookings(data){

    try{
        const bookings = await bookingRepository.getBookings(data); 
        return bookings;
    }catch(error){
        console.log();
        throw error;
    }

}



module.exports={
    createBooking,getBookings
}
