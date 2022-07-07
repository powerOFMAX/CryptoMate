import { createContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { contractABI, contractAddress } from '../utils/contants';

type TContext = {
  connectWallet?: () => void;
  currentAccount?: string;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => void | undefined;
  sendTransactions: () => void;
  formData: {
    addressTo: string;
    amount: string;
    keyword: string;
    message: string;
  };
  transactions: any;
  isLoading: boolean;
};

export const TransactionContext = createContext({} as TContext);

declare var window: any;
const { ethereum } = window;

const handleNoEthereum = (error: unknown) => {
  console.log(error);
  throw new Error('No ethereum object');
};

const getEthereumContract = async () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  await provider.send('eth_requestAccounts', []);

  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  return transactionContract;
};

export const TransactionProvider = ({ children }: any) => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [formData, setFormData] = useState({
    addressTo: '',
    amount: '',
    keyword: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem('transactionCount')
  );
  const [transactions, setTransactions] = useState([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) => {
    setFormData((prevState) => ({ ...prevState, [name]: e?.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      if (!ethereum) return alert('Please install a wallet, e.g: Metamask');
      const transactionContract = await getEthereumContract();
      const availableTransactions =
        await transactionContract.getAllTransactions();

      const structuredTransactions = availableTransactions.map(
        (t: {
          receiver: any;
          sender: any;
          timestamp: { toNumber: () => number };
          message: any;
          keyword: any;
          amount: { _hex: string };
        }) => ({
          addressTo: t.receiver,
          addressFrom: t.sender,
          timestamp: new Date(t.timestamp.toNumber() * 1000).toLocaleString(),
          message: t.message,
          keyword: t.keyword,
          amount: parseInt(t.amount._hex) / 10 ** 18,
        })
      );

      setTransactions(structuredTransactions);
      console.log(structuredTransactions);
    } catch (error) {
      handleNoEthereum(error);
    }
  };

  const checkIfWalletIsconnected = async () => {
    try {
      if (!ethereum) return alert('Please install a wallet, e.g: Metamask');
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);

        getAllTransactions();
      } else {
        console.log('No accounts found');
      }
    } catch (error) {
      handleNoEthereum(error);
    }
  };

  const checkIfTransactionsExist = async () => {
    try {
      const transactionContract = await getEthereumContract();
      const transactionCount = await transactionContract.getTransactionCount();

      window.localStorage.setItem('transactionCount', transactionCount);
    } catch (error) {
      handleNoEthereum(error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum) return alert('Please install a wallet, e.g: Metamask');
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      handleNoEthereum(error);
    }
  };

  const sendTransactions = async () => {
    try {
      if (!ethereum) return alert('Please install a wallet, e.g: Metamask');
      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = await getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);

      await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: '0x5208', //hex 21k GWEI
            value: parsedAmount._hex,
          },
        ],
      });

      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );

      setIsLoading(true);
      console.log(`loading - ${transactionHash.hash}`);
      await transactionHash.wait();

      setIsLoading(false);
      console.log(`Success - ${transactionHash.hash}`);

      const transactionCount = await transactionContract.getTransactionCount();
      setTransactionCount(transactionCount.toNumber());
      window.reload();
    } catch (error) {
      handleNoEthereum(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsconnected();
    checkIfTransactionsExist();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        handleChange,
        sendTransactions,
        formData,
        transactions,
        isLoading,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
