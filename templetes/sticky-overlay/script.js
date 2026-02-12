const scroller = scrollama();

const svg = d3.select("#viz");
const width = window.innerWidth;
const height = window.innerHeight;

svg.attr("viewBox", `0 0 ${width} ${height}`);

// Example shape
const circle = svg.append("circle")
  .attr("cx", width / 2)
  .attr("cy", height / 2)
  .attr("r", 80)
  .attr("fill", "steelblue");

// Update visualization
function updateChart(stepIndex) {

  if (stepIndex === 0) {
    circle.transition().duration(800)
      .attr("r", 80)
      .attr("fill", "steelblue")
      .attr("cx", width / 2);
  }

  if (stepIndex === 1) {
    circle.transition().duration(800)
      .attr("r", 150)
      .attr("fill", "orange");
  }

  if (stepIndex === 2) {
    circle.transition().duration(800)
      .attr("cx", width * 0.25)
      .attr("fill", "limegreen");
  }

  if (stepIndex === 3) {
    circle.transition().duration(800)
      .attr("cx", width / 2)
      .attr("r", 50)
      .attr("fill", "crimson");
  }
}

// Initialize scrollama
function init() {

  scroller
    .setup({
      step: ".step",
      offset: 0.6
    })
    .onStepEnter(response => {

      document.querySelectorAll(".step")
        .forEach(step => step.classList.remove("is-active"));

      response.element.classList.add("is-active");

      const stepIndex = +response.element.dataset.step;
      updateChart(stepIndex);
    });

  window.addEventListener("resize", scroller.resize);
}

init();
