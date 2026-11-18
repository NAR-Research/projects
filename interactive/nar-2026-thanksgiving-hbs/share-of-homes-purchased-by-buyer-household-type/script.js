const households=["All Buyers","Married Couple","Single Female","Single Male","Unmarried Couple","Other"];
const types=[
 {key:"Detached Single-Family Home",color:"#006BB7",values:[76,83,62,61,77,72]},
 {key:"Townhouse/Row House",color:"#FF7F61",values:[7,5,11,9,4,7]},
 {key:"Duplex/Apartment/Condo in 2 to 4 Unit Building",color:"#6EC49B",values:[5,3,9,7,5,4]},
 {key:"Apartment/Condo in Building with 5 or More Units",color:"#077A8A",values:[5,3,8,14,3,2]},
 {key:"Mobile/Manufactured Home",color:"#B03995",values:[3,2,3,5,4,7]},
 {key:"Cabin/Cottage",color:"#F5E566",values:[1,1,1,1,0,3]},
 {key:"Other",color:"#41134A",values:[4,2,5,3,6,5]}
];
const rows=households.map((h,i)=>{const o={household:h};types.forEach(t=>o[t.key]=t.values[i]);return o;});
const keys=types.map(d=>d.key), colors=Object.fromEntries(types.map(d=>[d.key,d.color]));
const svg=d3.select("#chart"),wrap=document.getElementById("chart-wrap"),tip=d3.select(".tooltip");let focusKey=null;
const legend=d3.select(".legend").selectAll(".legend-item").data(types).join("div").attr("class","legend-item").attr("tabindex",0).html(d=>`<span class="swatch" style="background:${d.color}"></span><span>${d.key}</span>`).on("click keydown",function(e,d){if(e.type==="keydown"&&!['Enter',' '].includes(e.key))return;e.preventDefault();focusKey=focusKey===d.key?null:d.key;legend.classed("active",x=>x.key===focusKey);update();});
function update(){svg.selectAll(".segment").transition().duration(180).style("opacity",d=>!focusKey||d.key===focusKey?1:.16);svg.selectAll(".inside-label").transition().duration(180).style("opacity",d=>!focusKey||d.key===focusKey?1:.12)}
function render(){const width=Math.max(320,wrap.clientWidth),mobile=width<600,height=mobile?430:510,m={top:mobile?39:(width<1100?105:115),right:18,bottom:68,left:48},pw=width-m.left-m.right,ph=height-m.top-m.bottom;svg.attr("viewBox",`0 0 ${width} ${height}`);svg.selectAll("*").remove();const g=svg.append("g").attr("transform",`translate(${m.left},${m.top})`),x=d3.scaleBand().domain(households).range([0,pw]).padding(mobile?.24:.42),y=d3.scaleLinear().domain([0,105]).range([ph,0]);g.append("g").attr("class","grid").call(d3.axisLeft(y).tickValues([0,20,40,60,80,100]).tickSize(-pw).tickFormat(""));g.append("g").attr("class","axis").call(d3.axisLeft(y).tickValues([0,20,40,60,80,100]).tickFormat(d=>d+"%"));const stack=d3.stack().keys(keys)(rows);const groups=g.selectAll(".stack").data(stack).join("g").attr("fill",d=>colors[d.key]);const rects=groups.selectAll("rect").data(d=>d.map(v=>Object.assign(v,{key:d.key}))).join("rect").attr("class","segment").attr("x",d=>x(d.data.household)).attr("y",d=>y(d[1])).attr("height",d=>Math.max(0,y(d[0])-y(d[1]))).attr("width",x.bandwidth()).attr("rx",d=>d.key===keys.at(-1)?3:0).on("pointermove",function(e,d){d3.select(this).attr("stroke","#333").attr("stroke-width",2);const value=d.data[d.key];tip.style("opacity",1).html(`<strong>${d.data.household}</strong><div>${d.key}:</div><div class="tip-value" style="color:${colors[d.key]}">${value}%</div>`);const b=wrap.getBoundingClientRect(),tb=tip.node().getBoundingClientRect();let left=e.clientX-b.left+12;left=Math.max(4,Math.min(left,b.width-tb.width-4));let top=e.clientY-b.top-tb.height-10;top=Math.max(4,Math.min(top,b.height-tb.height-4));tip.style("left",left+"px").style("top",top+"px")}).on("pointerleave",function(){d3.select(this).attr("stroke","#fff").attr("stroke-width",1.2);tip.style("opacity",0)});
// direct percentage labels for large enough segments
const labelData=[];stack.forEach(layer=>layer.forEach(d=>{const v=d.data[layer.key];if(v>= (mobile?10:7))labelData.push({key:layer.key,data:d.data,y0:d[0],y1:d[1],value:v})}));g.selectAll(".inside-label").data(labelData).join("text").attr("class","inside-label").attr("x",d=>x(d.data.household)+x.bandwidth()/2).attr("y",d=>y((d.y0+d.y1)/2)+4).attr("text-anchor","middle").text(d=>d.value+"%");
// household labels
g.selectAll(".bar-label").data(households).join("text").attr("class","bar-label").attr("x",d=>x(d)+x.bandwidth()/2).attr("y",ph+22).attr("text-anchor","middle").each(function(d){const t=d3.select(this),parts=d.split(" ");if(mobile&&parts.length>1){const mid=Math.ceil(parts.length/2);t.append("tspan").attr("x",x(d)+x.bandwidth()/2).text(parts.slice(0,mid).join(" "));t.append("tspan").attr("x",x(d)+x.bandwidth()/2).attr("dy",11).text(parts.slice(mid).join(" "));}else t.text(d)});
// Highlight the Other household column. The connector terminates at the black rectangle itself.
const hx=x("Other")-8, hw=x.bandwidth()+16, hy=y(101), hh=y(0)-y(101);
g.append("rect").attr("class","other-highlight").attr("x",hx).attr("y",hy).attr("width",hw).attr("height",hh).attr("rx",4);
if(!mobile){
  // Dedicated annotation band above the Other column, matching the highlighted open area.
  const tablet=width<1100;
  const boxW=tablet?Math.min(330,pw*.43):Math.min(500,pw*.43);
  const noteX=Math.max(10,Math.min(pw-boxW-8,hx+hw-boxW));
  const noteY=tablet?-58:-66;
  const lineH=tablet?14:17;
  const lines=tablet?
    ["While most still opted for detached single-family homes,", "they were more likely than other buyers to purchase", "townhouses, mobile or manufactured homes, and other", "property types."]:
    ["While most still opted for detached single-family homes,", "they were more likely than other buyers to purchase townhouses,", "mobile or manufactured homes, and other property types."];
  const note=g.append("text").attr("class","other-callout").attr("x",noteX).attr("y",noteY);
  lines.forEach((line,i)=>note.append("tspan").attr("x",noteX).attr("dy",i===0?0:lineH).text(line));
  // Connector begins below the annotation and terminates on the top-left edge of the black rectangle.
  const startX=noteX+boxW*.64;
  const startY=noteY+(lines.length-1)*lineH+8;
  const endX=hx;
  const endY=hy+18;
  g.append("path").attr("class","other-callout-line").attr("d",`M ${startX} ${startY} C ${startX+10} ${startY+28}, ${endX-35} ${endY-16}, ${endX} ${endY}`);
}else{
  // Keep marker clearly above the black rectangle on small screens.
  const mx=hx+hw/2,my=hy-15;
  g.append("circle").attr("class","other-marker").attr("cx",mx).attr("cy",my).attr("r",8.5);
  g.append("text").attr("class","other-marker-text").attr("x",mx).attr("y",my+3.5).attr("text-anchor","middle").text("1");
}
update();}
window.addEventListener("resize",render);document.fonts.ready.then(render);render();
