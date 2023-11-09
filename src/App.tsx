'use client';

import React from 'react';
import { PrimeSdk } from '@etherspot/prime-sdk';
import { ethers } from 'ethers'
import './App.css';
import logo from "./etherspot.png"
import logo2 from "./etherspotxflare.png"


const App = () => {
  
  const [etherspotWalletAddress, setEtherspotWalletAddress] = React.useState('0x0000000000000000000000000000000000000000');
  const [eoaWalletAddress, setEoaWalletAddress] = React.useState('0x0000000000000000000000000000000000000000');
  // random private key
  const [eoaPrivateKey, setEoaPrivateKey] = React.useState('0xafdfd9c3d2095ef696594f6cedcae59e72dcd697e2a7521b1578140422a4f890');
  const [destinationAddress, setDestinationAddress] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const primeSdkDefault = new PrimeSdk({ privateKey: eoaPrivateKey}, { chainId: 114, projectKey: '' });
  const [primeSDK, setPrimeSDK] = React.useState<PrimeSdk>(primeSdkDefault);

  const generateRandomEOA = async () => {
    // Create random EOA wallet
    const randomWallet = ethers.Wallet.createRandom();
    setEoaWalletAddress(randomWallet.address);
    setEoaPrivateKey(randomWallet.privateKey);
}

  const generateEtherspotWallet = async () => {
    // Initialise Etherspot SDK
    const primeSdk = new PrimeSdk({ privateKey: eoaPrivateKey}, { chainId: 114, projectKey: '' });
    setPrimeSDK(primeSDK);
    const address: string = await primeSdk.getCounterFactualAddress();
    setEtherspotWalletAddress(address);
    console.log('\x1b[33m%s\x1b[0m', `EtherspotWallet address: ${address}`);
  }

  const sendFunds = async () => {

    // clear the transaction batch
    await primeSDK.clearUserOpsFromBatch();

    // add transactions to the batch
    const transactionBatch = await primeSDK.addUserOpsToBatch({to: destinationAddress, value: ethers.utils.parseEther(amount)});
    console.log('transactions: ', transactionBatch);

      // estimate transactions added to the batch and get the fee data for the UserOp
    const op = await primeSDK.estimate();
    //console.log(`Estimate UserOp: ${await printOp(op)}`);

    // sign the UserOp and sending to the bundler...
    const uoHash = await primeSDK.send(op);
    console.log(`UserOpHash: ${uoHash}`);
  }

  return (
    <div className="App-header">

      <img className="App-logo" src={logo2}></img>
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

      <a className="App-link" target="_blank" href="https://coston2-faucet.towolabs.com/">
        Now you have a wallet created on Coston2 you can fund it with this faucet.</a>

      <p>  
        <a className="App-link" target="_blank" href="https://etherspot.fyi/prime-sdk/intro">
        Now you have a wallet created you can explore what else we can do with the Prime SDK.</a>
      </p>

      <input
              type="text"
              value={destinationAddress}
              onChange={(event) => setDestinationAddress(event.target.value)}
            />
            <input
              type="text"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <hr />
            <button onClick={() => sendFunds()}>Send</button>
      
    </div>
  )
}

export default App;
