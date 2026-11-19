const data = [
    { name: "All Buyers", value: 300, key: "all-buyers" },
    { name: "Married Couple", value: 325, key: "married" },
    { name: "Single Female", value: 207, key: "single-female" },
    { name: "Single Male", value: 457, key: "single-male" },
    { name: "Unmarried Couple", value: 215, key: "unmarried" },
    { name: "Other", value: 245, key: "other" }
  ];
  const color = d => d.key === "all-buyers" ? "#006BB7" : d.key === "single-male" ? "#077A8A" : "#FF7F61";
  const svg = d3.select("#chart");
  const wrap = document.getElementById("chart-wrap");
  const tooltip = d3.select("#tooltip");
  function render(){
    const width = Math.max(320, wrap.clientWidth), mobile = width < 600;
    const height = mobile ? 430 : 545;
    const margin = mobile ? {top:42,right:32,bottom:42,left:108} : {top:154,right:72,bottom:42,left:190};
    const pw = width - margin.left - margin.right, ph = height - margin.top - margin.bottom;
    svg.attr("viewBox",`0 0 ${width} ${height}`); svg.selectAll("*").remove();
    const g = svg.append("g").attr("transform",`translate(${margin.left},${margin.top})`);
    const x = d3.scaleLinear().domain([0,500]).range([0,pw]);
    const y = d3.scaleBand().domain(data.map(d=>d.name)).range([0,ph]).padding(.42);
    const xAxis = g.append("g")
      .attr("class","grid axis x-axis")
      .attr("transform",`translate(0,${ph})`)
      .call(
        d3.axisBottom(x)
          .ticks(mobile ? 5 : 10)
          .tickSize(-ph)
          .tickPadding(mobile ? 15 : 17)
      );
    // Remove the axis domain path, whose SVG end caps created the right-side vertical line.
    xAxis.select(".domain").remove();
    xAxis.selectAll(".tick").select("line").remove();
    // Small downward tick marks and a darker baseline for clearer x-axis reading.
    xAxis.selectAll(".tick")
      .append("line")
      .attr("class","x-tick-mark")
      .attr("x1",0)
      .attr("x2",0)
      .attr("y1",0)
      .attr("y2",mobile ? 8 : 11);
    g.append("line")
      .attr("class","x-baseline restored")
      .attr("x1",0)
      .attr("x2",pw)
      .attr("y1",ph)
      .attr("y2",ph);

    g.selectAll(".category-label").data(data).join("text").attr("class","category-label").attr("x",-12).attr("y",d=>y(d.name)+y.bandwidth()/2+4).attr("text-anchor","end").attr("font-size",mobile?(width<380?11:12):15).text(d=>d.name);
    const bx=x(300); g.append("line").attr("class","all-benchmark").attr("x1",bx).attr("x2",bx).attr("y1",0).attr("y2",ph); g.append("text").attr("x",Math.min(bx+6,pw-(mobile?120:165))).attr("y",-8).attr("fill","#006bb7").attr("font-size",mobile?(width<380?11:12):15).attr("font-weight",800).text("All Buyers: 300 miles");
    // Desktop/tablet: numbered teal editorial callout; no connector or arrow.
    if (!mobile) {
      const boxW = Math.min(410, Math.max(265, pw * 0.70));
      const boxH = 82;
      const boxX = Math.max(0, pw - boxW - 8);
      const boxY = -145;
      const callout = g.append("g").attr("class", "editorial-callout")
        .attr("transform", `translate(${boxX},${boxY})`);
      callout.append("rect").attr("width", boxW).attr("height", boxH)
        .attr("rx", 10).attr("fill", "#077A8A");
      callout.append("circle").attr("cx", 23).attr("cy", 23)
        .attr("r", 12).attr("fill", "#ffffff");
      callout.append("text").attr("x", 23).attr("y", 27)
        .attr("text-anchor", "middle").attr("font-size", 13)
        .attr("font-weight", 800).attr("fill", "#077A8A").text("1");
      const copy = callout.append("text").attr("x", 43).attr("y", 26)
        .attr("fill", "#ffffff").attr("font-size", pw < 620 ? 10.5 : 12.5);
      copy.append("tspan").attr("font-weight", 700)
        .text("Single male buyers made the longest journeys:");
      copy.append("tspan").attr("x", 43).attr("dy", 21)
        .text("moving a median of 457 miles,");
      copy.append("tspan").attr("x", 43).attr("dy", 20)
        .text("followed by married couples at 325 miles.");
    }
    const marks=g.selectAll(".mark").data(data).join("g").attr("class","mark");
    marks.append("line").attr("class",d=>"stem "+(d.key==="single-male"?"stem-highlight":"")).attr("stroke",d=>color(d)).attr("x1",0).attr("x2",d=>x(d.value)).attr("y1",d=>y(d.name)+y.bandwidth()/2).attr("y2",d=>y(d.name)+y.bandwidth()/2);
    marks.append("circle").attr("class","dot").attr("cx",d=>x(d.value)).attr("cy",d=>y(d.name)+y.bandwidth()/2).attr("r",mobile?(width<380?8:9):11).attr("fill",d=>color(d));
    marks.append("text").attr("class","value-label").attr("x",d=>x(d.value)+(mobile?11:14)).attr("y",d=>y(d.name)+y.bandwidth()/2+5).attr("font-size",mobile?(width<380?12:13):16).attr("fill",d=>color(d)).text(d=>d.value);
    // Numbered marker sits beside the Single Male dot on every screen size.
    // Draw it after the data marks so it remains visible.
    const sm = data.find(d => d.key === "single-male");
    const smx = x(sm.value), smy = y(sm.name) + y.bandwidth() / 2;
    const badgeX = smx - (mobile ? 13 : 18);
    const badgeY = smy - (mobile ? 17 : 22);
    const badge = g.append("g").attr("class", "point-note-badge")
      .attr("aria-label", "Annotation 1: Single male buyers");
    badge.append("circle").attr("cx", badgeX).attr("cy", badgeY)
      .attr("r", mobile ? 10 : 12).attr("fill", "#077A8A")
      .attr("stroke", "#fff").attr("stroke-width", 2);
    badge.append("text").attr("x", badgeX).attr("y", badgeY + (mobile ? 3.5 : 4))
      .attr("text-anchor", "middle").attr("font-size", mobile ? 10 : 12)
      .attr("font-weight", 800).attr("fill", "#fff").text("1");
    marks.attr("tabindex",0).attr("role","button").on("pointermove focus",function(event,d){d3.select(this).select("circle").attr("r",mobile?(width<380?10:11):14); tooltip.style("opacity",1).html(`<strong>${d.name}</strong><span class="value" style="color:${color(d)}">${d.value} miles</span>`); const b=wrap.getBoundingClientRect(), tb=tooltip.node().getBoundingClientRect(); let left=(event.clientX||b.left+width/2)-b.left+12; left=Math.max(4,Math.min(left,b.width-tb.width-4)); let top=(event.clientY||b.top+80)-b.top-tb.height-10; top=Math.max(4,Math.min(top,b.height-tb.height-4)); tooltip.style("left",left+"px").style("top",top+"px");}).on("pointerleave blur",function(event,d){d3.select(this).select("circle").attr("r",mobile?(width<380?8:9):11);tooltip.style("opacity",0);});
  }
  window.addEventListener("resize",render); document.fonts.ready.then(render); render();