import React, { useEffect, useState, createContext, useContext } from 'react';
import { ethers } from 'ethers';
import { contractABI, contractAddress } from '../utils/constants';

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();

  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  return transactionContract;
};

const TransactionContext = createContext({});

const TransactionContextProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState(null);
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

  const getAllTransactions = async () => {
    try {
      if (!ethereum) return alert('Please install metamask');

      const transactionContract = getEthereumContract();

      const availableTransactions =
        await transactionContract.getAllTransactions();

      const structuredTransactions = availableTransactions.map(
        (transaction) => ({
          addressTo: transaction.receiver,
          addressFrom: transaction.sender,
          timestamp: new Date(
            transaction.timestamp.toNumber() * 1000
          ).toLocaleString(),
          message: transaction.message,
          keyword: transaction.keyword,
          amount: parseInt(transaction.amount._hex) / 10 ** 18,
        })
      );

      setTransactions(structuredTransactions);
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) return alert('Please install metamask');

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);

        getAllTransactions();
      } else {
        console.log('No accounts found');
      }
    } catch (error) {
      console.log(error);

      throw new Error('No ethereum object');
    }
  };

  const checkIfTransactionsExist = async () => {
    try {
      const transactionContract = getEthereumContract();
      const transactionCount = await transactionContract.getTransactionCount();

      window.localStorage.setItem('transactionCount', transactionCount);
    } catch (error) {
      console.log(error);

      throw new Error('No ethereum object');
    }
  };

  const connectWallet = async () => {
    try {
      //check if connect to metamask
      if (!ethereum) return alert('Please install metamask');

      //check to eth request account -> get all account and user able to connect one
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      //connect to first account
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);

      throw new Error('No ethereum object');
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert('Please install metamask');

      //get the data from the form
      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = getEthereumContract();

      const parsedAmount = ethers.utils.parseEther(amount); //parsed decimal to Gwei

      //send eth to another
      await ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: '0x5208', //hex value -> 21,000 Gwei
            value: parsedAmount._hex,
          },
        ],
      });

      //store our transaction
      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );

      setIsLoading(true);
      console.log(`Loading - ${transactionHash.hash}`);
      await transactionHash.wait();
      setIsLoading(false);
      console.log(`Success - ${transactionHash.hash}`);

      const transactionCount = await transactionContract.getTransactionCount();
      setTransactionCount(transactionCount.toNumber());

      window.reload();
    } catch (error) {
      console.log(error);

      throw new Error('No ethereum object');
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    checkIfTransactionsExist();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        setFormData,
        handleChange,
        sendTransaction,
        transactions,
        isLoading,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export default TransactionContextProvider;
export const useTransactionContext = () => useContext(TransactionContext);
