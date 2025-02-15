import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";

import { connectorsByName, injected } from "../web3/connectors";
import { Web3Provider } from "@ethersproject/providers";
import { createWalletContext } from "../utils/wallet";
import useWalletProvider from "./useWalletProvider";
import useAccount from "./useAccount";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { promptWeb3WalletUse } from "../web3/events";

export function useWalletEvents() {
  const context = useWeb3React<Web3Provider>();
  const { dispatchWalletContext } = useWalletProvider();
  const { dispatchAccount } = useAccount();
  const { library, chainId, account, active } = context;
  useEffect(() => {
    if (active) {
      createWalletContext(library).then(async (walletProvider) => {
        await dispatchAccount({
          type: "addWallet",
          wallet: { address: walletProvider.address, providerType: "browser" },
        });

        return dispatchWalletContext({
          type: "setActiveWallet",
          data: {
            ...walletProvider,
            providerType: "browser",
          },
        });
      });
    }
  }, [active, chainId, account]);
}

export function useInjectedWallet() {
  const context = useWeb3React<Web3Provider>();
  // const triedEager = useEagerConnect();
  useInactiveListener();

  const { active, activate } = context;

  return {
    activateInjected: () => {
      if (active) {
        return promptWeb3WalletUse();
      }
      return activate(connectorsByName.Injected);
    },
  };
}

export function useWalletLink() {
  const context = useWeb3React<Web3Provider>();
  // const triedEager = useEagerConnect();
  useInactiveListener();

  const { activate } = context;

  return {
    activateWalletLink: () => activate(connectorsByName.WalletLink),
  };
}

export function useWalletConnect() {
  const context = useWeb3React<Web3Provider>();
  // const triedEager = useEagerConnect();
  useInactiveListener();

  const { activate } = context;

  const resetWalletConnector = (connector: any) => {
    if (connector && connector instanceof WalletConnectConnector) {
      connector.walletConnectProvider = undefined;
    }
  };

  return {
    activateWalletConnect: () =>
      activate(connectorsByName.WalletConnect, (err) => {
        console.error(err);
        resetWalletConnector(connectorsByName.WalletConnect);
      }),
  };
}

// export function useLedger() {
//   const context = useWeb3React<Web3Provider>();
//   // const triedEager = useEagerConnect();
//   useInactiveListener();
//
//   const { active, activate, deactivate, error } = context;
//
//   useEffect(() => {}, [context]);
//
//   return {
//     activateLedger: () => {
//       if (active || error) {
//         deactivate();
//       }
//       return activate(connectorsByName.Ledger);
//     },
//   };
// }

export function useEagerConnect() {
  const { activate, active } = useWeb3React();

  const [tried, setTried] = useState(false);

  useEffect(() => {
    injected.isAuthorized().then((isAuthorized: boolean) => {
      if (isAuthorized) {
        activate(injected, undefined, true).catch(() => {
          setTried(true);
        });
      } else {
        setTried(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!tried && active) {
      setTried(true);
    }
  }, [tried, active]);

  return tried;
}

export function useInactiveListener(suppress: boolean = false) {
  const { active, error, activate } = useWeb3React();

  useEffect((): any => {
    const { ethereum } = window as any;
    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleConnect = () => {
        console.log("Handling 'connect' event");
        activate(injected);
      };
      const handleChainChanged = (chainId: string | number) => {
        console.log("Handling 'chainChanged' event with payload", chainId);
        activate(injected);
      };
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("Handling 'accountsChanged' event with payload", accounts);
        if (accounts.length > 0) {
          activate(injected);
        }
      };
      const handleNetworkChanged = (networkId: string | number) => {
        console.log("Handling 'networkChanged' event with payload", networkId);
        activate(injected);
      };

      ethereum.on("connect", handleConnect);
      ethereum.on("chainChanged", handleChainChanged);
      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("networkChanged", handleNetworkChanged);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener("connect", handleConnect);
          ethereum.removeListener("chainChanged", handleChainChanged);
          ethereum.removeListener("accountsChanged", handleAccountsChanged);
          ethereum.removeListener("networkChanged", handleNetworkChanged);
        }
      };
    }
  }, [active, error, suppress, activate]);
}
