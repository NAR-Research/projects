const households=["Married Couple","Unmarried Couple","Other"];
const types=[
 {key:"None",color:"#41134A",values:[4,1,3]},
 {key:"One",color:"#FF7F61",values:[20,12,26]},
 {key:"Two",color:"#006BB7",values:[65,78,43]},
 {key:"Three or More",color:"#077A8A",values:[11,9,28]}
];
const rows=households.map((h,i)=>{const o={household:h};types.forEach(t=>o[t.key]=t.values[i]);return o;});
const keys=types.map(d=>d.key),colors=Object.fromEntries(types.map(d=>[d.key,d.color]));
const svg=d3.select("#chart"),wrap=document.getElementById("chart-wrap"),tip=d3.select(".tooltip");let focusKey=null;
const legend=d3.select(".legend").html("").selectAll(".legend-item").data(types).join("div").attr("class","legend-item").attr("tabindex",0).html(d=>`<span class="swatch" style="background:${d.color}"></span><span>${d.key}</span>`).on("click keydown",function(e,d){if(e.type==="keydown"&&!['Enter',' '].includes(e.key))return;e.preventDefault();focusKey=focusKey===d.key?null:d.key;legend.classed("active",x=>x.key===focusKey);update();});
function update(){svg.selectAll(".segment").transition().duration(180).style("opacity",d=>!focusKey||d.key===focusKey?1:.16);svg.selectAll(".inside-label").transition().duration(180).style("opacity",d=>!focusKey||d.key===focusKey?1:.12)}
function render(){
 const width=Math.max(320,wrap.clientWidth),mobile=width<600,height=mobile?460:520,m={top:mobile?54:(width<1100?135:145),right:28,bottom:72,left:50},pw=width-m.left-m.right,ph=height-m.top-m.bottom;
 svg.attr("viewBox",`0 0 ${width} ${height}`);svg.selectAll("*").remove();const g=svg.append("g").attr("transform",`translate(${m.left},${m.top})`),x=d3.scaleBand().domain(households).range([0,pw]).padding(mobile?.28:.5),y=d3.scaleLinear().domain([0,100]).range([ph,0]);
 g.append("g").attr("class","grid").call(d3.axisLeft(y).tickValues([0,20,40,60,80,100]).tickSize(-pw).tickFormat(""));g.append("g").attr("class","axis").call(d3.axisLeft(y).tickValues([0,20,40,60,80,100]).tickFormat(d=>d+"%"));
 const stack=d3.stack().keys(keys)(rows);const groups=g.selectAll(".stack").data(stack).join("g").attr("fill",d=>colors[d.key]);groups.selectAll("rect").data(d=>d.map(v=>Object.assign(v,{key:d.key}))).join("rect").attr("class","segment").attr("x",d=>x(d.data.household)).attr("y",d=>y(d[1])).attr("height",d=>y(d[0])-y(d[1])).attr("width",x.bandwidth()).on("pointermove",function(e,d){d3.select(this).attr("stroke","#333").attr("stroke-width",2);const value=d.data[d.key];tip.style("opacity",1).html(`<strong>${d.data.household}</strong><div>${d.key}:</div><div class="tip-value" style="color:${colors[d.key]}">${value}%</div>`);const b=wrap.getBoundingClientRect(),tb=tip.node().getBoundingClientRect();let l=e.clientX-b.left+12;l=Math.max(4,Math.min(l,b.width-tb.width-4));let t=e.clientY-b.top-tb.height-10;t=Math.max(4,Math.min(t,b.height-tb.height-4));tip.style("left",l+"px").style("top",t+"px")}).on("pointerleave",function(){d3.select(this).attr("stroke","#fff").attr("stroke-width",1.2);tip.style("opacity",0)});
 const labelData=[];stack.forEach(layer=>layer.forEach(d=>{const v=d.data[layer.key];if(v>=8)labelData.push({key:layer.key,data:d.data,y0:d[0],y1:d[1],value:v})}));g.selectAll(".inside-label").data(labelData).join("text").attr("class","inside-label").attr("x",d=>x(d.data.household)+x.bandwidth()/2).attr("y",d=>y((d.y0+d.y1)/2)+4).attr("text-anchor","middle").text(d=>d.value+"%");
 g.selectAll(".bar-label").data(households).join("text").attr("class","bar-label").attr("x",d=>x(d)+x.bandwidth()/2).attr("y",ph+25).attr("text-anchor","middle").each(function(d){const t=d3.select(this),parts=d.split(" ");if(mobile){const mid=Math.ceil(parts.length/2);t.append("tspan").attr("x",x(d)+x.bandwidth()/2).text(parts.slice(0,mid).join(" "));if(parts.length>1)t.append("tspan").attr("x",x(d)+x.bandwidth()/2).attr("dy",12).text(parts.slice(mid).join(" "));}else t.text(d)});
 // Editorial highlight: Other has a much larger three-or-more-earner share (28%).
 const hx=x("Other")-8,hw=x.bandwidth()+16,hy=y(100),hh=y(0)-y(100);g.append("rect").attr("class","other-highlight").attr("x",hx).attr("y",hy).attr("width",hw).attr("height",hh).attr("rx",4);
 if(!mobile){
   const tablet=width<1100;
   // Annotation occupies the dedicated open band directly above the highlighted Other bar.
   const boxW=tablet?Math.min(310,pw*.42):Math.min(430,pw*.40);
   const barCenter=hx+hw/2;
   const noteX=Math.max(8,Math.min(pw-boxW-8,barCenter-boxW/2));
   const noteY=tablet?-92:-100;
   const lh=tablet?14:16;
   const lines=tablet?
     ["Other households stand out for having more income earners:","28% had three or more, compared with 11% of married","couples and 9% of unmarried couples."]:
     ["Other households stand out for having more income earners:","28% had three or more, compared with 11% of married couples","and 9% of unmarried couples."];
   const note=g.append("text").attr("class","other-callout").attr("x",noteX).attr("y",noteY);
   lines.forEach((line,i)=>note.append("tspan").attr("x",noteX).attr("dy",i===0?0:lh).text(line));
   // Short centered connector from annotation band to the top edge of the black rectangle.
   const sx=barCenter,sy=noteY+(lines.length-1)*lh+10,ex=barCenter,ey=hy;
   g.append("path").attr("class","other-callout-line").attr("d",`M ${sx} ${sy} C ${sx} ${sy+18}, ${ex} ${ey-14}, ${ex} ${ey}`);
   g.append("circle").attr("class","other-callout-dot").attr("cx",sx).attr("cy",sy).attr("r",tablet?4.5:5.5);
 }else{const mx=hx+hw/2,my=hy-15;g.append("circle").attr("class","other-marker").attr("cx",mx).attr("cy",my).attr("r",8.5);g.append("text").attr("class","other-marker-text").attr("x",mx).attr("y",my+3.5).attr("text-anchor","middle").text("1");}
 update();
}
window.addEventListener("resize",render);document.fonts.ready.then(render);render();
