const metrics=[{
    id:'sales',name:'YTD Existing-Home Sales',short:'Home Sales',v25:3062000,v26:3085000,change:'0.8%',unit:'homes',format:d3.format(',')
}
,{
    id:'price',name:'YTD Average Median Price',short:'Median Price',v25:413789,v26:419222,change:'1.3%',unit:'USD',format:v=>'$'+d3.format(',')(v)
}
,{
    id:'inventory',name:'September Inventory',short:'Inventory',v25:1530000,v26:1600000,change:'4.6%',unit:'homes',format:d3.format(',')
}
];
let selected='sales';
const cards=d3.select('#cards');
cards.selectAll('button').data(metrics).join('button').attr('type','button').attr('class',d=>'metric'+(d.id===selected?' active':'')).attr('data-id',d=>d.id).attr('aria-pressed',d=>String(d.id===selected)).html(d=>`<div class="name">${d.name}</div><div class="change">+${d.change}</div><div class="tag">↑ Year-over-year</div>`).on('click',(e,d)=>setMetric(d.id));
d3.selectAll('.tab').on('click',function(){
    setMetric(this.dataset.id)
}
);
function setMetric(id){
    selected=id;
    d3.selectAll('.tab').classed('active',function(){
        return this.dataset.id===id
    }
    ).attr('aria-pressed',function(){
        return String(this.dataset.id===id)
    }
    );
    d3.selectAll('.metric').classed('active',function(){
        return this.dataset.id===id
    }
    ).attr('aria-pressed',function(){
        return String(this.dataset.id===id)
    }
    );
    render()
}
function render(){
    const d=metrics.find(x=>x.id===selected);
    d3.select('#chartsub').text(`2025 vs. 2026  ·  +${d.change} year over year`);
    const svg=d3.select('#chart'),node=svg.node(),w=Math.max(290,node.getBoundingClientRect().width),h=+getComputedStyle(node).height.replace('px','')||240,m={
        top:24,right:24,bottom:34,left:window.innerWidth<480?66:window.innerWidth<768?82:112
    }
    ,innerW=w-m.left-m.right;
    svg.attr('viewBox',`0 0 ${w} ${h}`);
    svg.selectAll('*').remove();
    const g=svg.append('g').attr('transform',`translate(${m.left},${m.top})`),values=[{
        year:'2025',value:d.v25,color:'#ff7f61'
    }
    ,{
        year:'2026',value:d.v26,color:'#006bb7'
    }
    ],x=d3.scaleLinear().domain([0,d3.max(values,v=>v.value)*1.13]).range([0,innerW]),y=d3.scaleBand().domain(values.map(v=>v.year)).range([0,h-m.top-m.bottom]).padding(.44);
    g.append('g').attr('class','grid').call(d3.axisBottom(x).ticks(4).tickSize(-(h-m.top-m.bottom)).tickFormat('')).attr('transform',`translate(0,${h-m.top-m.bottom})`).select('.domain').remove();
    g.append('g').attr('class','axis').call(d3.axisLeft(y).tickSize(0).tickPadding(14));
    const bars=g.selectAll('.bar').data(values).join('rect').attr('class','bar').attr('x',0).attr('y',v=>y(v.year)).attr('width',0).attr('height',y.bandwidth()).attr('rx',6).attr('fill',v=>v.color).style('cursor','pointer');
    bars.transition().duration(650).ease(d3.easeCubicOut).attr('width',v=>x(v.value));
    g.selectAll('.barvalue').data(values).join('text').attr('class','barvalue').attr('x',v=>Math.min(x(v.value)+10,innerW-3)).attr('y',v=>y(v.year)+y.bandwidth()/2+(window.innerWidth<480?4:6)).attr('text-anchor',v=>x(v.value)+10>innerW-4?'end':'start').text(v=>d.format(v.value)).attr('opacity',0).transition().delay(420).duration(250).attr('opacity',1);
    const tip=d3.select('#tip');
    // Matching the Pet-Motivated Home Buyers tooltip typography and colors.
    function showTip(event, v) {
        const rect = document.querySelector('.viz').getBoundingClientRect();
        const html = `<span class="tip-title">${d.name}</span>` +
          `<div>2025: <span class="tip-value coral">${d.format(d.v25)}</span></div>` +
          `<div>2026: <span class="tip-value blue">${d.format(d.v26)}</span></div>`;
        tip.html(html).style('opacity', 1);
        const tipWidth = tip.node().offsetWidth;
        const tipHeight = tip.node().offsetHeight;
        const left = Math.max(0, Math.min(event.clientX - rect.left + 12, rect.width - tipWidth));
        const top = Math.max(0, event.clientY - rect.top - tipHeight - 12);
        tip.style('left', left + 'px').style('top', top + 'px');
    }
    bars.on('pointermove', showTip)
      .on('pointerdown', showTip)
      .on('pointerleave', () => tip.style('opacity', 0));

}
render();
let resizeTimer;
window.addEventListener('resize',()=>{
    clearTimeout(resizeTimer);resizeTimer=setTimeout(render,100)
}
);
