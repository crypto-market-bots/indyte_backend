const mongoose = require('mongoose');

const paidPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image_link: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  plan_validity: { // time span -> months
    type: Date,
    required: true,
  },
  services: {
    type: [String],  // Specify that the `services` field is an array of strings
    default: ["meal", "workout"],  // Set the default value to ["meal", "workout"]
    //required: true,
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
});

const transactionSchema = new mongoose.Schema({
    paid_plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PaidPlan',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
	amount: {
		type: Number
	},
	currency: {
		type: String
	},
	createdAt: {
		type: Date,
        default: Date.now,
	},
    trans_status: {
        type: String
    }
});

const PaidPlan = mongoose.model('PaidPlan', paidPlanSchema);
module.exports = mongoose.model('Transaction', transactionSchema)
module.exports = PaidPlan;



/*
-> db call ye check db record exist -> user and plan -> service
-> user , current_paidplan-> {'paid_id': , validity: time.now()+validity_plan, allowed_service=['meal', workout]}
-> same column  ,current+validity+validity_plan

plan

*/