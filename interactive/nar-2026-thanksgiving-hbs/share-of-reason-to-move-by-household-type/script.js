const columns=["All Buyers","Married Couple","Single Female","Single Male","Unmarried Couple","Other"];
  const rows=[
    {name:"Closer to Family/Friends/Relatives", color:"#319b76", values:[14,16,16,11,3,13]},
    {name:"Change in Family Situation", color:"#ff7f61", values:[7,4,13,11,17,16]},
    {name:"Job-Related Relocation", color:"#006bb7", values:[5,6,1,2,2,3]}
  ];
  const svg=d3.select("#chart"), wrap=document.getElementById("chart-wrap"), tip=d3.select(".tooltip");
  function render(){
    const viewportWidth=Math.max(280,wrap.clientWidth), mobile=viewportWidth<=600, tablet=viewportWidth>600 && viewportWidth<=1050;
    const width=viewportWidth;
    const margin=mobile?{top:90,right:6,bottom:12,left:102}:tablet?{top:102,right:18,bottom:18,left:Math.min(235,Math.max(170,width*.26))}:{top:104,right:28,bottom:20,left:280};
    const cw=Math.max(175,width-margin.left-margin.right), rowH=mobile?92:tablet?125:136, height=margin.top+rowH*3+margin.bottom;
    svg.attr("viewBox",`0 0 ${width} ${height}`); svg.selectAll("*").remove();
    const g=svg.append("g").attr("transform",`translate(${margin.left},${margin.top})`);
    const x=d3.scalePoint().domain(columns).range([0,cw]).padding(mobile?.25:.45);
    const y=d3.scaleBand().domain(rows.map(d=>d.name)).range([0,rowH*3]).padding(.2);
    const colStep=x.step();
     const maxR=Math.min(mobile?17:tablet?30:36, colStep*.43);
     const r=d3.scaleSqrt().domain([1,17]).range([mobile?4.5:8,maxR]);
    rows.forEach((row,ri)=>{
      const cy=y(row.name)+y.bandwidth()/2;
      if(ri>0) g.append("line").attr("class","row-rule").attr("x1",0).attr("x2",cw).attr("y1",y(row.name)-y.step()*.1).attr("y2",y(row.name)-y.step()*.1);
      // All row headings wrap in the reserved left margin, never outside the SVG.
      const rowLines = row.name === "Closer to Family/Friends/Relatives"
        ? (mobile ? ["Closer to", "Family/Friends/", "Relatives"] : ["Closer to", "Family/Friends/Relatives"])
        : row.name === "Change in Family Situation"
          ? ["Change in", "Family Situation"]
          : ["Job-Related", "Relocation"];
      const rowFont = mobile ? 10 : tablet ? 14 : 17;
      const rowLine = mobile ? 12 : tablet ? 17 : 21;
      const label=g.append("text").attr("class","row-label")
        .attr("x",-12).attr("y",cy-(rowLines.length-1)*rowLine/2)
        .attr("text-anchor","end").attr("font-size",rowFont);
      rowLines.forEach((part,i)=>label.append("tspan").attr("x",-12)
        .attr("dy",i===0?0:rowLine).text(part));
      row.values.forEach((v,ci)=>{
        const cx=x(columns[ci]);
        const node=g.append("g").attr("tabindex",0).attr("role","button").style("cursor","pointer");
        if(ci===0) {
          const displayR = mobile && v >= 3 && v <= 7 ? Math.max(r(v), v >= 5 ? 14 : 10.5) : r(v);
          node.append("circle").attr("class","benchmark-ring").attr("cx",cx).attr("cy",cy).attr("r",displayR+4);
        }
        node.append("circle").attr("class","cell-circle").attr("cx",cx).attr("cy",cy).attr("r", mobile && v >= 3 && v <= 7 ? Math.max(r(v), v >= 5 ? 14 : 10.5) : r(v)).attr("fill",row.color);
        const jobSmall = row.name === "Job-Related Relocation" && v < 5;
        const verySmallInside = mobile && !jobSmall && v <= 4;
        const insideFont = mobile
          ? (v <= 4 ? 6.7 : v <= 7 ? 8 : 8.8)
          : 14;
        node.append("text")
          .attr("class","cell-value")
          .attr("x",cx)
          .attr("y",jobSmall ? cy+(mobile && v >= 3 && v <= 7 ? Math.max(r(v), v >= 5 ? 14 : 10.5) : r(v))+(mobile?13:16) : cy+(mobile?3.1:4.5))
          .attr("text-anchor","middle")
          .attr("font-size",insideFont)
          .attr("font-weight",800)
          .attr("fill",jobSmall ? "#222" : "#fff")
          .text(v+"%");
        node.on("pointermove focus",event=>{tip.style("opacity",1).html(`<strong>${columns[ci]}</strong><div>${row.name}:</div><div class="pct" style="color:${row.color}">${v}%</div>`);const b=wrap.getBoundingClientRect(),tb=tip.node().getBoundingClientRect();let left=(event.clientX||b.left+width/2)-b.left+12;left=Math.max(4,Math.min(left,b.width-tb.width-4));let top=(event.clientY||b.top+70)-b.top-tb.height-10;top=Math.max(4,Math.min(top,b.height-tb.height-4));tip.style("left",left+"px").style("top",top+"px");}).on("pointerleave blur",()=>tip.style("opacity",0));
      });
    });
    const numberedNotes = [
        { n: "1", col: "Unmarried Couple", row: rows[1], value: 17 },
        { n: "2", col: "Married Couple", row: rows[0], value: 16 },
        { n: "3", col: "Single Female", row: rows[0], value: 16 }
      ];

      numberedNotes.forEach(note => {
        const tx = x(note.col);
        const ty = y(note.row.name) + y.bandwidth() / 2;
        const rr = r(note.value);
        const bx = tx + rr * 0.65;
        const by = ty - rr * 0.85;

        g.append("circle")
          .attr("class", "number-badge")
          .attr("cx", bx)
          .attr("cy", by)
          .attr("r", mobile ? 7.5 : tablet ? 9 : 11);

        g.append("text")
          .attr("class", "badge-text")
          .attr("x", bx)
          .attr("y", by + (mobile ? 3 : tablet ? 3.5 : 4))
          .attr("text-anchor", "middle")
          .text(note.n);
      });

      // Wrap multiword categories consistently at every viewport width.
      const headerLines = {"All Buyers":["All","Buyers"],"Married Couple":["Married","Couple"],"Single Female":["Single","Female"],"Single Male":["Single","Male"],"Unmarried Couple":["Unmarried","Couple"],"Other":["Other"]};
      const headerSize = mobile ? Math.max(7.5,Math.min(9,colStep*.22)) : tablet ? Math.max(11,Math.min(13,colStep*.19)) : Math.max(13,Math.min(15,colStep*.18));
      const lineHeight = mobile ? 11 : tablet ? 16 : 19;
      columns.forEach(c => {
        const parts=headerLines[c];
        const t=g.append("text").attr("class","column-head").attr("x",x(c)).attr("y",-lineHeight*(parts.length===2?2.2:1.65)).attr("text-anchor","middle").attr("font-size",headerSize);
        parts.forEach((part,j)=>t.append("tspan").attr("x",x(c)).attr("dy",j===0?0:lineHeight).text(part));
      });
  }
  let resizeFrame;
   window.addEventListener("resize",()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(render)});
   if(document.fonts) document.fonts.ready.then(render);
   render();