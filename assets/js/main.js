---
---


// enable tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})


// array of metric objects, data pulled from _data/metrics.yml
var metrics = {{site.data.metrics | jsonify}};

// used to standardize metric ratings in calculating overall health
let overallDanger = 50;
let overallGoal = 70;

// the upper limit for the overall health percent for this emoji to be highlighted
// used in setHealthLevel()
let emojiHealthLimit_1 = 20;
let emojiHealthLimit_2 = 40;
let emojiHealthLimit_3 = 50;
let emojiHealthLimit_4 = 65;
let emojiHealthLimit_5 = 75;
let emojiHealthLimit_6 = 85;
let emojiHealthLimit_7 = 100;

// the overall health percent that max sunniness reached
let sunMaxPercent = 85;
// the overall health percent the clouds a completely gone
let cloudMaxPercent = overallGoal;


function load() {
  checkDarkMode();
  // try catch is used to determine if current page is the dashboard or not
  try {
    // loop through the enabled metrics, fetch updated values, and replace the default (fallback) values
    for (let metric in metrics) {
      if (!metrics[metric]["disabled"]) {
        let metricId = metrics[metric]["id"];
        let dataSource = getDataSource(metricId);
        let defaultValue = metrics[metric]["default_value"];
        getData(metricId, dataSource, defaultValue).then(updateProgressBar);
      }
    }
    // calculate health level, set the sunniness, and show the health level; runs only on load
    getHealthLevel().then(setSun).then(setHealthLevel);
  }
  // execute if on a page other than the dashboard
  catch {
    let percent = localStorage.getItem("healthLevel") || 50;
    setSun(percent);
  }
}
window.onload = load();


// get data source from select dropdown
function getDataSource(metricId) {
  let id = "select-" + metricId;
  let select = document.getElementById(id);
  let dataSource = select.value;
  return dataSource;
}


// call netlify serverless function to fetch data
async function getData(metricId, dataSource, defaultValue) {
  // get the metric object with a matching id
  let metric = metrics.find(x => x.id === metricId);

  // set the metric value to the cached value, otherwise set to the default value
  let metricValue = metric[dataSource] || defaultValue;

  // show the progress bar loading indicator while updating
  showLoadingBar(metricId, true);

  try {
    // only fetch value if it hasn't been called yet, otherwise use cached value: metric[dataSource]
    if (!metric[dataSource]) {
      const url = "/.netlify/functions/" + dataSource + "/";
      const [data] = await Promise.all([
        fetch(url)
      ]);
      const response = await data.json();
      metricValue = Number(response);
      // cache the response in the metric object for later use
      metric[dataSource] = metricValue;
    }
  }
  catch {
    console.error(`Failed to load data from ${dataSource}`)
  }

  // console.log({"metricId":metricId,"dataSource":dataSource,"defaultValue":defaultValue,"metricValue":metricValue});
  return [metricId, metricValue];
}


// update the progress bar with the passed in data
function updateProgressBar(data) {
  // data = [metricId, metricValue]
  let metricId = data[0];
  let metricValue = Math.round(data[1] * 100) / 100;
  let goalValue, dangerValue, color;
  for (let metric in metrics) {
    if (metrics[metric]["id"] == metricId) {
      goalValue = metrics[metric]["goal_value"];
      dangerValue = metrics[metric]["danger_value"];
    }
  }

  // set the color
  if (metricValue < dangerValue) {
    color = "danger";
  } else if (metricValue > goalValue) {
    color = "success";
  } else {
    color = "warning";
  }

  // build and update the html
  let progressBarParent = document.getElementById("progress-" + metricId);
  let progressBar = `<div class="progress-bar position-absolute bg-${color}" role="progressbar" 
    aria-valuemin="0" aria-valuemax="100" aria-valuenow="${metricValue}" 
    style="width: ${metricValue}%; height: 1.1rem;">
    ${metricValue}%
  </div>`;
  progressBarParent.innerHTML = progressBar;

  // hide the progress bar loading indicator
  showLoadingBar(metricId, false);
}


// calculate the decentralization health level
async function getHealthLevel() {
  // standardized zones to calculate each metric against so (for example) metrics
  // with a value of 30% and a danger_value of 40 and 70 are treated equally)
  let standardizedDanger = overallDanger;
  let standardizedGoal = overallGoal;
  let accumulatedValue = 0;
  let totalSize = 0;

  // loop through the enabled metrics
  const enabledMetrics = metrics.filter(function (metric) { return metric.disabled === false; });
  enabledMetrics.map(metric => {
    let select = document.getElementById("select-" + metric["id"]);
    let dataSource = select.value;
    let metricValue = metric[dataSource] || metric["default_value"];

    // calculate the percentage the metric is within it''s current range and then get the standardized percentage
    let metricPercent;
    let standardPercent;
    if (metricValue < metric["danger_value"]) {
      metricPercent = metricValue / metric["danger_value"];
      standardPercent = metricPercent * standardizedDanger;
    } else if (metricValue < metric["danger_goal"]) {
      metricPercent = metricValue / metric["goal_value"] * standardizedGoal;
      standardPercent = metricPercent * standardizedGoal;
    } else {
      metricPercent = metricValue / 100;
      standardPercent = metricPercent * 100;
    }

    // update the accumulated value and total weight to calculate the sunniness percentage later
    accumulatedValue += standardPercent * metric["influence"];
    totalSize += metric["influence"];
  })

  // calculate the sunniness percentage
  let percent = (accumulatedValue / totalSize) + 20;
  console.log(`The sunniness (decentralization health) level is ${Math.round(percent * 100) / 100}%`)
  localStorage.setItem("healthLevel", percent);

  return percent;
}


// set the sun's position
async function setSun(percent) {
  // the sun is the yellow/orange in the upper left of the screen
  // the cloud is the haze when initially loading
  // the amount the cloud fades out and sun moves in is based on the 'percent' parameter

  // convert the percent into decimal value with weight added
  // weight added so sun is fully revealed at sunMaxPercent
  let sunWeight = (100 / sunMaxPercent);
  let sunPercent = percent / 100 * sunWeight;
  // starting translate values at max hidden state: translate(-85%, -85%);
  let sunStartX = -95;
  let sunStartY = -95;
  // range for translate values to reach max shown state: translate(-55%, -45%);
  let sunRangeX = 30;
  let sunRangeY = 40;
  // calculate final translate values
  let sunFinalX = sunStartX + (sunPercent * sunRangeX);
  let sunFinalY = sunStartY + (sunPercent * sunRangeY);
  // make sure values don't exceed max shown state
  sunFinalX = (sunFinalX > -55) ? -55 : sunFinalX;
  sunFinalY = (sunFinalY > -45) ? -45 : sunFinalY;
  // update sun element
  let sun = document.getElementById('sun');
  let translate = "translate(" + sunFinalX + "%, " + sunFinalY + "%)";
  sun.style.transform = translate;

  // convert the percent into decimal value with weight added
  // weight added so clouds are completely faded at cloudMaxPercent
  let cloudWeight = (100 / cloudMaxPercent);
  let cloudPercent = percent / 100 * cloudWeight;
  // starting opacity value at max shown state: rgba(153,153,153,0.7);
  let cloudStart = 0.7;
  // range for opacity value to reach max hidden state: rgba(153,153,153,0);
  let cloudRange = 0.7;
  // calculate final opacity
  let cloudFinal = cloudStart - (cloudPercent * cloudRange);
  // make sure 0 is the lowest it can be set to
  cloudFinal = (cloudFinal < 0) ? 0 : cloudFinal;
  // update cloud element
  let clouds = document.getElementById('clouds');
  let color = "rgba(153,153,153," + cloudFinal + ")";
  clouds.style.background = color;

  return percent;
}


// set the health status info in the header
function setHealthLevel(percent) {
  percent = Math.round(percent);
  let healthContainer = document.getElementById("healthContainer");

  // set the health level
  let healthLevel = document.getElementById("healthLevel");
  let html = `Overall Health: ${percent}%`;
  healthLevel.innerHTML = html;

  // highlight the appropriate emoji
  let emoji;
  if (percent <= emojiHealthLimit_1) {
    emoji = document.querySelector(".bi-emoji-dizzy");
  } else if (percent <= emojiHealthLimit_2) {
    emoji = document.querySelector(".bi-emoji-angry");
  } else if (percent <= emojiHealthLimit_3) {
    emoji = document.querySelector(".bi-emoji-frown");
  } else if (percent <= emojiHealthLimit_4) {
    emoji = document.querySelector(".bi-emoji-neutral");
  } else if (percent <= emojiHealthLimit_5) {
    emoji = document.querySelector(".bi-emoji-smile");
  } else if (percent <= emojiHealthLimit_6) {
    emoji = document.querySelector(".bi-emoji-laughing");
  } else if (percent > emojiHealthLimit_7) {
    emoji = document.querySelector(".bi-emoji-sunglasses");
  }
  emoji.classList.add("active");

  // show the health status
  healthContainer.classList.remove("d-none");
}


// toggle progress bar loading indicator
function showLoadingBar(metricId, show) {
  let progressBarParent = document.getElementById("progress-" + metricId);
  if (show) {
    progressBarParent.firstElementChild.classList.add("placeholder");
  } else {
    progressBarParent.firstElementChild.classList.remove("placeholder");
  }
}


// check if dark mode is set
function checkDarkMode() {
  let darkModeEnabled = localStorage.getItem("darkModeEnabled");
  if (darkModeEnabled === null) {
    let matched = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if(matched) {
      setDarkMode("true");
    } else {
      setDarkMode("false")
    }
  } else {
    setDarkMode(darkModeEnabled);
  }
}


// toggle dark mode theme
function setDarkMode(enabled) {
  document.getElementById("enableDarkMode").classList.add("d-none");
  document.getElementById("disableDarkMode").classList.add("d-none");
  var root = document.getElementsByTagName("html")[0];
  if (enabled == "true") {
    console.log("Dark Mode enabled");
    root.classList.add("dark-mode");
    document.getElementById("disableDarkMode").classList.remove("d-none");
    localStorage.setItem("darkModeEnabled", "true");
  } else if (enabled == "false") {
    console.log("Dark Mode disabled");
    root.classList.remove("dark-mode");
    document.getElementById("enableDarkMode").classList.remove("d-none");
    localStorage.setItem("darkModeEnabled", "false");
  }
}



