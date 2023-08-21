const mongoose = require("mongoose");
const validator = require("validator");
const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const dietitianSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      trim: true,
      required: [true, "Please enter your First Name"],
    },
    id_card_number: {
      type: String,
      required: [true, "Please enter the ID Card Number"],
    },
    id_card_type: {
      type: String,
      required: [true, "Please enter the ID Card Type"],
      enum: ["AADHAR", "PAN", "LICENSE"],
    },
    last_name: {
      type: String,
      trim: true,
      required: [true, "Please enter your Last Name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      trim: true,
      unique: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Please enter your Phone Number"],
      unique: true,
      validate: {
        validator: function (value) {
          return /^[0-9]{10}$/.test(value);
        },
        message: "Phone Number should be 10 digits",
      },
    },
    password: {
      type: String,
      required: [true, "Please enter the password"],
      trim: true,
      minLength: [
        6,
        "Password should be greater than or equal to 6 characters",
      ],
      select: false,
    },
    type: {
      type: String,
      default: "user",
    },
    gender: {
      type: String,
      required: [true, "Please enter the Gender"],
      trim: true,
    },
    qualification: {
      type: String,
      required: [true, "Please enter the Qualification"],
      trim: true,
    },
    dob: {
      type: Date,
      required: [true, "Please enter the Date of Birth"],
    },
    weight: {
      type: Number,
      required: [true, "Please enter the weight in Kg"],
    },
    height: {
      type: Number,
      required: [true, "Please enter the height in cm"],
    },
    goal: {
      type: String,
      required: [true, "Please enter the Goal"],
    },
    family_contact_number: {
      type: String,
      required: [true, "Please enter the Family Contact Number"],
    },
    local_address: {
      address_line1: {
        type: String,
        required: [true, "Please enter Address Line 1"],
      },
      address_line2: {
        type: String,
        required: [true, "Please enter Address Line 2"],
      },
      city: {
        type: String,
        required: [true, "Please enter City"],
      },
      state: {
        type: String,
        required: [true, "Please enter State"],
      },
      zip: {
        type: String,
        required: [true, "Please enter ZIP Code"],
      },
      country: {
        type: String,
        required: [true, "Please enter Country"],
      },
    },
    local_guardian_address: {
      address_line1: {
        type: String,
        required: [true, "Please enter Address Line 1"],
      },
      address_line2: {
        type: String,
        required: [true, "Please enter Address Line 2"],
      },
      city: {
        type: String,
        required: [true, "Please enter City"],
      },
      state: {
        type: String,
        required: [true, "Please enter State"],
      },
      zip: {
        type: String,
        required: [true, "Please enter ZIP Code"],
      },
      country: {
        type: String,
        required: [true, "Please enter Country"],
      },
    },
    permanent_address: {
      address_line1: {
        type: String,
        required: [true, "Please enter Address Line 1"],
      },
      address_line2: {
        type: String,
        required: [true, "Please enter Address Line 2"],
      },
      city: {
        type: String,
        required: [true, "Please enter City"],
      },
      state: {
        type: String,
        required: [true, "Please enter State"],
      },
      zip: {
        type: String,
        required: [true, "Please enter ZIP Code"],
      },
      country: {
        type: String,
        required: [true, "Please enter Country"],
      },
    },
    id_card_number: {
      type: String,
      required: [true, "Please enter the ID Card Number"],
    },
    id_card_type: {
      type: String,
      required: [true, "Please enter the ID Card Type"],
      enum: ["AADHAR", "PAN", "LICENSE"],
    },
    photo_id: {
      type: String,
      required: [true, "Please enter the Photo ID"],
    },
    study_details: {
      type: String,
      required: [true, "Please enter the Study Details"],
    },
    photo: {
      type: String,
      required: [true, "Please upload a Photo"],
    },
    experience: {
      type: String,
      required: [true, "Please enter the Experience"],
    },
    past_work_details: {
      type: String,
      required: [true, "Please enter the Past Work Details"],
    },
  },
  { timestamps: true }
);


// const User = mongoose.model("User", userSchema);
// const dietitian = mongoose.model();

// module.exports = { dietitian };

module.exports = mongoose.model("dietitian", dietitianSchema);