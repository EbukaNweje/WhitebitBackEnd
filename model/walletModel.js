const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "username is required."],
    ref: 'User',
  },
  amountToDeposit:{
    type:Number,
    required:[true, "amount is required."],
  },
  balance:{
    type:Number,
    default:0,
    min:0
  },
  address:{
    type: String,
    required:[true, "address is required."],
  },
  cryptoCurrencyType : {
    type:String,
    required:[true,"Currency type is required"]
  },
  depositHistory : [{
    type:String,
  }]
});

const walletModel = mongoose.model("wallet", walletSchema);

module.exports = walletModel;