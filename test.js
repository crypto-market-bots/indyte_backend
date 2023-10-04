const mongoose = require('mongoose');
const User = require('./users/model'); // Import your User model

mongoose.connect('mongodb+srv://indyteindia:NyjyXuTxa1WXTiu1@cluster0.mwc4ecv.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a function to update existing documents
async function updateExistingDocuments() {
    try {
      // Find documents that don't already have the `current_weight` and `initial_weight` fields
      const usersToUpdate = await User.find({
        current_weight: { $exists: false },
        initial_weight: { $exists: false },
      });
  
      // Update each document
      for (const user of usersToUpdate) {
        // Set the `current_weight` and `initial_weight` fields to the same value
        const currentWeight = user.weight;
  
        // Update the document to set the new fields and unset the old `weight` field
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              current_weight: currentWeight,
              initial_weight: currentWeight,
            },
            $unset: { weight: 1 }, // Unset the old `weight` field
          }
        );
      }
  
      console.log('Documents updated successfully');
    } catch (error) {
      console.error('Error updating documents:', error);
    } finally {
      // Close the database connection
      mongoose.connection.close();
    }
  }
// Call the function to update the documents
updateExistingDocuments();
