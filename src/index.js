import Web3 from "web3";
import { CONTRACT_ABI } from "./CONTRACT_ABI";
require("dotenv").config();

(async () => {
  let web3 = new Web3(process.env.ALCHEMY_API_KEY_WITH_WSS);

  let contract = new web3.eth.Contract(
    CONTRACT_ABI,
    process.env.CONTRACT_ADDRESS
  );

  let transactionObject = {
    chainId: process.env.BLOCK_CHAIN_ID,
    to: process.env.CONTRACT_ADDRESS,
    data: contract.methods.callToGetCurrent().encodeABI(),
    gas: process.env.BLOCK_CHAIN_ID == "137" ? 2100000 : 2100000, // -> gas Means gasLimit
    gasPrice: process.env.BLOCK_CHAIN_ID == "137" ? 300000000000 : 21000000000, // -> Exactly the given gasPrice will be cut down from blueliner account
  };

  let signedTransaction = await web3.eth.accounts.signTransaction(
    transactionObject,
    process.env.TRANSACTION_SIGNER_PRIVATE_KEY
  );

  const method = await web3.eth.sendSignedTransaction.method;
  let payload = await method.toPayload([signedTransaction.rawTransaction]);

  await method.requestManager.send(payload, async (result) => {
    console.log("Final result from blockchain: ", payload, result);
  });

  // ******************* Events Print *******************
  contract.events
    .indexedInfo(() => {})
    .on("connected", function (subscriptionId) {
      console.log("SubID: ", subscriptionId);
    })
    .on("data", function (event) {
      console.log("Event:", event);
      //Write send email process here!
    })
    .on("changed", function (event) {
      //Do something when it is removed from the database.
    })
    .on("error", function (error, receipt) {
      console.log("Error:", error, receipt);
    });
})();
