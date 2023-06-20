const SleepSchedule = require('./model');
const moment = require('moment');
const SleepScheduleLog = require('./model')

// create sleepSchedule
exports.sleepSchedule = catchAsyncError(async(req,res, next) => {
  try {
    const { bedtime, sleep_duration, schedule_date, repeat_from, repeat_to } = req.body;
    const bed_time_formatted = moment(bedtime, 'HH:mm').toDate();
    const sleep_duration_formatted = moment(sleep_duration, 'HH:mm').toDate();
    const schedule_date_formatted =  moment(schedule_date, 'DD-MM-YYYY').toDate();

    const newSchedule = await SleepSchedule.create({
      bed_time_formatted,
      sleep_duration_formatted,
      schedule_date_formatted,
      repeat_from,
      repeat_to,
      created_by : req.user.id,
    });

    res.status(201).json({
        success: true,
        message: "Success",
    });
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while creating the sleep schedule' });
  }
});

// 20 jun -> 5pm (Friday-Sunday)
// Sunday 26 5pm (sunday)


// Fetch all alarms for a specific day
exports.sleepScheduleFetch = catchAsyncError(async(req,res, next) => {
    try {
        const { schedule_date } = req.query;
    
        const formattedDate = moment(schedule_date, 'DD-MM-YYYY').toDate();
        const week_day = formattedDate.isoWeek();
    
        const schedules = await SleepSchedule.find({
            $or: [
              { schedule_date: formattedDate, 
                is_active: true 
              },
              {
                is_active: true,
                repeat_from: { $lt: week_day },
                repeat_to: { $gt: week_day }
              }
            ],
            created_by: req.user.id
          }).exec();
        
        await captureSchduleLogs(schedules, formattedDate);
        res.status(201).json({
            success: true,
            data: schedules,
        });
      } catch (err) {
        res.status(500).json({ error: 'An error occurred while fetching the sleep schedules' });
      }
});

// Retrieve data for a week
exports.sleepScheduleDashboard = catchAsyncError(async(req,res, next) => {
    try {
        const startDate = moment().subtract(7, 'days').startOf('day');
        const endDate = moment().subtract(1, 'day').endOf('day');
        
        const sleepScheduleLogs = await SleepScheduleLog.find({
          schedule_time: {
            $gte: startDate.toDate(),
            $lte: endDate.toDate()
          },
          created_by: req.user.id
        }).exec();

        res.status(201).json({
            success: true,
            data: sleepScheduleLogs,
        });
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while retrieving the sleep schedules' });
    }
});


const captureSchduleLogs = async(schedules, schedule_date) => {
    const todayDate = new Date();
    const d1 = new Date(todayDate.getFullYear(),todayDate.getMonth(), todayDate.getDate(), 0, 0, 0, 0);
    const d2 = new Date(schedule_date.getFullYear(), schedule_date.getMonth(), schedule_date.getDate(), 0, 0, 0, 0);
      
    if(!d1.getTime() === d2.getTime()){
         for(let i=0;i<schedules.length;i++){
             const scheduleLog = await SleepScheduleLog.findOne({sleep_schedule:i._id});
             if(!scheduleLog){
                 await SleepScheduleLog.create({
                    sleep_schedule:i._id,
                    schedule_date: schedule_date,
                    sleep_duration: i.sleep_duration,
                    created_by:i.created_by.id
                 })
             }
         }
    }
}



