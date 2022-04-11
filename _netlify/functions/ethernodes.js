import fetch from 'node-fetch';
const API_ENDPOINT = 'https://ethernodes.org/api/clients';
let data;
let lastUpdate = 0;


// https://ethernodes.org/api/clients
// example ethernodes response:
// [
//   { "client":"geth",         "value":4421 },
//   { "client":"openethereum", "value":333  },
//   { "client":"erigon",       "value":300  },
//   { "client":"nethermind",   "value":63   },
//   { "client":"besu",         "value":31   },
//   { "client":"coregeth",     "value":5    },
//   { "client":"teth",         "value":3    },
//   { "client":"merp-client",  "value":2    }
// ]


exports.handler = async (event, context) => {
  // fetch data
  const fetchData = async () => {
    try {
      const response = await fetch(API_ENDPOINT).then( response => response.json() );
      // reformat to into obj
      let responseAsObj = {};
      for (let item in response) {
        let key = response[item]["client"];
        let val = response[item]["value"];
        responseAsObj[key] = val;
      }
      const metricValue = getMetricValue(responseAsObj, 1);
      console.log({"ethernodes_response": response});
      console.log({"ethernodes_responseAsObj": responseAsObj});
      console.log({"dataSource":"ethernodes","metricValue":metricValue});
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

