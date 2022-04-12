import fetch from 'node-fetch';
const API_ENDPOINT = 'https://api.nodewatch.io/query';
let data;
let lastUpdate = 0;


// https://api.nodewatch.io/query
// example response:
// {
//   "data": {
//     "getRegionalStats": {
//       "hostedNodePercentage": 58.662581871962814,
//       "nonhostedNodePercentage": 41.337418128037186
//     }
//   }
// }


exports.handler = async (event, context) => {
  // fetch data
  const fetchData = async () => {
    try {
      const query = `
        {
          getRegionalStats {
            hostedNodePercentage
            nonhostedNodePercentage
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
      const metricValue = getMetricValue(response);
      // console.log({"nodewatch-hosted-validators_response": response});
      console.log({"dataSource":"nodewatch-hosted-validators","metricValue":metricValue});
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

  // return the marketshare held by non-hosted validators
  function getMetricValue(obj) {
    return obj["data"]["getRegionalStats"]["nonhostedNodePercentage"];
  }
}

