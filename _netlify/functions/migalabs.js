import fetch from 'node-fetch';
const API_ENDPOINT = 'https://migalabs.es/api/v1/client-distribution?crawler=london';
let data;
let lastUpdate = 0;


// https://migalabs.es/api-documentation
// https://migalabs.es/api/v1/client-distribution?crawler=london
// example migalabs response:
// {
//     "Grandine": 26,
//     "Lighthouse": 664,
//     "Lodestar": 4,
//     "Nimbus": 185,
//     "Others": 1,
//     "Prysm": 2349,
//     "Teku": 321
// }


exports.handler = async (event, context) => {
  // fetch data
  const fetchData = async () => {
    try {
      const response = await fetch(API_ENDPOINT).then( response => response.json() );
      const metricValue = getMetricValue(response, 1);
      console.log({"migalabs_response": response});
      console.log({"dataSource":"migalabs","metricValue":metricValue});
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

  // If cached data from the past 12 hrs, send that, otherwise fetchData
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
    console.log({"migalabs_array":arr})
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

