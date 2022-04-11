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
          <p id="healthLevel" class="mx-auto mb-2">Overall Health: </p>
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
                <p class="coming-soon">integration in progress...</p>
              </div>
            {%- endif -%}
            <!-- Card Body -->
            <div class="card-body d-flex flex-column">
              <div class="row flex-grow-1">
                <!-- Title & Tooltip -->
                <div class="col-12 col-sm-8 col-xl-9">
                  <h5 class="card-title">
                    {{metric.title}}
                    {%- if metric.tooltip_enabled and metric.tooltip_text -%}
                      <span class="{{hide}}" data-bs-toggle="tooltip" data-bs-placement="top" title="{{metric.tooltip_text}}">
                        {{site.data.icons.tooltip}}
                      </span>
                    {%- endif -%}
                  </h5>
                </div>
                <!-- Source Select/Dropdown -->
                <div class="d-none d-sm-inline col-4 col-xl-3 {{hide}}">
                  <div class="form-floating">
                    {%- if metric.data_sources.size > 1 -%}
                      <select id="select-{{metric.id}}" class="form-select form-select-sm" aria-label="data source select" onchange='getData("{{metric.id}}", this.value, {{metric.default_value}}).then(updateProgressBar)'>
                        {%- for source in metric.data_sources -%}
                          {%- assign selected = "" -%}
                          {%- if my_array.first -%}{%- assign selected = "selected" -%}{%- endif -%}
                          <option value="{{source}}"{{selected}}>{{source | split: "-" | first}}</option>
                        {%- endfor -%}
                      </select>
                      <label for="select-{{metric.id}}">Select Data Source</label>
                    {%- else -%}
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
                <label class="progress-label fw-normal small">
                  Danger: < {{metric.danger_value}}%
                  <span class="mx-1 mx-xl-2">|</span>
                  Goal: {{metric.goal_value}}% +
                  <span class="mx-1 mx-xl-2">|</span>
                  Target: {{metric.target_value}}%
                  {%- if metric.target_date -%}
                    <span class="d-none d-xl-inline ms-1">by {{metric.target_date}}</span>
                  {%- endif -%}
                </label>
                <!-- Progress Bar -->
                <div class="progress position-relative {{hide}}" style="height: 1.1rem;">
                  {%- assign color = "warning" -%}
                  {%- if metric.default_value < metric.danger_value -%}
                    {%- assign color = "danger" -%}
                  {%- endif -%}
                  {%- if metric.default_value > metric.goal_value -%}
                    {%- assign color = "success" -%}
                  {%- endif -%}
                  <div id="progress-{{metric.id}}">
                    <div class="progress-bar position-absolute bg-{{color}}" role="progressbar" 
                        aria-valuemin="0" aria-valuemax="100" aria-valuenow="{{metric.default_value}}" 
                        style="width: {{metric.default_value}}%; height: 1.07rem;">
                      {{metric.default_value}}%
                    </div>
                  </div>
                  {%- assign red_width = metric.danger_value -%}
                  <div class="progress-bar bg-trans progress-danger" role="progressbar" 
                    style="width: {{red_width}}%; height: 1.07rem"></div>
                  {%- assign yellow_width = metric.goal_value | minus: metric.danger_value -%}
                  <div class="progress-bar bg-trans progress-warning" role="progressbar" 
                    style="width: {{yellow_width}}%; height: 1.07rem"></div>
                  {%- assign green_width = 100 | minus: metric.danger_value | minus: yellow_width -%}
                  <div class="progress-bar bg-trans progress-success" role="progressbar" 
                    style="width: {{green_width}}%; height: 1.07rem"></div>
                </div>
              </div>
              <!-- Buttons -->
              <div class="card-buttons text-start">
                {%- if metric.modal_enabled -%}
                  <a class="btn btn-sunshine text-dark btn-sm {{hide}}" data-bs-toggle="modal" data-bs-target="#modal-{{metric.id}}">Take Action!</a>
                {%- endif -%}
              </div>
            </div>
          </div>
        </div>
      {%- endfor -%}
    </div>
  </div>
</section>


<!-- Modal -->
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

