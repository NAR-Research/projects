/* =========================================================
   COLORS
========================================================= */

const increaseColor = "#006BB7";
const decreaseColor = "#CF1F28";


/* =========================================================
   DATA

   Coordinates represent the central city/location associated
   with each metropolitan area, consistent with the approach
   used in the previous interactive.
========================================================= */

const data = [

  /* -----------------------------
     LARGEST INCREASES
  ----------------------------- */

  {
    name: "Elmira, NY",
    value: 3.5,
    group: "Increase",
    lon: -76.8077,
    lat: 42.0898
  },

  {
    name: "Gainesville, FL",
    value: 3.0,
    group: "Increase",
    lon: -82.3248,
    lat: 29.6516
  },

  {
    name: "Medford, OR",
    value: 3.0,
    group: "Increase",
    lon: -122.8756,
    lat: 42.3265
  },

  {
    name: "Wichita Falls, TX",
    value: 2.8,
    group: "Increase",
    lon: -98.4934,
    lat: 33.9137
  },

  {
    name: "Peoria, IL",
    value: 2.4,
    group: "Increase",
    lon: -89.5890,
    lat: 40.6936
  },

  {
    name: "Cumberland, MD-WV",
    value: 2.3,
    group: "Increase",
    lon: -78.7625,
    lat: 39.6529
  },

  {
    name: "Fargo, ND-MN",
    value: 2.3,
    group: "Increase",
    lon: -96.7898,
    lat: 46.8772
  },

  {
    name: "Duluth, MN-WI",
    value: 2.2,
    group: "Increase",
    lon: -92.1005,
    lat: 46.7867
  },

  {
    name: "South Bend-Mishawaka, IN-MI",
    value: 2.2,
    group: "Increase",
    lon: -86.2520,
    lat: 41.6764
  },

  {
    name: "Owensboro, KY",
    value: 2.0,
    group: "Increase",
    lon: -87.1112,
    lat: 37.7719
  },


  /* -----------------------------
     LARGEST DECREASES
  ----------------------------- */

  {
    name: "Iowa City, IA",
    value: -2.5,
    group: "Decrease",
    lon: -91.5302,
    lat: 41.6611
  },

  {
    name: "Abilene, TX",
    value: -2.7,
    group: "Decrease",
    lon: -99.7331,
    lat: 32.4487
  },

  {
    name: "Gainesville, GA",
    value: -2.7,
    group: "Decrease",
    lon: -83.8241,
    lat: 34.2979
  },

  {
    name: "Asheville, NC",
    value: -2.7,
    group: "Decrease",
    lon: -82.5515,
    lat: 35.5951
  },

  {
    name: "El Paso, TX",
    value: -3.1,
    group: "Decrease",
    lon: -106.4850,
    lat: 31.7619
  },

  {
    name: "Greeley, CO",
    value: -3.4,
    group: "Decrease",
    lon: -104.7091,
    lat: 40.4233
  },

  {
    name: "Amarillo, TX",
    value: -4.3,
    group: "Decrease",
    lon: -101.8313,
    lat: 35.2220
  },

  {
    name: "Burlington-South Burlington, VT",
    value: -4.3,
    group: "Decrease",
    lon: -73.2121,
    lat: 44.4759
  },

  {
    name: "Gulfport-Biloxi, MS",
    value: -4.4,
    group: "Decrease",
    lon: -89.0928,
    lat: 30.3674
  },

  {
    name: "Little Rock-North Little Rock-Conway, AR",
    value: -4.7,
    group: "Decrease",
    lon: -92.2896,
    lat: 34.7465
  }

];


/* =========================================================
   SORT DATA
========================================================= */

const increases = data
  .filter(d => d.group === "Increase")
  .sort((a, b) => b.value - a.value);

const decreases = data
  .filter(d => d.group === "Decrease")
  .sort((a, b) => a.value - b.value);


/* =========================================================
   NUMBER FORMAT

   Positive numbers include "+"
   Negative numbers retain "-"
========================================================= */

function formatChange(value) {

  if (value > 0) {
    return `+${value.toFixed(1)} pp`;
  }

  return `${value.toFixed(1)} pp`;
}


/* =========================================================
   CREATE RANKED LISTS
========================================================= */

function makeList(selector, arr, cls) {

  d3.select(selector)
    .selectAll(".row")
    .data(arr)
    .join("div")
    .attr("class", "row")
    .html((d, i) => `

      <span class="rank">
        ${i + 1}
      </span>

      <span class="dot ${cls}"></span>

      <span
        class="place"
        title="${d.name}"
      >
        ${d.name}
      </span>

      <span class="value">
        ${formatChange(d.value)}
      </span>

    `);

}


makeList(
  "#increase-list",
  increases,
  "increase"
);

makeList(
  "#decrease-list",
  decreases,
  "decrease"
);


/* =========================================================
   MAP SETUP
========================================================= */

const svg = d3.select("#map");

const tooltip = d3.select("#tooltip");


/*
  Albers USA projection.

  This keeps the same projection approach as the
  previous interactive and automatically positions
  Alaska and Hawaii as insets.
*/

const projection = d3.geoAlbersUsa()
  .translate([550, 285])
  .scale(1280);


const path = d3.geoPath(projection);


/* =========================================================
   LOAD U.S. MAP
========================================================= */

d3.json(
  "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"
)

.then(us => {

  const states = topojson
    .feature(
      us,
      us.objects.states
    )
    .features;


  /* -------------------------------------------------------
     STATES
  ------------------------------------------------------- */

  svg.append("g")
    .selectAll("path")
    .data(states)
    .join("path")
    .attr("class", "state")
    .attr("d", path);


  /* -------------------------------------------------------
     STATE BORDERS
  ------------------------------------------------------- */

  svg.append("path")
    .datum(
      topojson.mesh(
        us,
        us.objects.states,
        (a, b) => a !== b
      )
    )
    .attr("class", "state-borders")
    .attr("d", path);


  /* -------------------------------------------------------
     METRO MARKERS
  ------------------------------------------------------- */

  const markerLayer = svg
    .append("g")
    .attr("class", "marker-layer");


  markerLayer
    .selectAll("circle")
    .data(data)
    .join("circle")

    .attr("class", "marker")

    .attr("r", 8)

    .attr(
      "fill",
      d =>
        d.group === "Increase"
          ? increaseColor
          : decreaseColor
    )

    .attr("cx", d => {

      const point = projection([
        d.lon,
        d.lat
      ]);

      return point
        ? point[0]
        : -100;

    })

    .attr("cy", d => {

      const point = projection([
        d.lon,
        d.lat
      ]);

      return point
        ? point[1]
        : -100;

    })


    /* -----------------------------------------------------
       HOVER
    ----------------------------------------------------- */

    .on("mouseenter", function(event, d) {

      d3.select(this)
        .attr("r", 11);


      const direction =
        d.group === "Increase"
          ? "Increase"
          : "Decrease";


      tooltip
        .style("opacity", 1)
        .html(`

          <strong>
            ${d.name}
          </strong>

          ${direction} in hidden demand:
          <b>${formatChange(d.value)}</b>

        `);

    })


    .on("mousemove", function(event) {

      tooltip

        .style(
          "left",
          (event.clientX + 14) + "px"
        )

        .style(
          "top",
          (event.clientY + 14) + "px"
        );

    })


    .on("mouseleave", function() {

      d3.select(this)
        .attr("r", 8);

      tooltip
        .style("opacity", 0);

    });



  /* =======================================================
     SMALL MAP KEY
  ======================================================= */

  const key = svg
    .append("g")
    .attr(
      "transform",
      "translate(55,475)"
    );


  /* KEY BACKGROUND */

  key.append("rect")
    .attr("width", 345)
    .attr("height", 66)
    .attr("rx", 8)
    .attr("fill", "#fff")
    .attr("stroke", "#ddd");


  /* INCREASE */

  key.append("circle")
    .attr("cx", 20)
    .attr("cy", 22)
    .attr("r", 6)
    .attr(
      "fill",
      increaseColor
    );


  key.append("text")
    .attr("x", 34)
    .attr("y", 27)
    .attr("font-size", 13)
    .attr("font-weight", 600)
    .text(
      "Largest Percentage Point Increases"
    );


  /* DECREASE */

  key.append("circle")
    .attr("cx", 20)
    .attr("cy", 45)
    .attr("r", 6)
    .attr(
      "fill",
      decreaseColor
    );


  key.append("text")
    .attr("x", 34)
    .attr("y", 50)
    .attr("font-size", 13)
    .attr("font-weight", 600)
    .text(
      "Largest Percentage Point Decreases"
    );

})


/* =========================================================
   MAP LOAD ERROR
========================================================= */

.catch(err => {

  console.error(err);

  svg.append("text")
    .attr("x", 550)
    .attr("y", 285)
    .attr(
      "text-anchor",
      "middle"
    )
    .attr(
      "fill",
      "#666"
    )
    .attr(
      "font-size",
      16
    )
    .text(
      "Unable to load the U.S. map. Please check your internet connection."
    );

});
