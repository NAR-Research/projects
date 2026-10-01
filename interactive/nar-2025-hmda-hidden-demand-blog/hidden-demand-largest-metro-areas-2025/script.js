const highColor = "#006BB7";
const lowColor = "#CF1F28";

// Approximate central coordinates for each metro area.
// Replace coordinates here if you have authoritative metro coordinates.
const data = [
  {name:"Florence, SC", value:47.8, group:"Highest", lon:-79.7626, lat:34.1954},
  {name:"Charleston, WV", value:46.6, group:"Highest", lon:-81.6326, lat:38.3498},
  {name:"Beaumont-Port Arthur, TX", value:46.5, group:"Highest", lon:-94.1266, lat:30.0802},
  {name:"Longview, TX", value:45.0, group:"Highest", lon:-94.7405, lat:32.5007},
  {name:"Morristown, TN", value:42.0, group:"Highest", lon:-83.2949, lat:36.2139},
  {name:"Tyler, TX", value:42.0, group:"Highest", lon:-95.3011, lat:32.3513},
  {name:"Kingsport-Bristol, TN-VA", value:41.6, group:"Highest", lon:-82.5618, lat:36.5484},
  {name:"Shreveport-Bossier City, LA", value:41.6, group:"Highest", lon:-93.7502, lat:32.5252},
  {name:"Santa Fe, NM", value:41.5, group:"Highest", lon:-105.9378, lat:35.6870},
  {name:"Cleveland, TN", value:41.4, group:"Highest", lon:-84.8766, lat:35.1595},

  {name:"Rochester, NY", value:20.9, group:"Lowest", lon:-77.6109, lat:43.1566},
  {name:"Fargo, ND-MN", value:20.5, group:"Lowest", lon:-96.7898, lat:46.8772},
  {name:"Lincoln, NE", value:20.3, group:"Lowest", lon:-96.7026, lat:40.8136},
  {name:"Cedar Rapids, IA", value:20.0, group:"Lowest", lon:-91.6656, lat:41.9779},
  {name:"Bloomington, IL", value:20.0, group:"Lowest", lon:-88.9937, lat:40.4842},
  {name:"Green Bay, WI", value:18.9, group:"Lowest", lon:-88.0198, lat:44.5133},
  {name:"Oshkosh-Neenah, WI", value:18.8, group:"Lowest", lon:-88.5426, lat:44.0247},
  {name:"Iowa City, IA", value:18.6, group:"Lowest", lon:-91.5302, lat:41.6611},
  {name:"Waterloo-Cedar Falls, IA", value:18.0, group:"Lowest", lon:-92.3426, lat:42.4928},
  {name:"Appleton, WI", value:17.4, group:"Lowest", lon:-88.4154, lat:44.2619}
];

const high = data.filter(d => d.group === "Highest").sort((a,b)=>b.value-a.value);
const low  = data.filter(d => d.group === "Lowest").sort((a,b)=>a.value-b.value);

function makeList(selector, arr, cls) {
  d3.select(selector)
    .selectAll(".row")
    .data(arr)
    .join("div")
    .attr("class","row")
    .html((d,i) => `
      <span class="rank">${i+1}</span>
      <span class="dot ${cls}"></span>
      <span class="place" title="${d.name}">${d.name}</span>
      <span class="value">${d.value.toFixed(1)}%</span>
    `);
}
makeList("#high-list", high, "highest");
makeList("#low-list", low, "lowest");

const svg = d3.select("#map");
const tooltip = d3.select("#tooltip");

// Albers USA places Alaska/Hawaii insets automatically.
// Data points are in the contiguous U.S.; the state map provides geographic context.
const projection = d3.geoAlbersUsa()
  .translate([550, 285])
  .scale(1280);

const path = d3.geoPath(projection);

d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json")
  .then(us => {
    const states = topojson.feature(us, us.objects.states).features;

    svg.append("g")
      .selectAll("path")
      .data(states)
      .join("path")
      .attr("class","state")
      .attr("d", path);

    svg.append("path")
      .datum(topojson.mesh(us, us.objects.states, (a,b) => a !== b))
      .attr("class","state-borders")
      .attr("d",path);

    const markerLayer = svg.append("g");

    markerLayer.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("class","marker")
      .attr("r", 8)
      .attr("fill", d => d.group === "Highest" ? highColor : lowColor)
      .attr("cx", d => {
        const p = projection([d.lon,d.lat]);
        return p ? p[0] : -100;
      })
      .attr("cy", d => {
        const p = projection([d.lon,d.lat]);
        return p ? p[1] : -100;
      })
      .on("mouseenter", function(event,d) {
        d3.select(this).attr("r",11);
        tooltip
          .style("opacity",1)
          .html(`<strong>${d.name}</strong>${d.group} share: <b>${d.value.toFixed(1)}%</b>`);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left",(event.clientX + 14) + "px")
          .style("top",(event.clientY + 14) + "px");
      })
      .on("mouseleave", function() {
        d3.select(this).attr("r",8);
        tooltip.style("opacity",0);
      });

    // Small on-map labels to reinforce the color encoding.
    const key = svg.append("g").attr("transform","translate(55,475)");
    key.append("rect")
      .attr("width",285).attr("height",66).attr("rx",8)
      .attr("fill","#fff").attr("stroke","#ddd");
    key.append("circle").attr("cx",20).attr("cy",22).attr("r",6).attr("fill",highColor);
    key.append("text").attr("x",34).attr("y",27)
      .attr("font-size",13).attr("font-weight",600).text("Highest-Share Metro Areas");
    key.append("circle").attr("cx",20).attr("cy",45).attr("r",6).attr("fill",lowColor);
    key.append("text").attr("x",34).attr("y",50)
      .attr("font-size",13).attr("font-weight",600).text("Lowest-Share Metro Areas");
  })
  .catch(err => {
    console.error(err);
    svg.append("text")
      .attr("x",550).attr("y",285).attr("text-anchor","middle")
      .attr("fill","#666").attr("font-size",16)
      .text("Unable to load the U.S. map. Please check your internet connection.");
  });
