'use client';

import React from 'react';
import { PrimeSdk, EtherspotBundler, ArkaPaymaster} from '@etherspot/prime-sdk';
import { ethers } from 'ethers'
import './App.css';
import logo from "./etherspotxflare.png"


const App = () => {
  
  const [etherspotWalletAddress, setEtherspotWalletAddress] = React.useState('0x0000000000000000000000000000000000000000');
  const [eoaWalletAddress, setEoaWalletAddress] = React.useState('0x0000000000000000000000000000000000000000');
  const [eoaPrivateKey, setEoaPrivateKey] = React.useState('0xafdfd9c3d2095ef696594f6cedcae59e72dcd697e2a7521b1578140422a4f890');
  const [destinationAddress, setDestinationAddress] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const bundlerApiKey = 'eyJvcmciOiI2NTIzZjY5MzUwOTBmNzAwMDFiYjJkZWIiLCJpZCI6IjMxMDZiOGY2NTRhZTRhZTM4MGVjYjJiN2Q2NDMzMjM4IiwiaCI6Im11cm11cjEyOCJ9';
  const primeSdkDefault = new PrimeSdk({ privateKey: eoaPrivateKey}, { chainId: 114, bundlerProvider: new EtherspotBundler(114, bundlerApiKey) });

  const generateRandomEOA = async () => {
    // Create random EOA wallet
    const randomWallet = ethers.Wallet.createRandom();
    setEoaWalletAddress(randomWallet.address);
    setEoaPrivateKey(randomWallet.privateKey);
}

  const generateEtherspotWallet = async () => {
    // Initialise Etherspot SDK
    const primeSdk = new PrimeSdk({ privateKey: eoaPrivateKey}, { chainId: 114, bundlerProvider: new EtherspotBundler(114, bundlerApiKey) });
    const address: string = await primeSdk.getCounterFactualAddress();
    setEtherspotWalletAddress(address);
    console.log('\x1b[33m%s\x1b[0m', `EtherspotWallet address: ${address}`);
  }

  const sendFunds = async () => {
    const primeSdk = new PrimeSdk({ privateKey: eoaPrivateKey}, { chainId: 114, bundlerProvider: new EtherspotBundler(114, bundlerApiKey) });
    // clear the transaction batch
    await  primeSdk.clearUserOpsFromBatch();

    // add transactions to the batch
    const transactionBatch = await primeSdk.addUserOpsToBatch({to: destinationAddress, value: ethers.utils.parseEther(amount)});
    console.log('transactions: ', transactionBatch);

    const arka_api_key = 'arka_public_key';
    const arka_url = 'https://arka.etherspot.io';
    const arkaPaymaster = new ArkaPaymaster(114, arka_api_key, arka_url);
    console.log(await arkaPaymaster.addWhitelist([etherspotWalletAddress]))


    // Add paymaster data to the userop when estimating
    const estimation = await primeSdk.estimate({
      paymasterDetails: {
        url: `https://arka.etherspot.io?apiKey=arka_public_key&chainId=114`,
        context: { mode: "sponsor" },
      },
    });

    // sign the UserOp and sending to the bundler...
    const uoHash = await primeSdk.send(estimation);
    console.log(`UserOpHash: ${uoHash}`);
    alert("Transaction sent!");
  }

  return (
    <div className="App-header">

      <img className="App-logo" src={logo}></img>
      <h1  className="App-title">Getting started with Etherspot Prime</h1>

      <p> To initialise the SDK, it requires a Key Based Wallet(KBW) to be passed in.</p>

      <button className="App-button" onClick={() => generateRandomEOA()}>
            First click here to generate a random KBW. 
      </button>
      <a target="_blank" href={"https://coston2-explorer.flare.network/address/" + eoaWalletAddress}>
        KBW Address: {eoaWalletAddress}
      </a>

      <p>
        Now we can intialise the SDK with this address as the owner, and create an Etherspot smart contract wallet on Flare!
      </p>

      <button className="App-button" onClick={() => generateEtherspotWallet()}>
            Generate Etherspot Smart Contract Wallet
      </button>
      <p>
        Etherspot Smart Account Address:
        <a target="_blank" className="App-button" href={"https://coston2-explorer.flare.network/address/" + etherspotWalletAddress}>
        {etherspotWalletAddress}
        </a>
      </p>

      <a className="App-button" target="_blank" href="https://coston2-faucet.towolabs.com/">
        Now you have a wallet created on Coston2 you can fund it with this faucet.</a>

      <p>
        Now let's try sending a transaction.
      </p>
      <input className="App-input"
              type="text"
              value={destinationAddress}
              onChange={(event) => setDestinationAddress(event.target.value)}
              placeholder="Destination Address"
            />
            <input className="App-input"
              type="text"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Amount in FLR"
            />
            <hr />
            <button className="App-button" onClick={() => sendFunds()}>Send FLR!</button>
      
    </div>
  )
}

export default App;
