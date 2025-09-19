import React, { createContext, useState, useEffect } from 'react';
import Web3 from 'web3';
import PropertyEscrow from '../contracts/PropertyEscrow.json';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  
  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          const accounts = await web3Instance.eth.getAccounts();
          const networkId = await web3Instance.eth.net.getId();
          const deployedNetwork = PropertyEscrow.networks[networkId];
          
          setWeb3(web3Instance);
          setAccount(accounts[0]);
          setContract(new web3Instance.eth.Contract(
            PropertyEscrow.abi,
            deployedNetwork && deployedNetwork.address
          ));
        } catch (error) {
          console.error("Web3 initialization failed:", error);
        }
      }
    };
    
    initWeb3();
  }, []);
  
  return (
    <Web3Context.Provider value={{ web3, account, contract }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => React.useContext(Web3Context);
