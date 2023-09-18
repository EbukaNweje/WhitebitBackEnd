const User = require("../model/userModel");

const makeDeposit = async (req, res) => {
  try {
    const { _id } = req.user;
    const { username, cryptoCurrencyType, amount } = req.body;

    // Check if the input data is valid
    if (!username || !cryptoCurrencyType || !amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Find the user by their username
    const user = await User.findById(_id);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the user's balance for the specified cryptoCurrencyType
    const balanceIndex = user.balance.findIndex(
      (balance) => balance.cryptoCurrencyType === cryptoCurrencyType
    );

    if (balanceIndex !== -1) {
      user.balance[balanceIndex].balance += amount;
    } else {
      user.balance.push({ cryptoCurrencyType, balance: amount });
    }

    // Add the deposit transaction to depositHistory
    user.depositHistory.push(`Deposited ${amount} ${cryptoCurrencyType}`);

    // Save the updated user object to the database
    await user.save();

    res.status(200).json({ message: "Deposit successful", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { makeDeposit };
