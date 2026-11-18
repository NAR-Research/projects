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
    const height = mobile ? 500 : 430;
    const margin = mobile ? {top:22,right:32,bottom:34,left:108} : {top:28,right:72,bottom:53,left:190};
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
    const bx=x(300); g.append("line").attr("class","all-benchmark").attr("x1",bx).attr("x2",bx).attr("y1",0).attr("y2",ph); g.append("text").attr("x",bx+6).attr("y",-8).attr("fill","#006bb7").attr("font-size",mobile?(width<380?11:12):15).attr("font-weight",800).text("All Buyers: 300 miles");
    const defs = svg.append("defs");
    defs.append("marker").attr("id","arrowhead").attr("viewBox","0 0 10 10").attr("refX",9).attr("refY",5).attr("markerWidth",7).attr("markerHeight",7).attr("orient","auto-start-reverse").append("path").attr("d","M 0 0 L 10 5 L 0 10 z").attr("fill","#555");
    const sm = data.find(d=>d.key === "single-male");
    const smx=x(sm.value), smy=y(sm.name)+y.bandwidth()/2;
    if(!mobile){
      const noteX=Math.max(pw*.48, smx-255), noteY=Math.max(6, smy-150);
      g.append("path")
        .attr("d",`M ${noteX+150} ${noteY+60} C ${noteX+205} ${noteY+92}, ${smx-92} ${smy-58}, ${smx-15} ${smy-9}`)
        .attr("fill","none")
        .attr("stroke","#555")
        .attr("stroke-width",2)
        .attr("marker-end","url(#arrowhead)");
      const ann=g.append("g").attr("transform",`translate(${noteX},${noteY})`);
      ann.append("text").attr("font-size",13).attr("font-weight",700).attr("fill","#333").text("Single male buyers made the longest journeys,");
      ann.append("text").attr("y",20).attr("font-size",12.5).attr("fill","#444").text("moving a median of 457 miles,");
      ann.append("text").attr("y",39).attr("font-size",12.5).attr("fill","#444").text("followed by married couples at 325 miles.");
    } else {
      g.append("circle").attr("cx",smx-10).attr("cy",smy-14).attr("r",9).attr("fill","#077A8A").attr("stroke","#fff").attr("stroke-width",2);
      g.append("text").attr("x",smx-10).attr("y",smy-10.5).attr("text-anchor","middle").attr("font-size",10).attr("font-weight",800).attr("fill","#fff").text("1");
    }
    const marks=g.selectAll(".mark").data(data).join("g").attr("class","mark");
    marks.append("line").attr("class",d=>"stem "+(d.key==="single-male"?"stem-highlight":"")).attr("stroke",d=>color(d)).attr("x1",0).attr("x2",d=>x(d.value)).attr("y1",d=>y(d.name)+y.bandwidth()/2).attr("y2",d=>y(d.name)+y.bandwidth()/2);
    marks.append("circle").attr("class","dot").attr("cx",d=>x(d.value)).attr("cy",d=>y(d.name)+y.bandwidth()/2).attr("r",mobile?(width<380?8:9):11).attr("fill",d=>color(d));
    marks.append("text").attr("class","value-label").attr("x",d=>x(d.value)+(mobile?11:14)).attr("y",d=>y(d.name)+y.bandwidth()/2+5).attr("font-size",mobile?(width<380?12:13):16).attr("fill",d=>color(d)).text(d=>d.value);
    marks.attr("tabindex",0).attr("role","button").on("pointermove focus",function(event,d){d3.select(this).select("circle").attr("r",mobile?(width<380?10:11):14); tooltip.style("opacity",1).html(`<strong>${d.name}</strong><span class="value" style="color:${color(d)}">${d.value} miles</span>`); const b=wrap.getBoundingClientRect(), tb=tooltip.node().getBoundingClientRect(); let left=(event.clientX||b.left+width/2)-b.left+12; left=Math.max(4,Math.min(left,b.width-tb.width-4)); let top=(event.clientY||b.top+80)-b.top-tb.height-10; top=Math.max(4,Math.min(top,b.height-tb.height-4)); tooltip.style("left",left+"px").style("top",top+"px");}).on("pointerleave blur",function(event,d){d3.select(this).select("circle").attr("r",mobile?(width<380?8:9):11);tooltip.style("opacity",0);});
  }
  window.addEventListener("resize",render); document.fonts.ready.then(render); render();
