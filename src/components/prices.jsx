import { getPriceInKadena } from '../pact/PactApi';
import Select from 'react-select'
import {useMemo, useState} from 'react';
import CoinGecko from 'coingecko-api/lib/CoinGecko';
import { useEffect } from 'react';

//2. Initiate the CoinGecko API Client
const CoinGeckoClient = new CoinGecko();

export const Prices = (props) => {
  const [fetchingKdaToUsd, setFetchingKdaToUsd] = useState(false);
  const [kdaToUsd, setKdaToUsd] = useState(null);
  const [currPrice, setCurrPrice] = useState(null);
  const [currTokenName, setCurrTokenName] = useState(null);
  const [fetchingPrice, setFetchingPrice] = useState(false);

  // Get the kadena price in USD once when first loading
  useEffect(() => {
    setFetchingKdaToUsd(true);
    (async () => {
      const result = await CoinGeckoClient.simple.price({ids: "kadena", vs_currencies: "usd"});
      setKdaToUsd(result.data.kadena.usd);
      setFetchingKdaToUsd(false);
    })();
  }, []);

  const options = useMemo(() => {
    return props.data?.map( data => ({value: data.address, label: data.name}));
  }, [props.data]);
  return (
    <div id='prices' className='text-center' style={{background: KITTY_KAD_BLUE}}>
      <div className='container'>
        <Title/>
        <div style={selectorAndOutputStyle}>
          <div style={{width: '200px', paddingTop: TOKEN_DATA_AND_SELECTOR_PADDING}}>
            <Select options={options} styles={SELECTOR_STYLES}
                onChange={(newValue) => {
                  setCurrTokenName(newValue.label);
                  setFetchingPrice(true);
                  getPriceInKadena(newValue.value).then(newPrice => {setCurrPrice(newPrice); setFetchingPrice(false)});
                }}
            />
          </div>
          <div style={tokenDataStyle}>
            <Price priceInKadena={currPrice} kdaToUsd={kdaToUsd} loading={fetchingPrice || fetchingKdaToUsd} currTokenName={currTokenName}/>
          </div>
        </div>
      </div>
    </div>
  );
}

function Price({priceInKadena, kdaToUsd, loading, currTokenName}) {
  let text = '';
  console.log(currTokenName);
  if (currTokenName == null) {
    text = "Please select a token";
  } else if (currTokenName === 'Kitty Kad (KittyKad)') {
    text = <>{"Token launching soon, visit "} <a style={{color:'white', textDecoration: "underline"}} 
      href="https://kittykad.com">kittycad.com</a> {"for more info"} </>
  } else if (loading == true) {
    text = 'loading...'
  } else if (kdaToUsd == null || priceInKadena == null) {
    text = 'had trouble fetching price, please try again';
  } else {
    const priceInUSD = priceInKadena*kdaToUsd;
    text = `USD: $${priceInUSD.toFixed(2)} KDA: ${priceInKadena.toFixed(4)}`;
  }
  return  (
    <p>{text}</p>);
}

function Title() {
  return         (<div className='section-title' style={{paddingTop: 40}}>
  <h2>Kadena Tokens Price Tracker</h2>
  <p>
    Track how your favourite tokens native to the Kadena blockchain are doing
  </p>
  <p> Time graph coming soon</p>
</div>);
}

const  KITTY_KAD_BLUE = "#58B2EE";
const TOKEN_DATA_AND_SELECTOR_PADDING = "20px";

const SELECTOR_STYLES = {
  option: (provided, state) => ({
    ...provided,
    color: state.isSelected? 'white': KITTY_KAD_BLUE,
    fontWeight: state.isFocused? 'bold' : 'normal',
  }),
  width: '200px',
};

const tokenDataStyle = {
  paddingTop: TOKEN_DATA_AND_SELECTOR_PADDING,
  display: "flex",
  paddingLeft: "50px",
  paddingRight: "50px",
  alignItems: "center",
}

const selectorAndOutputStyle = {
    display: "flex",
    direction: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    maxWidth: '100%',
    paddingLeft: "20px",
    paddingRight: "20px",  
    paddingTop: "20px",
}
