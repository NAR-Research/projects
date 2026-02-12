// Initialize Scrollama
const scroller = scrollama();

// Setup SVG
const svg = d3.select("#viz");
const width = 600;
const height = 400;

svg.attr("viewBox", `0 0 ${width} ${height}`);

// Example circle
const circle = svg.append("circle")
  .attr("cx", width / 2)
  .attr("cy", height / 2)
  .attr("r", 50)
  .attr("fill", "steelblue");

// Update function triggered by scroll
function updateChart(stepIndex) {
if (stepIndex === 0.1) {
    circle
      .transition()
      .duration(600)
      .attr("r", 50)
      .attr("fill", "steelblue");
  }    

  if (stepIndex === 0.5) {
    circle
      .transition()
      .duration(600)
      .attr("r", 50)
      .attr("fill", "steelblue");
  }    

  if (stepIndex === 0) {
    circle
      .transition()
      .duration(600)
      .attr("r", 50)
      .attr("fill", "steelblue");
  }

  if (stepIndex === 1) {
    circle
      .transition()
      .duration(600)
      .attr("r", 80)
      .attr("fill", "orange");
  }

  if (stepIndex === 2) {
    circle
      .transition()
      .duration(600)
      .attr("cx", width * 0.3)
      .attr("fill", "limegreen");
  }

  if (stepIndex === 3) {
    circle
      .transition()
      .duration(600)
      .attr("cx", width / 2)
      .attr("r", 30)
      .attr("fill", "crimson");
  }
}

// Scrollama Setup
function init() {

  scroller
    .setup({
      step: ".step",
      offset: 0.5,
      debug: false
    })
    .onStepEnter(response => {

      // Highlight active step
      document.querySelectorAll(".step")
        .forEach(step => step.classList.remove("is-active"));

      response.element.classList.add("is-active");

      // Get step index
      const stepIndex = +response.element.dataset.step;

      updateChart(stepIndex);
    });

  window.addEventListener("resize", scroller.resize);
}

init();
