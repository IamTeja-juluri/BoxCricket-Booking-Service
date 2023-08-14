const express = require('express');
const router=express.Router();
const {BookingController} =require('../../controllers');
const {BookingMiddlewares} = require('../../middlewares')

router.post('/',
                 BookingMiddlewares.validateCreateRequest,BookingController.createBooking);

router.post('/payments',BookingController.makePayment);

module.exports=router;
