import fetch from 'node-fetch';
const API_ENDPOINT = 'https://frontend-git-feature-network-pen-rated-network.vercel.app/api/v0/entities?window=AllTime&from=0&size=100';
let data;
let lastUpdate = 0;
let stakingEntities = [
  "Lido",
  "Coinbase",
  "Kraken",
  "Binance",
  "Bitcoin Suisse",
  "Staked.us",
  "Rocketpool",
  "Bitfinex",
  "Huobi",
  "Bloxstaking",
  "Ankr",
  "Stakewise",
  "Stakefish",
  "OKex",
  "StakeHound",
  "Wexexchange",
  "Kucoin",
  "Poloniex"
];


// example response:
// {
//   "page": {
//     "size": 100,
//     "from": 50
//   },
//   "next": "/entities?window=AllTime&from=100&size=100",
//   "data": [
//     {
//       "window": "AllTime",
//       "entity": "Lido",
//       "timeWindow": "all",
//       "validatorCount": 97626,
//       "networkPenetration": 0.27569161833728,
//       "totalUniqueAttestations": 3388415765,
//       "avgCorrectness": 0.9859970436656258,
//       "avgInclusionDelay": 1.025131817612116,
//       "avgUptime": 0.9953287581501877,
//       "avgValidatorEffectiveness": 96.90610050422342,
//       "slashesReceived": 0,
//       "slashesCollected": 7,
//       "clientPercentages": [
//         {
//           "name": "Lighthouse",
//           "percentage": 0.4281887792238041
//         },
//         {
//           "name": "Nimbus",
//           "percentage": 0.02476198794654555
//         },
//         ...
//       ],
//       "clientStats": [
//         {
//           "name": "Lighthouse",
//           "percentage": 0.4281887792238041
//         },
//         {
//           "name": "Nimbus",
//           "percentage": 0.02476198794654555
//         },
//         ...
//       ]
//     },
//     ...
//   ]
// }



exports.handler = async (event, context) => {
  // fetch data
  const fetchData = async () => {
    try {
      let response = await fetch(API_ENDPOINT).then( response => response.json() );
      response = response["data"].filter( i => stakingEntities.includes( i.entity ) );
      const metricValue = getMetricValue(response, 1);
      console.log({"dataSource":"ratednetwork-pool-diversity","metricValue":metricValue});
      return metricValue;
    } catch (err) {
      return {
        statusCode: err.statusCode || 500,
        body: JSON.stringify({
          error: err.message
        })
      }
    }
  }

  // if cached data from the past 12 hrs, send that, otherwise fetchData
  const currentTime = new Date().getTime();
  const noData = (data === undefined || data === null);
  if (noData || ( currentTime - lastUpdate > 43200000 )) { // 43200000 = 12hrs
    const response = await fetchData();
    data = response;
    lastUpdate = new Date().getTime();
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    }
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    }
  }

  // calculate the metric value from the response data
  function getMetricValue(arr, n) {
    // arr = data arr to evaluate
    // n = how many of the array items to calculate the value against;
    let totalSize = 0;
    let sampleSize = 0;
    let metricValue;

    // sort by value
    arr.sort(function (a, b) {
      return b.networkPenetration - a.networkPenetration;
    });
    // get the sample size to derive the value
    arr.forEach(function (item) {
      totalSize += item["networkPenetration"];
    });
    arr.slice(0, n).forEach(function (item) {
      sampleSize += item["networkPenetration"];
    });

    // calculate the marketshare held by top (n) clients
    metricValue = Math.round(sampleSize/totalSize*10000)/100;

    // console.log(arr[0]);
    // console.log(sampleSize);
    // console.log(metricValue);

    // return the marketshare held by minority clients
    return 100 - metricValue;
  }
}

