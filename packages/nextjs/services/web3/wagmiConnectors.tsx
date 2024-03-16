import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import * as chains from "viem/chains";
import { configureChains } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import scaffoldConfig from "~~/scaffold.config";
import { getTargetNetworks } from "~~/utils/scaffold-eth";

const targetNetworks = getTargetNetworks();

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
const enabledChains = targetNetworks.find(network => network.id === 1)
  ? targetNetworks
  : [...targetNetworks, chains.mainnet, chains.baseSepolia];

/**
 * Chains for the app
 */
export const appChains = configureChains(enabledChains, [
  alchemyProvider({ apiKey: scaffoldConfig.alchemyApiKey }),
  publicProvider(),
]);

const walletsOptions = { chains: appChains.chains, projectId: scaffoldConfig.walletConnectProjectId };
const wallets = [metaMaskWallet({ ...walletsOptions, shimDisconnect: true }), walletConnectWallet(walletsOptions)];

/**
 * wagmi connectors for the wagmi context
 */
export const wagmiConnectors = connectorsForWallets([
  {
    groupName: "Supported Wallets",
    wallets,
  },
]);
