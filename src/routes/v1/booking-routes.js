const express = require('express');
const router=express.Router();
const {BookingController} =require('../../controllers');
const {BookingMiddlewares} = require('../../middlewares')

router.post('/',
                 BookingMiddlewares.validateCreateRequest,BookingController.createBooking);

module.exports=router;
