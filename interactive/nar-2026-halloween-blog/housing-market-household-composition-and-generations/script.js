    // Original percentages supplied by the user; no derived data.
    const data = [
      { category: "Married Couple", all: 61, pet: 52 },
      { category: "Single Female", all: 21, pet: 27 },
      { category: "Single Male", all: 9, pet: 3 },
      { category: "Unmarried Couple", all: 6, pet: 14 },
      { category: "Other", all: 3, pet: 5 }
    ];

    const blue = "#006bb7";
    const coral = "#ff7f61";
    const svg = d3.select("#chart");
    const tooltip = d3.select("#tooltip");
    const wrap = document.getElementById("chart-wrap");


    // Highlight an existing chart row without computing new statistics.
    let selectedCategory = null;
    document.querySelectorAll(".annotation").forEach(button => {
      button.addEventListener("click", () => {
        selectedCategory = selectedCategory === button.dataset.category ? null : button.dataset.category;
        document.querySelectorAll(".annotation").forEach(b => {
          const on = b.dataset.category === selectedCategory;
          b.classList.toggle("active", on);
          b.setAttribute("aria-pressed", String(on));
        });
        updateSpotlight();
      });
    });
    function updateSpotlight() {
      svg.selectAll(".plot-row")
        .classed("is-muted", d => Boolean(selectedCategory && d !== selectedCategory))
        .classed("is-highlighted", d => Boolean(selectedCategory && d === selectedCategory));
    }

    function showTooltip(event, item) {
      tooltip.html(`
        <strong>${item.category}</strong>
        <div>All Buyers: <span class="blue-text">${item.all}%</span></div>
        <div>Buyers Purchasing for Their Pet: <span class="coral-text">${item.pet}%</span></div>
      `);
      tooltip.style("opacity", 1);
      const bounds = wrap.getBoundingClientRect();
      const tipBounds = tooltip.node().getBoundingClientRect();
      const x = Math.max(4, Math.min(event.clientX - bounds.left + 12, bounds.width - tipBounds.width - 4));
      const y = Math.max(2, event.clientY - bounds.top - tipBounds.height - 10);
      tooltip.style("left", `${x}px`).style("top", `${y}px`);
    }

    function hideTooltip() {
      tooltip.style("opacity", 0);
    }

    function render() {
      const width = Math.max(320, wrap.clientWidth);
      const mobile = width < 540;
      const height = mobile ? 365 : 382;
      const center = width / 2;
      const labelHalfWidth = mobile ? 73 : 111;
      const outerMargin = mobile ? 17 : 36;
      const gap = mobile ? 8 : 15;
      const leftEdge = outerMargin;
      const rightEdge = width - outerMargin;
      const leftInner = center - labelHalfWidth - gap;
      const rightInner = center + labelHalfWidth + gap;
      const top = mobile ? 72 : 82;
      const rowHeight = mobile ? 62 : 64;
      const dotRadius = mobile ? 6 : 7;

      // Each side independently displays the original percentage on a 0–70% scale.
      const leftX = d3.scaleLinear().domain([0, 70]).range([leftInner, leftEdge]);
      const rightX = d3.scaleLinear().domain([0, 70]).range([rightInner, rightEdge]);

      svg.attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", width)
        .attr("height", height);
      svg.selectAll("*").remove();

      svg.append("text")
        .attr("x", (leftEdge + leftInner) / 2)
        .attr("y", 22)
        .attr("text-anchor", "middle")
        .attr("font-size", mobile ? 11 : 15)
        .attr("font-weight", 700)
        .attr("fill", blue)
        .text("ALL BUYERS");

      svg.append("text")
        .attr("x", (rightInner + rightEdge) / 2)
        .attr("y", 22)
        .attr("text-anchor", "middle")
        .attr("font-size", mobile ? 10 : 15)
        .attr("font-weight", 700)
        .attr("fill", "#d96145")
        .text(mobile ? "PET BUYERS" : "BUYERS PURCHASING FOR THEIR PET");

      [0, 20, 40, 60].forEach(tick => {
        [leftX(tick), rightX(tick)].forEach(x => {
          svg.append("line")
            .attr("x1", x).attr("x2", x)
            .attr("y1", 47).attr("y2", top + rowHeight * 4 + 30)
            .attr("stroke", "#e8ebee")
            .attr("stroke-dasharray", "2 4");
        });
      });

      data.forEach((item, index) => {
        const y = top + index * rowHeight;
        const group = svg.append("g")
          .attr("class", "plot-row")
          .datum(item.category)
          .attr("tabindex", 0)
          .attr("role", "group")
          .attr("aria-label", `${item.category}: all buyers ${item.all} percent; buyers purchasing for their pet ${item.pet} percent`);

        group.append("line")
          .attr("x1", leftEdge).attr("x2", rightEdge)
          .attr("y1", y + 27).attr("y2", y + 27)
          .attr("stroke", "#f0f1f2");

        group.append("text")
          .attr("x", center).attr("y", y + 4)
          .attr("text-anchor", "middle")
          .attr("font-size", mobile ? 11 : 15)
          .attr("font-weight", 650)
          .attr("fill", "#2b2b2b")
          .text(item.category);

        [
          { value: item.all, x: leftX(item.all), color: blue, side: "left" },
          { value: item.pet, x: rightX(item.pet), color: coral, side: "right" }
        ].forEach(point => {
          const startX = point.side === "left" ? leftInner : rightInner;

          group.append("line")
            .attr("x1", startX).attr("x2", startX)
            .attr("y1", y + 13).attr("y2", y + 13)
            .attr("stroke", point.color)
            .attr("stroke-width", 3)
            .attr("stroke-linecap", "round")
            .transition().duration(600)
            .attr("x2", point.x);

          group.append("circle")
            .attr("class", "focus-ring")
            .attr("cx", point.x).attr("cy", y + 13)
            .attr("r", dotRadius)
            .attr("fill", point.color)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 2);

          const textX = point.side === "left" ? point.x - 11 : point.x + 11;
          group.append("text")
            .attr("x", textX).attr("y", y + 17)
            .attr("text-anchor", point.side === "left" ? "end" : "start")
            .attr("font-size", mobile ? 12 : 16)
            .attr("font-weight", 750)
            .attr("fill", point.color)
            .text(`${point.value}%`);
        });

        group.append("rect")
          .attr("x", leftEdge).attr("y", y - 22)
          .attr("width", rightEdge - leftEdge)
          .attr("height", 56)
          .attr("fill", "transparent");

        group.on("pointermove", event => showTooltip(event, item))
          .on("pointerleave", hideTooltip)
          .on("focus", () => {
            const bounds = wrap.getBoundingClientRect();
            showTooltip({ clientX: bounds.left + center, clientY: bounds.top + y }, item);
          })
          .on("blur", hideTooltip)
          .on("click", event => showTooltip(event, item));
      });
      updateSpotlight();
    }

    // Keep the SVG fitted to its content instead of reserving extra blank space.
    // This mirrors the compact chart-to-footer spacing in the EHS comparison.
    window.addEventListener("resize", render);
    document.fonts.ready.then(render);
    render();
