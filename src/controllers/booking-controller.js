const  {StatusCodes} = require('http-status-codes');
const { BookingService } = require('../services');
const { SuccessResponse,ErrorResponse } = require('../utils/common');

const inMemDb ={};

async function createBooking(req,res){
    
    try{
        const response= await BookingService.createBooking({
            userId: req.body.userId,
            boxCricketId: req.body.boxCricketId,
            bookingDate : req.body.bookingDate,
            startTime : req.body.startTime ,
            endTime : req.body.endTime 
        });
        SuccessResponse.data=response;
        return res 
                  .status(StatusCodes.OK)
                  .json(SuccessResponse);

    }catch(error){
        ErrorResponse.error=error;
        return res 
                  .status(StatusCodes.INTERNAL_SERVER_ERROR)
                  .json(ErrorResponse)
    }

}


module.exports={
    createBooking
}