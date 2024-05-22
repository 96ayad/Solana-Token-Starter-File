import {
  FC,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';

import {
  WalletAdapterNetwork,
  WalletError,
} from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import {
  WalletModalProvider as ReactUIWalletModalProvider,
} from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

import { notify } from '../utils/notifications';
import {
  AutoConnectProvider,
  useAutoConnect,
} from './AutoConnectProvider';
import {
  NetworkConfigurationProvider,
  useNetworkConfiguration,
} from './NetworkConfigurationProvider';

// import { error } from "console";

 const WalletContextProvider: FC<{ children: ReactNode }> = ( { children }) => {
  const { autoConnect } = useAutoConnect();
  const { networkConfiguration } = useNetworkConfiguration();
  const network = networkConfiguration as WalletAdapterNetwork;

  const originalEndpoint = useMemo(() => clusterApiUrl(network), [network]);

  let endpoint;

  if (network == "mainnet-beta") {
    endpoint = "URL";
  } else if (network == "devnet") {
    endpoint = originalEndpoint;
  } else {
    endpoint = originalEndpoint;
  }

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolletWalletAdapter(),
      new SolletExtensionWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    [network]
  );

  const onError = useCallback((error: WalletError) => {
    notify({
      type: "error",
      message: error.message ? `${error.name}: ${error.message}` : error.name,
    });
    console.error(error);
  }, []);

  return(
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect={autoConnect}>
        <ReactUIWalletModalProvider>{children}</ReactUIWalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
 };

 export const ContextProvider: FC<{ children: ReactNode }> = ({
  children,
 }) => {
  return (
    <>
     <NetworkConfigurationProvider>
      <AutoConnectProvider>
        <WalletContextProvider>{children}</WalletContextProvider>
      </AutoConnectProvider>
     </NetworkConfigurationProvider>
    </>
  );
 };