/* =========================================================
   DATA
========================================================= */

const data = [

  {
    benefit: "Saving time",
    "All REALTORS®": 81,
    "2 years or less": 85,
    "3 to 5 years": 83,
    "6 to 10 years": 85,
    "11 to 15 years": 87,
    "16 to 25 years": 78,
    "26 years or more": 74
  },

  {
    benefit: "Improving client experience",
    "All REALTORS®": 71,
    "2 years or less": 82,
    "3 to 5 years": 71,
    "6 to 10 years": 71,
    "11 to 15 years": 74,
    "16 to 25 years": 72,
    "26 years or more": 64
  },

  {
    benefit: "Closing more deals",
    "All REALTORS®": 57,
    "2 years or less": 74,
    "3 to 5 years": 60,
    "6 to 10 years": 62,
    "11 to 15 years": 64,
    "16 to 25 years": 52,
    "26 years or more": 39
  },

  {
    benefit: "Less manual work",
    "All REALTORS®": 54,
    "2 years or less": 61,
    "3 to 5 years": 49,
    "6 to 10 years": 59,
    "11 to 15 years": 64,
    "16 to 25 years": 52,
    "26 years or more": 48
  },

  {
    benefit: "Staying ahead of the competition",
    "All REALTORS®": 44,
    "2 years or less": 43,
    "3 to 5 years": 47,
    "6 to 10 years": 47,
    "11 to 15 years": 45,
    "16 to 25 years": 48,
    "26 years or more": 37
  },

  {
    benefit: "Better insights",
    "All REALTORS®": 41,
    "2 years or less": 51,
    "3 to 5 years": 45,
    "6 to 10 years": 47,
    "11 to 15 years": 35,
    "16 to 25 years": 37,
    "26 years or more": 32
  },

  {
    benefit: "Reducing overhead or team size",
    "All REALTORS®": 12,
    "2 years or less": 10,
    "3 to 5 years": 13,
    "6 to 10 years": 14,
    "11 to 15 years": 14,
    "16 to 25 years": 7,
    "26 years or more": 12
  },

  {
    benefit: "Other",
    "All REALTORS®": 5,
    "2 years or less": 3,
    "3 to 5 years": 2,
    "6 to 10 years": 4,
    "11 to 15 years": 4,
    "16 to 25 years": 5,
    "26 years or more": 8
  }

];


/* =========================================================
   EXPERIENCE GROUPS
========================================================= */

const groups = [

  {
    key: "All REALTORS®",
    label: "All REALTORS®"
  },

  {
    key: "2 years or less",
    label: "≤2 Years"
  },

  {
    key: "3 to 5 years",
    label: "3–5 Years"
  },

  {
    key: "6 to 10 years",
    label: "6–10 Years"
  },

  {
    key: "11 to 15 years",
    label: "11–15 Years"
  },

  {
    key: "16 to 25 years",
    label: "16–25 Years"
  },

  {
    key: "26 years or more",
    label: "26+ Years"
  }

];

let selectedGroup = "All REALTORS®";


/* =========================================================
   CREATE EXPERIENCE BUTTONS
========================================================= */

const tabContainer = d3.select("#tabs");

tabContainer
  .selectAll("button")
  .data(groups)
  .enter()
  .append("button")

  .attr("type", "button")

  .attr("class", d =>
    d.key === selectedGroup
      ? "experience-btn active"
      : "experience-btn"
  )

  .attr("aria-pressed", d =>
    d.key === selectedGroup
      ? "true"
      : "false"
  )

  .text(d => d.label)

  .on("click", function(event, d) {

    selectedGroup = d.key;

    d3.selectAll(".experience-btn")
      .classed("active", false)
      .attr("aria-pressed", "false");

    d3.select(this)
      .classed("active", true)
      .attr("aria-pressed", "true");

    updateChart();

  });


/* =========================================================
   CREATE CHART ROWS
========================================================= */

const rows = d3.select("#chart")
  .selectAll(".bar-row")
  .data(data, d => d.benefit)
  .enter()
  .append("div")
  .attr("class", "bar-row");


/* LABEL + VALUE */

const headers = rows
  .append("div")
  .attr("class", "bar-header");

headers
  .append("div")
  .attr("class", "bar-label")
  .text(d => d.benefit);

headers
  .append("div")
  .attr("class", "bar-value");


/* BAR TRACK */

const tracks = rows
  .append("div")
  .attr("class", "bar-track");


/* BAR */

tracks
  .append("div")
  .attr("class", "bar-fill");


/* =========================================================
   UPDATE CHART
========================================================= */

function updateChart() {

  /*
    Sort a COPY of the data.
    Original data remains unchanged.
  */

  const sorted = [...data]
    .sort((a, b) =>
      b[selectedGroup] - a[selectedGroup]
    );


  /* -------------------------------------------------------
     UPDATE ROW ORDER
  ------------------------------------------------------- */

  const chartRows = d3.select("#chart")
    .selectAll(".bar-row")
    .data(sorted, d => d.benefit);

  chartRows.order();


  /* -------------------------------------------------------
     UPDATE NUMBERS
  ------------------------------------------------------- */

  chartRows
    .select(".bar-value")
    .interrupt()
    .transition()
    .duration(450)

    .tween("text", function(d) {

      const node = this;

      const current =
        parseFloat(node.textContent) || 0;

      const interpolator =
        d3.interpolateNumber(
          current,
          d[selectedGroup]
        );

      return function(t) {

        node.textContent =
          Math.round(
            interpolator(t)
          ) + "%";

      };

    });


  /* -------------------------------------------------------
     UPDATE BAR WIDTHS
  ------------------------------------------------------- */

  chartRows
    .select(".bar-fill")
    .interrupt()
    .transition()
    .duration(650)
    .ease(d3.easeCubicOut)

    .style(
      "width",
      d => d[selectedGroup] + "%"
    );


  /* -------------------------------------------------------
     UPDATE SUMMARY
  ------------------------------------------------------- */

  const top = sorted[0];

  let description;


  if (selectedGroup === "All REALTORS®") {

    description =

      `<strong>${top.benefit}</strong> is the most commonly cited benefit among all REALTORS®, at <strong>${top[selectedGroup]}%</strong>.`;

  }

  else {

    description =

      `Among REALTORS® with <strong>${selectedGroup}</strong> of experience, <strong>${top.benefit.toLowerCase()}</strong> is the leading benefit, cited by <strong>${top[selectedGroup]}%</strong>.`;

  }


  document.getElementById("summary").innerHTML =
    description;

}


/* =========================================================
   INITIAL RENDER
========================================================= */

updateChart();
