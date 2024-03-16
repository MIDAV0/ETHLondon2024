import Web3 from "web3"
import fetch from 'node-fetch';

import tokenMessengerAbi from './abis/cctp/TokenMessenger.json';
import messageAbi from './abis/cctp/Message.json';
import usdcAbi from 'packages/hardhat/abis/Usdc.json';
import messageTransmitterAbi from './abis/cctp/MessageTransmitter.json';

const CELO_ALFAJORES_PRIVATE_KEY = process.env.NEXT_PUBLIC_CELO_ALFAJORES_PRIVATE_KEY;
const ARBITRUM_SEPOLIA_PRIVATE_KEY = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_PRIVATE_KEY;
const BASE_SEPOLIA_PRIVATE_KEY = process.env.NEXT_PUBLIC_BASE_SEPOLIA_PRIVATE_KEY;

const CeloAlfajoresConfig = {
    NETWORK_KEY: 'CELO_ALFAJORES', // It could also be the ChainID
    PRIVATE_KEY: CELO_ALFAJORES_PRIVATE_KEY!,
    USDC_CONTRACT_ADDRESS: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B",
    TOKEN_MESSENGER_CONTRACT_ADDRESS: "Celo Alfajores Token Messenger Contract Address",
    MESSAGE_CONTRACT_ADDRESS: "Celo Alfajores Message Contract Address",
    RPC_URL: "https://alfajores-forno.celo-testnet.org",
    DESTINATION_DOMAIN_ID: 8
};

const ArbitrumSepoliaConfig = {
    NETWORK_KEY: 'ARBITRUM_SEPOLIA', // It could also be the ChainID
    PRIVATE_KEY: ARBITRUM_SEPOLIA_PRIVATE_KEY!,
    USDC_CONTRACT_ADDRESS: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    TOKEN_MESSENGER_CONTRACT_ADDRESS: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
    MESSAGE_CONTRACT_ADDRESS: "	0xC30362313FBBA5cf9163F0bb16a0e01f01A896ca",
    RPC_URL: "https://public.stackup.sh/api/v1/node/arbitrum-sepolia",
    DESTINATION_DOMAIN_ID: 3
};

const BaseSepoliaConfig = {
    NETWORK_KEY: 'BASE_SEPOLIA', // It could also be the ChainID
    PRIVATE_KEY: BASE_SEPOLIA_PRIVATE_KEY!,
    USDC_CONTRACT_ADDRESS: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    TOKEN_MESSENGER_CONTRACT_ADDRESS: "0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
    MESSAGE_CONTRACT_ADDRESS: "0x7865fAfC2db2093669d92c0F33AeEF291086BEFD",
    RPC_URL: "https://sepolia.base.org",
    DESTINATION_DOMAIN_ID: 6
};

const NetworkConfigurations = [
    CeloAlfajoresConfig,
    ArbitrumSepoliaConfig,
    BaseSepoliaConfig,
];


const waitForTransaction = async (web3: Web3, txHash: string) => {
    let transactionReceipt = await web3.eth.getTransactionReceipt(txHash);
    while (transactionReceipt != null && transactionReceipt.status === false) {
        transactionReceipt = await web3.eth.getTransactionReceipt(txHash);
        await new Promise(r => setTimeout(r, 4000));
    }
    return transactionReceipt;
}

const getContract = (web3:Web3, abi: any, contractAddress: string, address: string) => {
    const contract = new web3.eth.Contract(abi, contractAddress, {from: address});
    return contract;
}

const approve = async (usdcEthContract: any, ethTokenMessengerContractAddress: string, amount: string, web3: Web3) => {
    const approveTxGas = await usdcEthContract.methods.approve(ethTokenMessengerContractAddress, amount).estimateGas();
    const approveTx = await usdcEthContract.methods.approve(ethTokenMessengerContractAddress, amount).send({gas: approveTxGas});
    const approveTxReceipt = await waitForTransaction(web3, approveTx.transactionHash);
    console.log('ApproveTxReceipt: ', approveTxReceipt);
}

const burn = async (ethTokenMessengerContract: any, amount: string, destinationDomain: number, destinationAddressInBytes32: string, usdcEthContractAddress: string, web3: Web3) => {
    const burnTxGas = await ethTokenMessengerContract.methods.depositForBurn(amount, destinationDomain, destinationAddressInBytes32, usdcEthContractAddress).estimateGas();
    const burnTx = await ethTokenMessengerContract.methods.depositForBurn(amount, destinationDomain, destinationAddressInBytes32, usdcEthContractAddress).send({gas: burnTxGas});
    const burnTxReceipt = await waitForTransaction(web3, burnTx.transactionHash);
    console.log('BurnTxReceipt: ', burnTxReceipt);
    return burnTx;
}

const retrieveMessageBytes = async (burnTx: any, web3: Web3) => {
    const transactionReceipt = await web3.eth.getTransactionReceipt(burnTx.transactionHash);
    const eventTopic = web3.utils.keccak256('MessageSent(bytes)')
    const log = transactionReceipt.logs.find((l) => l.topics[0] === eventTopic)
    const messageBytes = web3.eth.abi.decodeParameters(['bytes'], log.data)[0];
    const messageHash = web3.utils.keccak256(messageBytes);
    console.log(`MessageBytes: ${messageBytes}`);
    console.log(`MessageHash: ${messageHash}`);
    return {messageBytes, messageHash};
}

const fetchAttestationSignature = async (messageHash: string) => {
    let attestationResponse: any = {status: 'pending'};
    while (attestationResponse.status !== 'complete') {
        const response = await fetch(`https://iris-api-sandbox.circle.com/attestations/${messageHash}`);
        attestationResponse = await response.json()
        await new Promise(r => setTimeout(r, 2000));
    }
    const attestationSignature = attestationResponse.attestation;
    console.log(`Signature: ${attestationSignature}`)
    return attestationSignature;
}

const receiveFunds = async (messageTransmitterContract: any, messageBytes: string, attestationSignature: string, web3: Web3) => {
    const receiveTxGas = await messageTransmitterContract.methods.receiveMessage(messageBytes, attestationSignature).estimateGas();
    const receiveTx = await messageTransmitterContract.methods.receiveMessage(messageBytes, attestationSignature).send({gas: receiveTxGas});
    const receiveTxReceipt = await waitForTransaction(web3, receiveTx.transactionHash);
    console.log('ReceiveTxReceipt: ', receiveTxReceipt);
};


const main = async (source: string, destination: string) => {
    const sourceNetworkConfig = NetworkConfigurations.find(config => config.NETWORK_KEY === source);
    const destinationNetworkConfig = NetworkConfigurations.find(config => config.NETWORK_KEY === destination);

    if (!sourceNetworkConfig || !destinationNetworkConfig) {
        console.log('Unsupported network configuration!');
        return;
    }

    // Initialize web3 instance with source configs
    const web3 = new Web3(sourceNetworkConfig.RPC_URL);

    const sourceSigner = web3.eth.accounts.privateKeyToAccount(sourceNetworkConfig.PRIVATE_KEY);
    web3.eth.accounts.wallet.add(sourceSigner);

    const destinationSigner = web3.eth.accounts.privateKeyToAccount(destinationNetworkConfig.PRIVATE_KEY);
    web3.eth.accounts.wallet.add(destinationSigner);

    const usdcSourceContract = getContract(web3, usdcAbi, sourceNetworkConfig.USDC_CONTRACT_ADDRESS, sourceSigner.address);
    const sourceTokenMessengerContract = getContract(web3, tokenMessengerAbi, sourceNetworkConfig.TOKEN_MESSENGER_CONTRACT_ADDRESS, sourceSigner.address);
    const sourceMessageContract = getContract(web3, messageAbi, sourceNetworkConfig.MESSAGE_CONTRACT_ADDRESS, sourceSigner.address);

    const mintRecipient = process.env.RECIPIENT_ADDRESS!;
    const destinationAddressInBytes32 = await sourceMessageContract.methods.addressToBytes32(mintRecipient).call();

    const amount = process.env.AMOUNT!;

    // Approve, Burn and Retrieve message bytes/hash
    await approve(usdcSourceContract, sourceNetworkConfig.TOKEN_MESSENGER_CONTRACT_ADDRESS, amount, web3);
    const burnTx = await burn(sourceTokenMessengerContract, amount, destinationNetworkConfig.DESTINATION_DOMAIN_ID, destinationAddressInBytes32, sourceNetworkConfig.USDC_CONTRACT_ADDRESS, web3);
    const {messageBytes, messageHash} = await retrieveMessageBytes(burnTx, web3);

    // Fetch attestation signature
    const attestationSignature = await fetchAttestationSignature(messageHash);

    
    // Initialize web3 instance with destination configs
    web3.setProvider(destinationNetworkConfig.RPC_URL);
    const destinationMessageTransmitterContract = getContract(web3, messageTransmitterAbi, destinationNetworkConfig.MESSAGE_CONTRACT_ADDRESS, destinationSigner.address);
    
    // Receive funds
    await receiveFunds(destinationMessageTransmitterContract, messageBytes, attestationSignature, web3);
};