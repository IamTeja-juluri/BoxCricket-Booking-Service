function compareTime(timeString1,timeString2){
     let dateTime1=new Date(timeString1);
     let dateTime2=new Date(timeString2);
     return dateTime1.getTime() > dateTime2.getTime()
}

function compareDate(dateString1){
     let date1=new Date(dateString1);
     let date2=new Date();
     console.log('date2=',date2.getFullDate())
     return date1.getDate() > date2.getDate()
}

module.exports={
     compareTime,
     compareDate
}