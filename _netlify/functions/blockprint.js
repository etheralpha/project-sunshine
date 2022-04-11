import fetch from 'node-fetch';
let data;
let lastUpdate = 0;


// https://github.com/sigp/blockprint/blob/main/docs/api.md
// https://api.blockprint.sigp.io/blocks_per_client/${startEpoch}/${endEpoch}
// example Blockprint response:
// {
//   "Uncertain": 0,
//   "Lighthouse": 46030,
//   "Lodestar": 0,
//   "Nimbus": 675,
//   "Other": 0,
//   "Prysm": 131291,
//   "Teku": 21713
// }


exports.handler = async (event, context) => {
  // fetch data
  const fetchData = async () => {
    const initialTimestamp = 1606824023; // seconds
    const initialEpoch = 0;
    const currentTimestamp = Math.floor(Date.now() / 1000); // seconds
    const deltaTimestamp = currentTimestamp - initialTimestamp; // seconds
    const currentEpoch = Math.floor(deltaTimestamp / 384);

    // the Blockprint API caches results so fetching data based on an "epoch day" so 
    // everyone that loads the page on an "epoch day" will use the cached results and 
    // their backend doesn't get overloaded
    // Michael Sproul recommends using a 2-week period
    const endEpoch = Math.floor(currentEpoch / 225) * 225;
    const startEpoch = endEpoch - 3150;
    const blockprintEndpoint = `https://api.blockprint.sigp.io/blocks_per_client/${startEpoch}/${endEpoch}`;

    try {
      const response = await fetch(blockprintEndpoint).then( response => response.json() );
      const metricValue = getMetricValue(response, 1);
      console.log({"blockprint_response": response});
      console.log({"dataSource":"blockprint","metricValue":metricValue});
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
  function getMetricValue(obj, n) {
    // obj = data obj to evaluate
    // n = how many of the array items to calculate the value against;
    let arr = [];
    let totalSize = 0;
    let sampleSize = 0;
    let value;

    // create array of objects
    for (var key in obj) {
      arr.push({ "key": key, "val": obj[key] });
    }
    // sort by value
    arr.sort(function (a, b) {
      return b.val - a.val;
    });
    // get the total and sample size to derive the value
    arr.forEach(function (item) {
      totalSize += item["val"];
    });
    arr.slice(0, n).forEach(function (item) {
      sampleSize += item["val"];
    });

    // calculate the marketshare held by majority clients
    value = Math.round(sampleSize/totalSize*10000)/100;

    // console.log(obj);
    // console.log(arr);
    // console.log(totalSize);
    // console.log(sampleSize);
    // console.log(value);

    // return the marketshare held by minority clients
    return 100 - value;
  }
}

