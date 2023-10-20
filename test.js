const axios = require('axios');
const moment = require('moment'); // You'll need the 'moment' library for date manipulation

const apiUrl = 'http://localhost:3000/createWaterAndFoot'; // Replace with your actual API endpoint

const generateAndPostData = async () => {
  for (let i = 0; i < 30; i++) {
    // Generate data as needed
    const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
    const data = {
      value: i + 1,    // Adjust this as needed
      type: 'foot', // Adjust the type
      user: 'user123',  // Adjust the user
      created_time: date, // Set the date
    };

    try {
      await axios.post(apiUrl, data);
      console.log(`Data entry for ${date} posted successfully`);
    } catch (error) {
      console.error(`Error posting data entry for ${date}: ${error.message}`);
    }
  }
};

generateAndPostData();
