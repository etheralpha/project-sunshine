# Project Sunshine

Bringing the light of decentralization to the darkness of centraliztion: a site to monitor the health of Ethereum's decentralization

## Visit

<https://ethsunshine.com>

|[Join Discord](https://discord.gg/jeDvQc2rSX)|
|:---:|

[![gitpoap badge](https://public-api.gitpoap.io/v1/repo/etheralpha/project-sunshine/badge)](https://www.gitpoap.io/gh/etheralpha/project-sunshine)

**Table of Contents**
- [Intro](#intro)
	- [Introduction & Purpose](#introduction--purpose)
	- [Goals and Targets](#goals-and-targets)
	- [Contributing](#contributing)
	- [History](#history)
	- [Future](#future)
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

Project Sunshine is an Ethereum community initiative to improve decentralization across the entire Ethereum ecosystem by aggregating and displaying decentralization data in an easy-to-interpret manner. The categories for decentralization aren't static, ideally, they'll begin simple and expand to cover many potential centralization metrics. Project sunshine doens't seek to generate primary data feeds, but rather to curate and encourage the development of feeds that are useful in promoting decentralization. We highly value community input and seek to become a visual manifestation of the community's beliefs regarding decentralization.

Thanks to community efforts, many are now aware that client diversity is a key security factor of any decentralized blockchain. However, it's not the only risk vector.

The purpose of Project Sunshine is to identify centralization vectors, determine the metrics to monitor, set danger/goal/target values for each, and then work with the community to meet those targets. 


### Goals and Targets

Each decentralization category is visualized on a spectrum showing red (danger), yellow (caution), and green (good). At this time the gradient is subjective, but is intended to convey the need for action and risk to the network. Our ultimate goal is to develop evaluations that are less subjective and more empirical.

![Project Sunshine](https://i.ibb.co/SRp3YB1/sunshine-screenshot.png)


### Overall Health

The Overall Health is calculated by taking health of each individual metric and relative rating system and standardizing it against a global rating system. Those values are then averaged by weight of importance (currently all are equal) to obtain the Overall Health value.


### History

The roots of Project Sunshine are based in the willingness of the Ethereum Community's desire to examine existing practice and harden the network through data-driven action. The first realizations regarding the need for decisive action around decentralization came in 2021 when the Prysm beacon chain implementation controlled 70%+ of the validators in a chain architecture that was designed to be multi-client. [Superphiz pushed the community to work toward greater decentrlalization](https://twitter.com/superphiz/status/1437846604707401733) and [hanni_abu](https://twitter.com/hanni_abu) responded by developing [clientdiversity.org](https://clientdiversity.org). A few months later, realizing the need to zoom out from client diversity and focus on ecosystem decentralization, superphiz imagined [project sunshine](https://twitter.com/superphiz/status/1508568072118063109) and Hanni responded to the call by assembling a team in the Ether Alpha Discord and beginning work.


### Future

Project Sunshine seeks to be a community driven decentralization dashboard to support continual hardening of the the Ethereum network. We actively seek to include third party data sources and contributors to site development. Project Sunshine is teaming up with [GitPOAP](https://gitpoap.io) to recognize and reward contributors who make this dashboard possible.


### Contributing

Project Sunshine welcomes contributors! Below are some ways to help out with the project, [join us on Discord to collaborate](https://discord.gg/jeDvQc2rSX)! See [Development](#development) for more info (**branch off the `dev` branch to make your changes**).

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
- [x] Consensus Client Count
- [x] Execution Client Count
- [x] Data Center Validators (Hosted versus Non-Hosted)
- [x] Geolocation Diversity
- [ ] Government Entity Stake Weight
- [ ] Largest Entity Stake Weight 
- [ ] *What else would you like to see?*


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

1. Modal content is kept in `_modal_content`.
1. The modal content should follow `_modal_content/template.md` and list:
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
1. **Branch off the `dev` branch to make your changes**
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

