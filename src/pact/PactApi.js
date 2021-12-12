import Pact from "pact-lang-api";

const chainId = "3";
const network = `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/${chainId}/pact`;

const creationTime = () => Math.round((new Date).getTime()/1000)-10;
const GAS_PRICE = 0.00000001;

let pricesInKadena = {};

const getTokenToKadena = async (token) => {
    try {
      let data = await Pact.fetch.local({
          pactCode: `
          (use free.exchange)
          (let*
            (
              (p (get-pair ${token} coin))
              (reserveA (reserve-for p ${token}))
              (reserveB (reserve-for p coin))
            )[reserveA reserveB])
           `,
           meta: Pact.lang.mkMeta("account", chainId ,GAS_PRICE,3000,creationTime(), 600),
        }, network);
        console.log(data);
        if (data.result.status === "success"){
            const tokenReserve = getReserve(data.result.data[0]);
            const kadenaReserve = getReserve(data.result.data[1]);
            const ratio = kadenaReserve/ tokenReserve;
            return ratio;
        }
    } catch (e) {
      console.log(e)
    }
    return null;
  }

const getReserve = (tokenData) => {
    return tokenData.decimal? tokenData.decimal:  tokenData;
}

const getPriceInKadena = async (token) => {
  if (pricesInKadena[token] == null) {
    const ratio = await getTokenToKadena(token);
    pricesInKadena[token] = ratio;
  }
  return pricesInKadena[token];
}

export {getPriceInKadena};