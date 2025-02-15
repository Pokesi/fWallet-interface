import useRestApi from "./useRestApi";

export const OPENOCEAN_BASEURL = "https://open-api.openocean.finance/v1/cross";

export enum OPENOCEAN_METHODS {
  GET_TOKENLIST = "/tokenList",
  GET_QUOTE = "/quote",
  GET_SWAP_QUOTE = "/swap_quote",
}

export type OOToken = {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  icon: string;
};

const useOpenOceanApi = () => {
  const { get } = useRestApi(OPENOCEAN_BASEURL);

  const getTokenList = () => {
    return get({
      path: OPENOCEAN_METHODS.GET_TOKENLIST,
      queryParams: [["chainId", 250]],
    });
  };

  const getQuote = (
    inToken: OOToken,
    outToken: OOToken,
    amount: string,
    slippage: number
  ) => {
    return get({
      path: OPENOCEAN_METHODS.GET_QUOTE,
      queryParams: [
        ["inTokenSymbol", inToken.symbol],
        ["inTokenAddress", inToken.address],
        ["outTokenSymbol", outToken.symbol],
        ["outTokenAddress", outToken.address],
        ["amount", amount],
        ["gasPrice", 100],
        ["slippage", slippage],
        ["exChange", "openoceanv2"],
        ["chainId", 250],
        ["withRoute", "routes"],
      ],
    });
  };

  const getSwapQuote = (
    inToken: OOToken,
    outToken: OOToken,
    amount: string,
    slippage: number,
    account: string
  ) => {
    return get({
      path: OPENOCEAN_METHODS.GET_SWAP_QUOTE,
      queryParams: [
        ["inTokenSymbol", inToken.symbol],
        ["inTokenAddress", inToken.address],
        ["in_token_decimals", inToken.decimals],
        ["outTokenSymbol", outToken.symbol],
        ["outTokenAddress", outToken.address],
        ["out_token_decimals", outToken.decimals],
        ["amount", amount],
        ["gasPrice", 100],
        ["slippage", slippage],
        ["exChange", "openoceanv2"],
        ["chainId", 250],
        ["account", account],
        ["withRoute", "routes"],
      ],
    });
  };

  return {
    getTokenList,
    getQuote,
    getSwapQuote,
  };
};

export default useOpenOceanApi;
