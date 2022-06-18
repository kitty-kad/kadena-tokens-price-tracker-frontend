import { getPriceInKadena } from "../pact/PactApi";
import Select from "react-select";
import { useMemo, useState } from "react";
import CoinGecko from "coingecko-api/lib/CoinGecko";
import { PriceGraph } from "./price-graph";
import { useEffect } from "react";
import Toggle from "react-toggle";

//2. Initiate the CoinGecko API Client
const CoinGeckoClient = new CoinGecko();
const NOW = unixDaysAgo(0);
const dateOptions = [
  {
    value: { from: unixDaysAgo(2), to: NOW },
    label: "1d",
  },
  {
    value: { from: unixDaysAgo(7), to: NOW },
    label: "7d",
  },
  {
    value: { from: unixDaysAgo(30), to: NOW },
    label: "30d",
  },
  {
    value: { from: unixDaysAgo(365), to: NOW },
    label: "365d",
  },
];

const DEFAULT_DATE_OPTION = 2;

const SAVE_KEYS = {
  SAVE_IN_KDA: "SAVE_IN_KDA",
  SAVE_SHOW_CANDLE: "SAVE_SHOW_CANDLE",
  SAVE_DATE_OPTION: "SAVE_DATE_OPTION",
  SAVE_CURR_TOKEN_NAME: "SAVE_CURR_TOKEN_NAME",
  SAVE_CURR_TOKEN_ADDRESS: "SAVE_CURR_TOKEN_ADDRESS",
};

const savedShowInKda = tryLoadLocal(SAVE_KEYS.SAVE_IN_KDA) ?? false;
const savedShowCandle = tryLoadLocal(SAVE_KEYS.SAVE_SHOW_CANDLE) ?? false;
const savedDateOption =
  tryLoadLocal(SAVE_KEYS.SAVE_DATE_OPTION) ?? DEFAULT_DATE_OPTION;
const savedCurrTokenName = tryLoadLocal(SAVE_KEYS.SAVE_CURR_TOKEN_NAME);
const savedCurrTokenAddress = tryLoadLocal(SAVE_KEYS.SAVE_CURR_TOKEN_ADDRESS);

export const Prices = (_props) => {
  const [fetchingKdaToUsd, setFetchingKdaToUsd] = useState(false);
  const [tokensData, setTokensData] = useState(null);
  const [kdaToUsd, setKdaToUsd] = useState(null);
  const [currPrice, setCurrPrice] = useState(null);
  const [currTokenName, setCurrTokenName] = useState(savedCurrTokenName);
  const [currTokenAddress, setCurrTokenAddress] = useState(
    savedCurrTokenAddress
  );
  const [fetchingPrice, setFetchingPrice] = useState(false);
  const [currTokenHistoricalData, setCurrTokenHistoricalData] = useState([]);
  const [currTokenCandleData, setCurrTokenCandleData] = useState([]);
  const [showInKda, setShowInKda] = useState(savedShowInKda);
  const [fromTo, setFromTo] = useState(dateOptions[savedDateOption].value);
  const [showCandle, setShowCandle] = useState(savedShowCandle);

  // Get the kadena price in USD once when first loading
  useEffect(() => {
    setFetchingKdaToUsd(true);
    getTokens((data) => {
      setTokensData([
        ...data,
        {
          name: "Kitty Kad (KittyKad)",
          address: "coming-soon",
        },
      ]);
    });
    (async () => {
      const result = await CoinGeckoClient.simple.price({
        ids: "kadena",
        vs_currencies: "usd",
      });
      setKdaToUsd(result.data.kadena.usd);
      setFetchingKdaToUsd(false);
    })();
  }, []);

  useEffect(() => {
    if (currTokenAddress == null) {
      return;
    }
    getHistoricalPrices(currTokenAddress, fromTo, (data) =>
      setCurrTokenHistoricalData(data)
    );
    getCandleHistoricalPrices(currTokenAddress, fromTo, (data) => {
      setCurrTokenCandleData(data);
    });
    const metadata = tokensData?.find((a) => a.address === currTokenAddress);
    getPriceInKadena(
      currTokenAddress,
      metadata?.exchange,
      metadata?.chainId
    ).then((newPrice) => {
      setCurrPrice(newPrice);
      setFetchingPrice(false);
    });
  }, [currTokenAddress, fromTo, tokensData]);

  const tokenOptions = useMemo(() => {
    return tokensData?.map((data) => ({
      value: data.address,
      label: data.name,
    }));
  }, [tokensData]);

  const setUpdateShowInKda = (val) => {
    setShowInKda(val);
    trySaveLocal(SAVE_KEYS.SAVE_IN_KDA, val);
  };

  const setUpdateFromTo = (val) => {
    setFromTo(val);
    let index;
    for (let i = 0; i < dateOptions.length; i++) {
      if (dateOptions[i].value.from === val.from) {
        index = i;
        break;
      }
    }
    if (index != null) {
      trySaveLocal(SAVE_KEYS.SAVE_DATE_OPTION, index);
    }
  };

  const setUpdateShowCandle = (val) => {
    setShowCandle(val);
    trySaveLocal(SAVE_KEYS.SAVE_SHOW_CANDLE, val);
  };

  const setUpdateCurrTokenName = (val) => {
    setCurrTokenName(val);
    trySaveLocal(SAVE_KEYS.SAVE_CURR_TOKEN_NAME, val);
  };

  const setUpdateCurrTokenAddress = (val) => {
    setCurrTokenAddress(val);
    trySaveLocal(SAVE_KEYS.SAVE_CURR_TOKEN_ADDRESS, val);
  };

  return (
    <div
      id="prices"
      className="text-center"
      style={{ background: KITTY_KAD_BLUE }}
    >
      <div className="container">
        <Title />
        <div style={selectorAndGraphStyle}>
          <div
            style={{
              display: "flex",
              width: "100%",
              paddingTop: TOKEN_DATA_AND_SELECTOR_PADDING,
              zIndex: 15,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div style={{ width: "200px", paddingRight: 20 }}>
              <Select
                options={tokenOptions}
                styles={SELECTOR_STYLES}
                placeholder={savedCurrTokenName ?? "Select a token"}
                onChange={(newValue) => {
                  setUpdateCurrTokenName(newValue.label);
                  setUpdateCurrTokenAddress(newValue.value);
                  setFetchingPrice(true);
                }}
              />
            </div>
            <div style={{ width: "100px" }}>
              <Select
                defaultValue={dateOptions[savedDateOption]}
                options={dateOptions}
                styles={{ ...SELECTOR_STYLES, width: "10px" }}
                onChange={(newValue) => {
                  setUpdateFromTo(newValue.value);
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                paddingLeft: 20,
              }}
            >
              <div>Candle View (Beta)</div>
              <Toggle
                defaultChecked={savedShowCandle}
                icons={false}
                onChange={(e) => setUpdateShowCandle(e?.target?.checked)}
              />
            </div>
          </div>
          <div style={tokenDataStyle}>
            <Price
              priceInKadena={currPrice}
              kdaToUsd={kdaToUsd}
              loading={fetchingPrice || fetchingKdaToUsd}
              currTokenName={currTokenName}
            />
          </div>
          <div className="App" style={{ fontFamily: "Roboto" }}></div>
          <PriceGraph
            data={currTokenHistoricalData}
            currPrice={currPrice}
            kdaToUsd={kdaToUsd}
            showInKda={showInKda}
            dataCandle={currTokenCandleData}
            showCandle={showCandle}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
            }}
          >
            <button
              style={buttonStyle}
              className={`btn btn-custom  ${
                showInKda === false ? "active" : ""
              }`}
              onClick={() => setUpdateShowInKda(false)}
            >
              In USD
            </button>
            <button
              style={buttonStyle}
              className={`btn btn-custom ${showInKda === true ? "active" : ""}`}
              onClick={() => setUpdateShowInKda(true)}
            >
              In KDA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function getTokens(callback) {
  const url = `https://kadena-tokens-price-fetcher.herokuapp.com/getTokenMetadata`;
  fetchJson(url, callback);
}

function getCandleHistoricalPrices(tokenAddress, fromTo, callback) {
  const fromToParams =
    fromTo?.from == null || fromTo?.to == null
      ? ""
      : `&fromTime=${fromTo.from}&toTime=${fromTo.to}`;
  const url =
    `https://kadena-tokens-price-fetcher.herokuapp.com/getCandlePrices?tokenAddress=${tokenAddress}` +
    fromToParams;
  fetchJson(url, callback);
}

function getHistoricalPrices(tokenAddress, fromTo, callback) {
  const fromToParams =
    fromTo?.from == null || fromTo?.to == null
      ? ""
      : `&fromTime=${fromTo.from}&toTime=${fromTo.to}`;
  const url =
    `https://kadena-tokens-price-fetcher.herokuapp.com/getPrices?tokenAddress=${tokenAddress}` +
    fromToParams;
  fetchJson(url, callback);
}

function fetchJson(url, callback) {
  const params = {
    method: "GET", // *GET, POST, PUT, DELETE, etc.
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };
  fetch(url, params)
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      callback(json);
    });
}

function Price({ priceInKadena, kdaToUsd, loading, currTokenName }) {
  let text = "";
  console.log(currTokenName);
  if (currTokenName == null) {
    text = "Please select a token";
  } else if (currTokenName === "Kitty Kad (KittyKad)") {
    text = (
      <>
        {"Token launching soon, visit "}{" "}
        <a
          style={{ color: "white", textDecoration: "underline" }}
          href="https://kittykad.com"
        >
          kittykad.com
        </a>{" "}
        {"for more info"}{" "}
      </>
    );
  } else if (loading == true) {
    text = "loading...";
  } else if (kdaToUsd == null || priceInKadena == null) {
    text = "had trouble fetching price, please try again";
  } else {
    const priceInUSD = priceInKadena * kdaToUsd;
    text = `USD: $${priceInUSD.toFixed(2)} KDA: ${priceInKadena.toFixed(4)}`;
  }
  return <p>{text}</p>;
}

function Title() {
  return (
    <div className="section-title" style={{ paddingTop: 40 }}>
      <h2>Kadena Tokens Price Tracker</h2>
      <p>
        Track how your favourite tokens native to the Kadena blockchain are
        doing
      </p>
    </div>
  );
}

function unixDaysAgo(days) {
  const today = new Date();
  return Math.floor(
    new Date(new Date().setDate(today.getDate() - days)).getTime() / 1000
  );
}

function tryLoadLocal(key) {
  let val = localStorage.getItem(key);
  if (val == null) {
    return null;
  }
  try {
    return JSON.parse(val);
  } catch (e) {
    console.log(e);
    return null;
  }
}

function trySaveLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.log(e);
    return;
  }
}

const KITTY_KAD_BLUE = "#58B2EE";
const TOKEN_DATA_AND_SELECTOR_PADDING = "20px";

const SELECTOR_STYLES = {
  option: (provided, state) => ({
    ...provided,
    color: state.isSelected ? "white" : KITTY_KAD_BLUE,
    fontWeight: state.isFocused ? "bold" : "normal",
  }),
  width: "200px",
};

const tokenDataStyle = {
  paddingTop: TOKEN_DATA_AND_SELECTOR_PADDING,
  display: "flex",
  paddingLeft: "50px",
  paddingRight: "50px",
  alignItems: "center",
};

const selectorAndGraphStyle = {
  display: "flex",
  flexDirection: "column",
  flexWrap: "wrap",
  justifyContent: "flex-start",
  alignItems: "center",
  maxWidth: "100%",
  paddingLeft: "20px",
  paddingRight: "20px",
};

const buttonStyle = {
  margin: "0 10",
  textTransform: "none",
};
