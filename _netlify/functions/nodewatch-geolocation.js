import fetch from 'node-fetch';
const API_ENDPOINT = 'https://nodewatch.chainsafe.io/query';
let data;
let lastUpdate = 0;


// https://api.nodewatch.io/query
// example response:
// {
//   "data": {
//     "aggregateByCountry": [
//       {
//         "name": "Italy",
//         "count": 22
//       },
//       {
//         "name": "Thailand",
//         "count": 17
//       },
//       ...
//       {
//         "name": "Vietnam",
//         "count": 3
//       }
//     ]
//   }
// }


exports.handler = async (event, context) => {
  // fetch data
  const fetchData = async () => {
    try {
      const query = `
        {
          aggregateByCountry {
            name
            count
          }
        }
      `;
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          query
        })
      }).then( response => response.json() );
      const metricValue = getMetricValue(response, 2);
      // console.log({"nodewatch-geolocation_response": response});
      console.log({"dataSource":"nodewatch-geolocation","metricValue":metricValue});
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

  // return the metric value from the response data
  function getMetricValue(obj, n) {
    // return obj["data"]["getRegionalStats"]["nonhostedNodePercentage"];
    // obj = data obj to evaluate
    // n = how many of the array items to calculate the value against;
    let arr = obj["data"]["aggregateByCountry"];
    let totalSize = 0;
    let sampleSize = 0;
    let metricValue;

    // sort by count
    arr.sort(function (a, b) {
      return b.count - a.count;
    });
    // get the total and sample size to derive the value
    arr.forEach(function (item) {
      totalSize += item["count"];
    });
    arr.slice(0, n).forEach(function (item) {
      sampleSize += item["count"];
    });

    // calculate the marketshare held by top (n) countries
    metricValue = Math.round(sampleSize/totalSize*10000)/100;

    // console.log(arr);
    // console.log(totalSize);
    // console.log(sampleSize);
    // console.log(metricValue);

    // return the marketshare held by minority countries
    return 100 - metricValue;
  }
}

