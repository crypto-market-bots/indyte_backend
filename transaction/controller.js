const dotenv = require("dotenv");
dotenv.config({});

const {Transaction, PaidPlan}=  require('./model');
const { User } = require('../users/model');
const catchAsyncError = require("../middleware/catchAsyncError");

import { CFConfig, CFPaymentGateway, CFEnvironment, CFCustomerDetails, CFOrderRequest} from "cashfree-pg-sdk-nodejs";
var cfConfig = new CFConfig(CFEnvironment.PRODUCTION, "2022-01-01", process.env.CASHFREE_CLIENT_ID, CASHFREE_SECRET);


exports.addPaidPlan = catchAsyncError(async (req, res, next) => {
    const { name, image, description, plan_validity} = req.body;

    const plan_validity_formatted = moment(plan_validity, 'MM-YYYY').toDate();
    const newPlan = new PaidPlan({
      name,
      image_link,
      description,
      plan_validity_formatted,
      created_by:req.user.id,
    });
    newPlan.save()
      .then(plan => res.status(200).json({ success: true, data: newPlan }))
      .catch(err => res.status(500).json({ error: 'Failed to add the plan.' }));
});


exports.updatePaidPlan = catchAsyncError(async (req, res, next) => {
    const { name, image, description, plan_validity } = req.body;
    const { planId } = req.params;
    PaidPlan.findByIdAndUpdate(planId, {
        name,
        image_link,
        description,
        plan_validity,
    }, { new: true })
        .then(updatedPlan => {
        if (!updatedPlan) {
            return res.status(404).json({ error: 'Plan not found.' });
        }
        res.status(200).json({ success: true, message:"success" });
        })
        .catch(err => res.status(500).json({ error: 'Failed to update the plan.' }));
});
 

exports.fetchPaidPlans = catchAsyncError(async (req, res, next) => {
    PaidPlan.find()
    .then(plans => res.status(200).json({ success: true, data: newPlan }))
    .catch(err => res.status(500).json({ error: 'Failed to fetch plans.' }));
});


exports.buyPaidPlan = catchAsyncError(async (req, res, next) => {
    const {currency, plan_id, amount} = req.body;
    var customerDetails = new CFCustomerDetails();


    customerDetails.customerId = req.user.id;
    customerDetails.customerPhone = req.user.phone;
    customerDetails.customerEmail = req.user.email;
    var d = {};
    d["plan_id"] = plan_id;

    var cFOrderRequest = new CFOrderRequest();
    cFOrderRequest.orderAmount = amount;
    cFOrderRequest.orderCurrency = currency; //"INR";
    cFOrderRequest.customerDetails = customerDetails;
    cFOrderRequest.orderTags = d;
    try {
        var apiInstance = new CFPaymentGateway();

        var result = await apiInstance.orderCreate(
            prodCfConfig,
            cFOrderRequest
        );
        if (result != null) {
            const Transaction = new Transaction({
                paid_plan:plan_id,
                orderId: result.cfOrder.orderId,
                amount: response.amount,
                currency: currency,
                trans_status: 'in-progress',
                user:req.user.id,
            })
            await Transaction.save()
            res.status(200).json({ success: true, data: result, notifyUrl: "/api/payment-verification" });
        }
    } catch (e){
        console.log("error while doing the transaction : ",e);
        res.status(500).json({ error: 'Failed to fetch plans.' });
    }
});


exports.buyPaidPlan = catchAsyncError(async (req, res, next) => { // webhook for cashfree to notify the payment status (method : post)
    const body = req.body;
    const order_id = body.order.order_id;

   var transaction = Transaction.findOne({ order_id }).populate('paid_plan').populate('user');
   const user_id = transaction.user.id;
   transaction.trans_status = body.link_status;
   transaction.save()

   if (body.order.transaction_status == "SUCCESS"){
        var user = User.findOne({ user_id });
        var paid_plan = JSON.parse(user.current_paidplan);
        if (user.current_paidplan && paid_plan.validity > Date.now()){
            paid_plan['validity'] = paid_plan.validity+Transaction.paid_plan.validity;
        }else{
            paid_plan['validity'] = Transaction.paid_plan.validity;
        }
        paid_plan['plan_id'] = Transaction.paid_plan.id;
        paid_plan['allowed_features'] = Transaction.paid_plan.services;
        user.current_paidplan = paid_plan;
        user.save()
   }
   //res.status(200).json({ success: true, message:"updated"});
});