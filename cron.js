
var cron = require('node-cron');

const updateMealStatus = () => {
  console.log('Before scheduling the cron job');
  const currentTime = new Date();
  console.log(currentTime);
  
  try {
    var task = cron.schedule('53 22 * * *', () =>  {
      console.log('will execute every minute until stopped');

    });
  } catch (error) {
    console.log('Error in scheduling the cron job:', error);
  }
  
};


module.exports={updateMealStatus}