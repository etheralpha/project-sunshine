---
layout: default
---


<header>
  <div class="container">
   <div class="pt-5 pb-3 pb-md-5 mt-md-5 text-center text-trans">
      <h1 class="display-3 fw-bold">Project Sunshine</h1>
      <div class="col-12 col-sm-10 col-md-8 mx-auto mb-4">
        <p class="lead fw-normal">A dashboard to measure the health of Ethereum's decentralization.</p>
        <div id="healthContainer" class="d-none fw-light my-4">
          <p class="mx-auto mb-2">
            <span id="healthLevel">Overall Health: </span>
            <span id="healthInfo" data-bs-toggle="modal" data-bs-target="#modal-faq">
              <span data-bs-toggle="tooltip" data-bs-placement="top" title="Click to open">
                {{site.data.icons.tooltip}}
              </span>
            </span>
          </p>
          <p id="healthEmojis" class="mx-auto py-1">
            <span data-bs-toggle="tooltip" data-bs-placement="top" title="Health 0-20%">
              {{site.data.icons.health_0}}</span>
            <span data-bs-toggle="tooltip" data-bs-placement="top" title="Health 20-40%">
              {{site.data.icons.health_1}}</span>
            <span data-bs-toggle="tooltip" data-bs-placement="top" title="Health 40-50%">
              {{site.data.icons.health_2}}</span>
            <span data-bs-toggle="tooltip" data-bs-placement="top" title="Health 50-65%">
              {{site.data.icons.health_3}}</span>
            <span data-bs-toggle="tooltip" data-bs-placement="top" title="Health 65-75%">
              {{site.data.icons.health_4}}</span>
            <span data-bs-toggle="tooltip" data-bs-placement="top" title="Health 75-85%">
              {{site.data.icons.health_5}}</span>
            <span data-bs-toggle="tooltip" data-bs-placement="top" title="Health 85-100%">
              {{site.data.icons.health_6}}</span>
          </p>
        </div>
        <p class="small fw-light mb-0">(data updated daily)</p>
      </div>
    </div>
  </div>
</header>

<section>
  <div class="container mb-5 text-trans">
    <div class="row justify-content-center">
      {%- assign metrics = site.data.metrics -%}
      {%- for metric in metrics -%}
        {%- assign placeholder = "" -%}
        {%- assign opacity = "" -%}
        {%- assign hide = "" -%}
        {%- if metric.disabled -%}
          {%- assign placeholder = "placeholder" -%}
          {%- assign opacity = 'style="opacity: 0.4"' -%}
          {%- assign hide = "d-none" -%}
        {%- endif -%}
        <div class="col-12 col-sm-10 col-md-8 col-lg-6 mb-3">
          <!-- Card -->
          <div id="card-{{metric.id}}" class="card h-100 bg-eth placeholder-glow" {{opacity}}>
            {%- if metric.disabled -%}
              <div class="card-disabled">
                <p class="coming-soon">help us add this metric!</p>
              </div>
            {%- endif -%}
            <!-- Card Body -->
            <div class="card-body d-flex flex-column">
              <div class="row flex-grow-1">
                <div class="d-flex justify-content-between">
                  <!-- Title & Tooltip -->
                  <h5 class="card-title">
                    {{metric.title}}
                    {%- if metric.tooltip_enabled and metric.tooltip_text -%}
                      <span class="{{hide}}" data-bs-toggle="tooltip" data-bs-placement="top" title="{{metric.tooltip_text}}">
                        {{site.data.icons.tooltip}}
                      </span>
                    {%- endif -%}
                  </h5>
                  <!-- Twitter Share -->
                  {%- if metric.disabled == false -%}
                    <a class="tweet-link text-decoration-none me-1" onclick="createTweet('{{metric.id}}')">
                      {{site.data.icons.twitter}}
                    </a>
                  {%- endif -%}
                </div>
                <!-- Source Select/Dropdown -->
                <div class="d-none d-sm-inline col-4 col-xl-3 {{hide}}">
                  <div class="d-none form-floating">
                    {%- if metric.data_sources.size > 1 -%}
                      <select id="select-{{metric.id}}" class="form-select form-select-sm" aria-label="data source select" onchange='getData("{{metric.id}}", this.value, {{metric.default_value}}).then(updateProgressBar)'>
                        {%- for source in metric.data_sources -%}
                          {%- assign selected = "" -%}
                          {%- if my_array.first -%}{%- assign selected = "selected" -%}{%- endif -%}
                          <option value="{{source}}"{{selected}}>{{source | split: "-" | first}}</option>
                        {%- endfor -%}
                      </select>
                      <label for="select-{{metric.id}}">Select Data Source</label>
                    {%- elsif metric.data_sources.size == 1 -%}
                      <select id="select-{{metric.id}}" class="form-select form-select-sm" aria-label="disabled data source select" disabled>
                        {%- for source in metric.data_sources -%}
                          <option value="{{source}}" selected>{{source | split: "-" | first}}</option>
                        {%- endfor -%}
                      </select>
                      <label for="select-{{metric.id}}"><div class="ms-2 {{hide}}">Only Data Source</div></label>
                    {%- endif -%}
                  </div>
                </div>
              </div>
              <div class="mb-2 {{placeholder}}">
                <!-- Details -->
                {%- assign max_value = "100" -%}
                {%- assign percent = "%" -%}
                {%- if metric.max_value -%}
                  {%- assign max_value = metric.max_value | times: 1.0000 -%}
                  {%- assign percent = "" -%}
                {%- endif -%}
                {%- if metric.target_value -%}
                  <label class="d-none progress-label fw-normal small">
                    Target: {{metric.target_value}}{{percent}}
                    {%- if metric.target_date -%}
                      <span class="d-none d-xl-inline ms-1">by {{metric.target_date}}</span>
                    {%- endif -%}
                  </label>
                {%- endif -%}
                <!-- Progress Bar -->
                {%- assign color = "warning" -%}
                {%- assign status = "caution" -%}
                {%- if metric.default_value < metric.danger_value -%}
                  {%- assign color = "danger" -%}
                  {%- assign status = "danger!" -%}
                {%- endif -%}
                {%- if metric.default_value > metric.goal_value -%}
                  {%- assign color = "success" -%}
                  {%- assign status = "great!" -%}
                {%- endif -%}
                <div id="progress-container-{{metric.id}}" class="progress position-relative {{hide}}" style="height: 1.1rem;" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-html="true"
                  title='
                    <div class="progress-tooltip text-capitalize text-start">
                      <div class="mb-1 pb-1 text-center border-bottom border-secondary">
                        status:<br>{{metric.default_value}}{{percent}} ({{status}})
                      </div>
                      <div class="d-flex justify-content-between">
                        <span class="me-2">danger:</span><span>0-{{metric.danger_value}}{{percent}}</span>
                      </div>
                      <div class="d-flex justify-content-between">
                        <span class="me-2">caution:</span><span>{{metric.danger_value}}-{{metric.goal_value}}{{percent}}</span>
                      </div>
                      <div class="d-flex justify-content-between">
                        {%- if metric.max_value -%}
                          <span class="me-2">great:</span><span>{{metric.goal_value}}-{{max_value | round}}+</span>
                        {%- else -%}
                          <span class="me-2">great:</span><span>{{metric.goal_value}}-{{max_value | round}}</span>
                        {%- endif -%}
                      </div>
                    </div>'>
                  <div id="progress-{{metric.id}}">
                    {%- assign current_value = metric.default_value -%}
                    {%- assign value_width = metric.default_value -%}
                    {%- if metric.max_value -%}
                      {%- assign value_width = metric.default_value | divided_by: max_value | times: 100 -%}
                    {%- endif -%}
                    <div class="progress-bar position-absolute bg-{{color}}" role="progressbar" 
                        aria-valuemin="0" aria-valuemax="{{max_value}}" aria-valuenow="{{metric.default_value}}" 
                        style="width: {{value_width}}%; height: 1.1rem;">
                      {{current_value}}
                    </div>
                  </div>
                  {%- assign red_width = metric.danger_value -%}
                  {%- assign yellow_width = metric.goal_value | minus: metric.danger_value -%}
                  {%- assign green_width = 100 | minus: metric.danger_value | minus: yellow_width -%}
                  {%- if metric.max_value -%}
                    {%- assign red_width = metric.danger_value | divided_by: max_value | times: 100 -%}
                    {%- assign caution_value = metric.goal_value | minus: metric.danger_value -%}
                    {%- assign yellow_width = caution_value | divided_by: max_value | times: 100 -%}
                    {%- assign green_width = 100 | minus: red_width | minus: yellow_width -%}
                  {%- endif -%}
                  <div class="progress-bar bg-trans progress-danger" role="progressbar" 
                    style="width: {{red_width}}%; height: 1.1rem"></div>
                  <div class="progress-bar bg-trans progress-warning" role="progressbar" 
                    style="width: {{yellow_width}}%; height: 1.1rem"></div>
                  <div class="progress-bar bg-trans progress-success" role="progressbar" 
                    style="width: {{green_width}}%; height: 1.1rem"></div>
                </div>
              </div>
              <!-- Buttons -->
              <div class="card-buttons d-flex justify-content-between">
                {%- if metric.modal_enabled -%}
                  <a class="btn btn-sunshine text-dark btn-sm {{hide}}" data-bs-toggle="modal" data-bs-target="#modal-{{metric.id}}">Take Action!</a>
                {%- endif -%}
                {%- if metric.disabled == false -%}
                  {%- if metric.data_name and metric.data_link -%}
                    <small class="mt-2 text-muted">
                      <small>
                        Source: 
                        <a href="{{metric.data_link}}" class="text-muted">{{metric.data_name}}</a>
                        <!-- <a href="{{metric.data_link}}" class="text-muted">Data Source</a> -->
                      </small>
                    </small>
                  {%- endif -%}
                {%- endif -%}
              </div>
            </div>
          </div>
        </div>
      {%- endfor -%}
    </div>
  </div>
</section>


<!-- Metric Modal -->
{%- for metric in metrics -%}
  {%- if metric.disabled != true and metric.modal_enabled  -%}
    <div class="modal fade" id="modal-{{metric.id}}" tabindex="-1" aria-labelledby="modal-title-{{metric.id}}" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content text-trans">
          <div class="modal-header">
            <h5 class="modal-title" id="modal-title-{{metric.id}}">{{metric.title}}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            {%- assign post_name = metric.id  -%}
            {%- assign modal_content = site.modal_content | where: 'slug', post_name | first -%}
            {%- if modal_content == null -%}
              {%- assign modal_content = site.modal_content | where: 'slug', "contribute" | first -%}
            {%- endif -%}
            {{ modal_content.output }}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-sunshine" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  {%- endif -%}
{%- endfor -%}


<!-- FAQ Modal -->
<div class="modal fade" id="modal-faq" tabindex="-1" aria-labelledby="modal-title-faq" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content text-trans">
      <div class="modal-header">
        <h5 class="modal-title" id="modal-title-faq">FAQ</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        {%- assign faq = site.pages | where: 'name', "faq.md" | first -%}
        {{ faq.content }}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-sunshine" data-bs-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>

