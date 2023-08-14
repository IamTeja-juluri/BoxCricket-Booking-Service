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
        const boxCricket= await axios.get(`${ServerConfig.BOX_CRICKET_SERVICE}/api/v1/boxcricket/${data.boxCricketId}`);

        const boxCricketData=boxCricket.data.data;
        console.log("boxCricketData=",boxCricketData);
        const existingBookings=await getBookings(data);
        console.log("existingBookings=",existingBookings.length);


        if(existingBookings.length>0)
            throw new AppError('Slot already booked for the given time'); 
         
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

async function makePayment(data){

    const transaction = await db.sequelize.transaction();
    
    try{
        const bookingDetails= await bookingRepository.get(data.bookingId,transaction);
        console.log(bookingDetails);
        if(bookingDetails.status == CANCELLED){
            throw new AppError('Booking expired ',StatusCodes.BAD_REQUEST);
        }
        const bookingTime = new Date(bookingDetails.createdAt);
        const currentTime = new Date();

        if(currentTime - bookingTime > 300000){
            await cancelBooking(data.bookingId);
            throw new AppError('Booking expired ',StatusCodes.BAD_REQUEST)
        }

        if(bookingDetails.totalCost != data.totalCost ){
            throw new AppError('The amount of the payment doesnt match ',StatusCodes.BAD_REQUEST);

        }
        if(bookingDetails.userId != data.userId){
            throw new AppError('The user corresponding to booking doesnt match ',StatusCodes.BAD_REQUEST);
        }
        // we assume here that payment is successful
        const response = await bookingRepository.update(data.bookingId,{status:BOOKED},transaction);
       
        await transaction.commit();
        
    } catch(error){
        await transaction.rollback();
        throw error;
    }
}



module.exports={
    createBooking,getBookings,makePayment
}
