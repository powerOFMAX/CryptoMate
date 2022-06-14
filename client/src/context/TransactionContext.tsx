import { createContext, useEffect, useState } from "react";
import { ethers } from 'ethers';
import { contractABI, contractAddress } from "../utils/contants";


export const TransactionContext = createContext({});

declare var window: any
const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(contractAddress, contractABI, signer);

  console.log({
    provider,
    signer,
    transactionContract
  })
}

export const TransactionProvider = ({ children }: any) => {
  return (
    <TransactionContext.Provider value={{}}>
      {children}
    </TransactionContext.Provider>
  )
}