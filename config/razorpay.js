const Razorpay = require("razorpay");
const key = process.env.RAZOR_PAY_ID;
const secret = process.env.RAZOR_PAY_SECRET;


function rzpOb() {
  var instance = new Razorpay({
    key_id: key,
    key_secret: secret,
  });
  return instance;
}

module.exports = rzpOb;
