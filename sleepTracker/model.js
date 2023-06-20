const mongoose = require("mongoose");

const sleepScheduleSchema = new mongoose.Schema({
  bedtime: {
    type: Date,
    required: true,
  },
  sleep_duration: {
    type: Date,
    required: true,
  },
  schedule_date: {
    type: Date,
    required: true,
  },
  repeat_from: {
    type: String,
    enum: [1, 2, 3, 4, 5, 6, 7],
  },
  repeat_to: {
    type: String,
    enum: [1, 2, 3, 4, 5, 6, 7],
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  created_time: {
    type: Date,
    default: Date.now,
  },
  is_active: {
    type: Boolean,
    default:true
  },

}, {timestamps:true});

const sleepScheduleLogSchema = new mongoose.Schema({
    sleep_schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SleepSchedule',
        required: true,
    },
    schedule_date: {
        type: Date,
        required: true,
    },
    sleep_duration: {
        type: Date,
        required: true,
    },
    created_time: {
        type: Date,
        default: Date.now,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const SleepSchedule = mongoose.model("SleepSchedule", sleepScheduleSchema);
const SleepScheduleLog = mongoose.model("SleepScheduleLog", sleepScheduleLogSchema);

module.exports = { SleepSchedule, SleepScheduleLog };

// '1', '2', '3', '4', '5', '6', '7'
//'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'


// fetch -> [] schedules sync aysnc ->( entries -> ) 1,2,3,4,5,6,7, -> [] -> 