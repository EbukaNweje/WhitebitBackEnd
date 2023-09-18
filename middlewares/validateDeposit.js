function validateDeposit(req,res,next) {
    const {cryptoCurrencyType,amount} = req.body

    const supportedCryptos = ["BTC", "ETH","LTC"] 
    if (!supportedCryptos.includes(cryptoCurrencyType)){
        return res.status(400).json({message:"unsupported crypto choice"})
    }

    if (typeof amount !== "number" || amount <= 0 ) {
        return res.status(400).json({message:"Invalid deposit"})
    }

    next()

}

module.exports =  {validateDeposit}