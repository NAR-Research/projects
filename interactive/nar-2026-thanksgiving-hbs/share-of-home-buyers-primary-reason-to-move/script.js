
      const data = [
        [2007, 12, 9, 5],
        [2008, 11, 9, 6],
        [2009, 9, 9, 4],
        [2010, 7, 8, 5],
        [2011, 10, 8, 7],
        [2012, 9, 8, 6],
        [2013, 8, 7, 6],
        [2014, 8, 7, 7],
        [2015, 8, 7, 7],
        [2016, 8, 8, 7],
        [2017, 8, 8, 8],
        [2018, 8, 7, 8],
        [2019, 7, 8, 9],
        [2020, 6, 8, 9],
        [2021, 5, 7, 10],
        [2022, 6, 6, 13],
        [2023, 6, 8, 12],
        [2024, 6, 8, 14],
        [2025, 5, 7, 16],
        [2026, 5, 7, 14],
      ].map((d) => ({ year: d[0], job: d[1], family: d[2], close: d[3] }));
      const series = [
        {
          key: "job",
          name: "Job-related relocation or move",
          color: "#006bb7",
        },
        { key: "family", name: "Change in family situation", color: "#ff7f61" },
        {
          key: "close",
          name: "Desire to be closer to family/friends/relatives",
          color: "#319b76",
        },
      ];
      const svg = d3.select("#chart"),
        tip = d3.select("#tooltip"),
        wrap = document.getElementById("chart-wrap");
      let selected = null;
      const filters = d3.selectAll(".filter").on("click", function () {
        selected = this.dataset.key === "all" ? null : this.dataset.key;
        filters.classed("active", function () {
          return (
            (selected === null && this.dataset.key === "all") ||
            this.dataset.key === selected
          );
        });
        updateHighlight();
      });
      function updateHighlight() {
        svg
          .selectAll(".series")
          .transition()
          .duration(180)
          .style("opacity", (d) =>
            !selected || d.key === selected ? 1 : 0.13,
          );
        svg
          .selectAll(".line")
          .transition()
          .duration(180)
          .attr("stroke-width", (d) => (selected === d.key ? 5.5 : 4));
        svg
          .selectAll(".end-label")
          .transition()
          .duration(180)
          .style("opacity", (d) =>
            !selected || d.key === selected ? 1 : 0.13,
          );
      }
      function render() {
        const width = Math.max(320, wrap.clientWidth),
          mobile = width < 600,
          height = mobile ? 350 : 455,
          m = {
            top: mobile ? 42 : 64,
            right: mobile ? 18 : 235,
            bottom: 42,
            left: mobile ? 44 : 58,
          },
          pw = width - m.left - m.right,
          ph = height - m.top - m.bottom;
        svg
          .attr("viewBox", `0 0 ${width} ${height}`)
          .attr("width", width)
          .attr("height", height);
        svg.selectAll("*").remove();
        const g = svg
            .append("g")
            .attr("transform", `translate(${m.left},${m.top})`),
          x = d3.scaleLinear().domain([2007, 2026]).range([0, pw]),
          y = d3.scaleLinear().domain([0, 18]).range([ph, 0]);
        g.append("g")
          .attr("class", "grid")
          .call(
            d3
              .axisLeft(y)
              .tickValues(d3.range(0, 19, 2))
              .tickSize(-pw)
              .tickFormat(""),
          );
        g.append("g")
          .attr("class", "axis")
          .call(
            d3
              .axisLeft(y)
              .tickValues(d3.range(0, 19, 2))
              .tickFormat((d) => d + "%"),
          );
        g.append("g")
          .attr("class", "axis x-axis")
          .attr("transform", `translate(0,${ph})`)
          .call(
            d3
              .axisBottom(x)
              .tickSize(7)
              .tickPadding(8)
              .tickValues(
                mobile
                  ? [2007, 2011, 2015, 2019, 2023, 2026]
                  : [2007, 2010, 2013, 2016, 2019, 2022, 2026],
              )
              .tickFormat(d3.format("d")),
          );
        const line = d3
          .line()
          .x((d) => x(d.year))
          .y((d) => y(d.value))
          .curve(d3.curveLinear);
        const sg = g
          .selectAll(".series")
          .data(series)
          .join("g")
          .attr("class", "series");
        sg.append("path")
          .attr("class", "line")
          .attr("fill", "none")
          .attr("stroke", (d) => d.color)
          .attr("stroke-width", 4)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("d", (s) =>
            line(data.map((d) => ({ year: d.year, value: d[s.key] }))),
          )
          .attr("stroke-dasharray", null)
          .attr("stroke-dashoffset", null);
        sg.each(function (s) {
          d3.select(this)
            .selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", (d) => x(d.year))
            .attr("cy", (d) => y(d[s.key]))
            .attr("r", mobile ? 4 : 5)
            .attr("fill", s.color)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1);
        });
        // Direct endpoint labels, matching the requested line treatment.
        if (!mobile) {
          g.selectAll(".end-label")
            .data(series)
            .join("text")
            .attr("class", "end-label")
            .attr("x", pw + 14)
            .attr("y", (s) => y(data[data.length - 1][s.key]) + 5)
            .attr("fill", (s) => s.color)
            .attr("font-size", 13)
            .attr("font-weight", 800)
            .text(
              (s) =>
                `${s.key === "close" ? "Closer To Family/Friends" : s.key === "family" ? "Family Situation" : "Job Relocation"}: ${data[data.length - 1][s.key]}%`,
            );
        }
        // Historical context bands: NBER recession dates condensed to annual chart positions.
        {
          const events = [
            {
              start: 2007.12,
              end: 2009.6,
              label1: "Great Recession",
              label2: "Started",
            },
            {
              start: 2020.1,
              end: 2023.5,
              label1: "COVID-19 Pandemic",
              label2: "Started",
            },
          ];
          const defs = svg.append("defs");
          const pat = defs
            .append("pattern")
            .attr("id", "diagHatch")
            .attr("patternUnits", "userSpaceOnUse")
            .attr("width", 6)
            .attr("height", 6)
            .attr("patternTransform", "rotate(45)");
          pat
            .append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", 6)
            .attr("stroke", "#c7cdd2")
            .attr("stroke-width", 2);
          events.forEach((ev) => {
            const sx = x(ev.start),
              ex = Math.max(sx + 14, x(ev.end));
            g.insert("rect", ":first-child")
              .attr("x", sx)
              .attr("y", 0)
              .attr("width", ex - sx)
              .attr("height", ph)
              .attr("fill", "url(#diagHatch)")
              .attr("opacity", 0.48);
            g.append("line")
              .attr("x1", sx)
              .attr("x2", sx)
              .attr("y1", 0)
              .attr("y2", ph)
              .attr("stroke", "#333")
              .attr("stroke-width", 1.4)
              .attr("stroke-dasharray", "6 5");
            const isCovid = ev.label1.startsWith("COVID");
            const tx = isCovid ? sx - 10 : sx + 10,
              anchor = isCovid ? "end" : "start";
            g.append("text")
              .attr("x", tx)
              .attr("y", 18)
              .attr("text-anchor", anchor)
              .attr("font-size", mobile ? 8.5 : 12)
              .attr("font-weight", 800)
              .attr("fill", "#333")
              .text(ev.label1);
            g.append("text")
              .attr("x", tx)
              .attr("y", 34)
              .attr("text-anchor", anchor)
              .attr("font-size", mobile ? 8.5 : 12)
              .attr("font-weight", 800)
              .attr("fill", "#333")
              .text(ev.label2);
          });
        }
        // Editorial callout anchored to supplied values only.
        const ax = x(2022),
          ay = y(13);
        if (mobile) {
          const mx = ax + 8,
            my = ay - 12;
          g.append("circle")
            .attr("cx", mx)
            .attr("cy", my)
            .attr("r", 9)
            .attr("fill", "#319b76")
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);
          g.append("text")
            .attr("x", mx)
            .attr("y", my + 3.5)
            .attr("text-anchor", "middle")
            .attr("font-size", 10)
            .attr("font-weight", 800)
            .attr("fill", "#fff")
            .text("1");
        } else {
          const bw = 250,
            bh = 64,
            boxX = Math.max(12, x(2020.25)),
            boxY = -8;
          g.append("line")
            .attr("x1", ax)
            .attr("y1", ay - 9)
            .attr("x2", Math.min(boxX + bw * 0.55, ax - 5))
            .attr("y2", boxY + bh)
            .attr("stroke", "#8b959d")
            .attr("stroke-width", 1.1);
          const a = g
            .append("g")
            .attr("transform", `translate(${boxX},${boxY})`);
          a.append("rect")
            .attr("class", "annotation-box")
            .attr("width", bw)
            .attr("height", bh)
            .attr("rx", 8);
          a.append("text")
            .attr("class", "annotation-title")
            .attr("x", 10)
            .attr("y", 21)
            .attr("font-size", 13)
            .attr("fill", "#319b76")
            .text("A Clear Shift By 2022");
          a.append("text")
            .attr("class", "annotation-copy")
            .attr("x", 10)
            .attr("y", 40)
            .attr("font-size", 11)
            .text("Closer To Family/Friends Reaches 13%,");
          a.append("text")
            .attr("class", "annotation-copy")
            .attr("x", 10)
            .attr("y", 55)
            .attr("font-size", 11)
            .text("More Than Double Job Relocation (6%).");
        }
        const focus = g.append("g").style("display", "none");
        focus
          .append("line")
          .attr("class", "focus-line")
          .attr("y1", 0)
          .attr("y2", ph);
        const fd = focus
          .selectAll("circle")
          .data(series)
          .join("circle")
          .attr("class", "focus-dot")
          .attr("r", 5)
          .attr("fill", (d) => d.color);
        const bis = d3.bisector((d) => d.year).center;
        function point(e) {
          const p = d3.pointer(e, g.node()),
            i = Math.max(
              0,
              Math.min(data.length - 1, bis(data, x.invert(p[0]))),
            ),
            d = data[i],
            xx = x(d.year);
          focus.style("display", null);
          focus.select("line").attr("x1", xx).attr("x2", xx);
          fd.attr("cx", xx).attr("cy", (s) => y(d[s.key]));
          tip
            .html(
              `<strong>${d.year}</strong>` +
                series
                  .map(
                    (s) =>
                      `<div class="tip-row"><span><i class="tip-dot" style="background:${s.color}"></i>${s.key === "family" ? "Family Situation" : s.key === "close" ? "Closer To Family/Friends" : "Job Relocation"}:</span><b style="color:${s.color}">${d[s.key]}%</b></div>`,
                  )
                  .join(""),
            )
            .style("opacity", 1);
          const b = wrap.getBoundingClientRect(),
            tb = tip.node().getBoundingClientRect();
          let left = (e.clientX || b.left + xx) - b.left + 12;
          left = Math.max(4, Math.min(left, b.width - tb.width - 4));
          let top = (e.clientY || b.top + ph / 2) - b.top - tb.height - 12;
          top = Math.max(4, Math.min(top, b.height - tb.height - 4));
          tip.style("left", left + "px").style("top", top + "px");
        }
        g.append("rect")
          .attr("class", "hit")
          .attr("width", pw)
          .attr("height", ph)
          .on("pointermove pointerdown", point)
          .on("pointerleave", () => {
            focus.style("display", "none");
            tip.style("opacity", 0);
          });
        updateHighlight();
      }
      window.addEventListener("resize", render);
      document.fonts.ready.then(render);
      render();
