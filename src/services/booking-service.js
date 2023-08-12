const axios = require('axios');
const {StatusCodes}=require('http-status-codes');

const { BookingRepository } = require('../repositories');
const { ServerConfig,Queue }=require('../config');
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

        const boxCricket= await axios.get(`${ServerConfig.BOX_CRICKET_SERVICE}/api/v1/boxcricket/${data.boxCricketId}`);
        const boxCricketData=boxCricket.data.data;
        const existingBookings=await getBookings(data);

        if(existingBookings)
            throw new AppError('Slot already booked for the given time');
        
         
        const totalBillingAmount =  boxCricketData.price;
        const bookingPayload = { ...data , totalCost: totalBillingAmount};
        const booking = await bookingRepository.create(bookingPayload,transaction);
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
        Queue.sendData({
            recepientEmail:'tejajuluri2605@gmail.com',
            subject:'Flight Booked',
            text:`Booking successfully done for the flight ${data.bookingId}`
        })
        await transaction.commit();
        
    } catch(error){
        await transaction.rollback();
        throw error;
    }
}

async function cancelBooking(bookingId){
    const transaction = await db.sequelize.transaction();
    try{
      const bookingDetails = await bookingRepository.get(bookingId,transaction);
       if(bookingDetails.status === CANCELLED){
        await transaction.commit();
        return true;
       }
       await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`,{
        seats: bookingDetails.noOfSeats,
        dec : 0
    });
    await bookingRepository.update(bookingId,{status:CANCELLED},transaction);
    await transaction.commit();
    }catch(error){
        await transaction.rollback();
        throw error;
    }
}

async function cancelOldBookings(){
    try{
        const time = new Date( Date.now() - 1000 * 300); // 5 mins ago
        const response = await bookingRepository.cancelOldBookings(time);
        return response;
    }catch(error){
       console.log(error);
    }
}


module.exports={
    createBooking,makePayment,cancelBooking,cancelOldBookings,getBookings
}
