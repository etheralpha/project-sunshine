# Project Sunshine

This is the repo for <https://ethsunshine.com>, a site to monitor the health of Ethereum's decentralization.

|Discord Server|
|:---:|
|![Discord Shield](https://discordapp.com/api/guilds/825089839309389864/widget.png?style=shield)|

**Table of Contents**
- [Intro](#intro)
	- [Introduction & Purpose](#introduction--purpose)
	- [Contributing](#contributing)
- [Current Metrics](#current-metrics)
- [Adding a New Metric](#adding-a-new-metric)
	- [Metric Outline](#metric-outline)
	- [Metric Integration](#metric-integration)
	- [Metric Modal Content](#metric-modal-content)
- [Development](#development)
	- [Local Development](#local-development)
	- [Pull Requests](#pull-requests)
	- [Merging](#merging)


---


## Intro


### Introduction & Purpose

Thanks to community efforts, many are now aware that client diversity is a key security factor of any decentralized blockchain. However, it's not the only risk vector.

The purpose of Project Sunshine is to identify centralization vectors, determine the metrics to monitor, set danger/goal/target values for each, and then work with the community to meet those targets. 


### Contributing

Project Sunshine welcomes contributors! Below are some ways to help out with the project, [join us on Discord to collaborate](https://discord.gg/zE8guNfG49)!

- Determining centralization vectors
- Determing metrics to monitor these vectors 
- Finding data sources for these metrics
- Creating and providing data sources yourself
- Writing content for the "Take Action" modals
- Finding useful resources to list in these modals
- Organize initiatives to help reach the metric goals


---


## Current Metrics

This list contains centralization vectors that pose a risk to the health of the network.

- [x] Consensus Client Diversity
- [x] Execution Client Diversity
- [ ] Data Center Validators (Hosted versus Non-Hosted)
- [ ] Government Entity Stake Weight
- [ ] Largest Entity Stake Weight 
- [ ] Geolocation Diversity


---


## Adding a New Metric


### Metric Outline

- What does this metric monitor?
- What is the danger if too much centralization occurs?
- How do we track this?
- What level is deemed dangerous? (danger_value)
- What level is deemed ideal? (goal_value)
- Are there data sources available?


### Metric Integration

1. Add an entry to `data/metrics.yml` using the template provided and using previous entries as examples.
1. Create a Netlify function in `_netlify/functions/` using existing files as an example.
	- The function name **MUST** be the same as the data source name. The naming convention is the name of the data provider, followed by a dash followed, followed by the metric `id`. For example, if `blockprint` is the data provider or a metric with `id: archival-nodes`, you would name the data source `blockprint-archival-nodes` and Netlify function file `blockprint-archival-nodes.js`.
	- Include an example of the response output.
	- Maintain the 12hr cache for the function
	- The value returned from function must be the final metric value used to update the dashboard.
	- The value should follow convention where a higher value is good and a lower value is bad
	- If the data fails to load, the `default_value` specified in `metrics.yml` will be used as a fallback (will be updated periodically to remain relevant).


### Metric Modal Content

1. Modal content is kept in `_metric_modal_content`.
1. The modal content should follow `_metric_modal_content/template.md` and list:
	- What is this metric?
	- Why is it important?
	- How do we improve it?
	- Resources (list of important links)
1. The file name **MUST** be the same as the metric's `id` in `data/metrics.yml`.
1. The goal is to provide and overview with link to resources for furth learning, action, dashboard, and tools. The goal (at least at the moment) is not to be an authoritative informational source, but a gateway to existing established resources.


---


## Development


### Local Development

This project uses Jekyll and Netlify Functions.

1. Fork the repo
1. Install Jekyll dependencies: `bundle install`
1. Install Netlify dependencies: `npm install`
	- Note: Use Node v16 (Netlify has issues with Node v17)
1. Install Netlify CLI: `npm install netlify-cli -g`
1. Authenticate Netlify account: `netlify login`
1. Branch off the `dev` branch to make your changes 
1. Start the local server: `netlify dev`
1. The local server should open automatically
1. Once your changes are made, submit a PR back to the `dev` branch

Resources:

- [Netlify Setup](https://docs.netlify.com/cli/get-started/)
- [Netlify Functions](https://docs.netlify.com/functions/build-with-javascript/)
- [Jekyll Docs](https://jekyllrb.com/docs/)
- [Liquid Syntax](https://shopify.github.io/liquid/basics/introduction/)


### Pull Requests
1. Branch off the `dev` branch to make your changes
1. Once your changes are made, submit a PR back to the `dev` branch
1. If `dev` has had updates between the time you branched and finished your changes, please rebase your branch


### Merging
1. The `dev` branch is the working branch
1. Pull requests are merged into `dev`
1. Releases are branched off of `dev`, named using `vX.X` semantic versioning (no patch number)
1. Release branches are then merged to `main`

