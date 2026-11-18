const raw=`1981,68,12,13,0,7
1985,75,11,9,4,0
1987,71,13,12,4,0
1989,63,15,17,5,0
1991,70,17,13,0,0
1993,61,18,13,8,0
1995,63,16,11,9,1
1997,56,20,16,7,1
2006,49,27,11,11,2
2007,51,25,11,11,2
2008,49,24,12,12,2
2009,49,25,12,12,1
2010,48,23,15,12,1
2011,54,21,12,12,1
2012,55,19,11,14,1
2013,56,19,11,13,2
2014,54,18,11,15,2
2015,56,18,11,13,2
2016,58,18,8,14,2
2017,57,18,7,16,2
2018,54,18,10,16,2
2019,53,17,10,17,4
2020,52,19,11,16,3
2021,50,20,11,17,2
2022,49,19,10,18,5
2023,52,19,10,16,3
2024,50,24,11,12,4
2025,50,25,10,11,4
2026,47,25,12,11,5`;
const keys=["Married Couple","Single Female","Single Male","Unmarried Couple","Other"];
const colors={"Married Couple":"#006bb7","Single Female":"#ff7f61","Single Male":"#077a8a","Unmarried Couple":"#319b76","Other":"#b03995"};
const data=raw.split("\n").map(line=>{const a=line.split(","); const o={year:+a[0]}; keys.forEach((k,i)=>o[k]=a[i+1]==="-"||a[i+1]==="*"?null:+a[i+1]); return o;});
const svg=d3.select("#chart"),wrap=document.getElementById("chart-wrap"),tip=d3.select(".tooltip");let selected="Other";
const filters=d3.select(".filters");filters.append("button").attr("class","filter").attr("data-key","all").text("All Household Types");filters.selectAll("button.series-filter").data(keys).join("button").attr("class",d=>"filter series-filter"+(d===selected?" active":"")).attr("data-key",d=>d).text(d=>d);
d3.selectAll(".filter").on("click",function(){selected=this.dataset.key==="all"?null:this.dataset.key;d3.selectAll(".filter").classed("active",function(){return(!selected&&this.dataset.key==="all")||this.dataset.key===selected});update();});
function update(){
  svg.selectAll(".series").transition().duration(180).style("opacity",d=>!selected||d===selected?1:.12);
  svg.selectAll(".end-label").transition().duration(180).style("opacity",d=>!selected||d===selected?1:.16);
  svg.selectAll(".other-record-marker").transition().duration(180).style("opacity",!selected||selected==="Other"?1:.16);
}
function render(){const width=Math.max(320,wrap.clientWidth),mobile=width<600,height=mobile?400:500,m={top:34,right:mobile?104:235,bottom:50,left:mobile?42:58},pw=width-m.left-m.right,ph=height-m.top-m.bottom;svg.attr("viewBox",`0 0 ${width} ${height}`);svg.selectAll("*").remove();const g=svg.append("g").attr("transform",`translate(${m.left},${m.top})`),x=d3.scalePoint().domain(data.map(d=>d.year)).range([0,pw]),y=d3.scaleLinear().domain([0,85]).range([ph,0]);g.append("g").attr("class","grid").call(d3.axisLeft(y).tickValues([0,20,40,60,80]).tickSize(-pw).tickFormat(""));g.append("g").attr("class","axis").call(d3.axisLeft(y).tickValues([0,20,40,60,80]).tickFormat(d=>d+"%"));const shownYears=mobile?[1981,1995,2005,2015,2026]:[1981,1989,1997,2005,2013,2021,2026];
const xa=g.append("g").attr("class","axis x-axis").attr("transform",`translate(0,${ph})`).call(d3.axisBottom(x).tickValues(shownYears).tickFormat(d3.format("d")).tickSize(7).tickPadding(10));g.append("line").attr("class","x-baseline").attr("x1",0).attr("x2",pw).attr("y1",ph).attr("y2",ph);const line=d3.line().defined(d=>d.value!=null).x(d=>x(d.year)).y(d=>y(d.value));keys.forEach(k=>{const vals=data.map(d=>({year:d.year,value:d[k]}));const sg=g.append("g").datum(k).attr("class","series");sg.append("path").datum(vals).attr("d",line).attr("stroke",colors[k]).attr("stroke-width",k==="Other"?4:3);sg.selectAll("circle").data(vals.filter(d=>d.value!=null)).join("circle").attr("class","dot").attr("cx",d=>x(d.year)).attr("cy",d=>y(d.value)).attr("r",k==="Other"?4.5:3.5).attr("fill",colors[k]);const last=vals.at(-1);
const labelOffsets={
  "Married Couple":0,
  "Single Female":-4,
  "Single Male":-15,
  "Unmarried Couple":1,
  "Other":10
};
const labelXOffsets={
  "Married Couple":8,
  "Single Female":8,
  "Single Male":10,
  "Unmarried Couple":10,
  "Other":34
};
g.append("text")
  .datum(k)
  .attr("class","end-label")
  .attr("x",pw+labelXOffsets[k])
  .attr("y",y(last.value)+4+(mobile?labelOffsets[k]*.72:labelOffsets[k]))
  .attr("fill",colors[k])
  .text(`${k}: ${last.value}%`);});
// 2026 record marker
const ox=x(2026),oy=y(5);
const otherOffset=10;
const otherLabelX=pw+34;
const otherLabelY=y(5)+4+(mobile?otherOffset*.6:otherOffset);
const markerRadius=mobile?6.5:8;
const markerX=otherLabelX-markerRadius-3;
const markerY=otherLabelY-(mobile?3:3.5);
g.append("circle")
  .attr("class","other-record-marker")
  .attr("cx",markerX)
  .attr("cy",markerY)
  .attr("r",markerRadius)
  .attr("fill",colors.Other)
  .attr("stroke","#fff")
  .attr("stroke-width",2);
g.append("text")
  .attr("class","other-record-marker")
  .attr("x",markerX)
  .attr("y",markerY+(mobile?3:3.5))
  .attr("text-anchor","middle")
  .attr("font-size",mobile?8.5:10)
  .attr("font-weight",800)
  .attr("fill","#fff")
  .text("1");
const focus=g.append("g").style("display","none");focus.append("line").attr("class","focus-line").attr("y1",0).attr("y2",ph);const fd=focus.selectAll("circle").data(keys).join("circle").attr("r",4.5).attr("fill",d=>colors[d]).attr("stroke","#fff").attr("stroke-width",1.5);function moved(e){const [mx]=d3.pointer(e,g.node());let i=0,best=Infinity;data.forEach((row,idx)=>{const dist=Math.abs(x(row.year)-mx);if(dist<best){best=dist;i=idx;}});const d=data[i],xx=x(d.year);focus.style("display",null);focus.select("line").attr("x1",xx).attr("x2",xx);fd.attr("cx",xx).attr("cy",k=>d[k]==null?-100:y(d[k]));tip.style("opacity",1).html(`<strong>${d.year}</strong>`+keys.map(k=>`<div class="tip-row"><span><i class="tip-dot" style="background:${colors[k]}"></i>${k}:</span><b style="color:${colors[k]}">${d[k]==null?"N/A":d[k]+"%"}</b></div>`).join(""));const b=wrap.getBoundingClientRect(),tb=tip.node().getBoundingClientRect();let left=(e.clientX||b.left+xx)-b.left+12;left=Math.max(4,Math.min(left,b.width-tb.width-4));let top=(e.clientY||b.top+100)-b.top-tb.height-10;top=Math.max(4,Math.min(top,b.height-tb.height-4));tip.style("left",left+"px").style("top",top+"px");}g.append("rect").attr("width",pw).attr("height",ph).attr("fill","transparent").style("cursor","crosshair").on("pointermove pointerdown",moved).on("pointerleave",()=>{focus.style("display","none");tip.style("opacity",0)});update();}
window.addEventListener("resize",render);document.fonts.ready.then(render);render();