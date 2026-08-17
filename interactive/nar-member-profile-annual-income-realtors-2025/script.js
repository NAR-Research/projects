const incomeData = {
      "all-realtors": { label: "All REALTORS®", median: 59200, distribution: [19,11,8,8,11,10,13,7,4,9] },
      "2-or-less": { label: "2 years or less", median: 8000, distribution: [62,15,6,7,5,2,2,1,1,.5] },
      "3-to-5": { label: "3 to 5 years", median: 38800, distribution: [21,16,10,12,12,10,10,4,2,3] },
      "6-to-15": { label: "6 to 15 years", median: 71400, distribution: [11,10,7,10,14,11,17,7,3,9] },
      "16-or-more": { label: "16 years or more", median: 88500, distribution: [8,8,8,7,12,13,16,9,6,14] }
    };

    const brackets = [
      "Less than $10,000", "$10,000 to $24,999", "$25,000 to $34,999", "$35,000 to $49,999",
      "$50,000 to $74,999", "$75,000 to $99,999", "$100,000 to $149,999", "$150,000 to $199,999",
      "$200,000 to $249,999", "$250,000 or more"
    ];

    const state = { selectedKey: null, filter: "all" };
    const $ = id => document.getElementById(id);
    const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

    function animateNumber(element, endValue, duration = 700) {
      const start = performance.now();
      function frame(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = currency.format(Math.round(endValue * eased));
        if (progress < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    function filterIncludes(index) {
      if (state.filter === "under50") return index <= 3;
      if (state.filter === "50to99") return index >= 4 && index <= 5;
      if (state.filter === "100plus") return index >= 6;
      return true;
    }

    function renderBars() {
      const selected = incomeData[state.selectedKey];
      const bars = $("bars");
      bars.innerHTML = "";
      const visibleValues = selected.distribution.filter((_, i) => filterIncludes(i));
      const maxValue = Math.max(...visibleValues);
      const overallTop = selected.distribution.indexOf(Math.max(...selected.distribution));

      selected.distribution.forEach((value, index) => {
        if (!filterIncludes(index)) return;
        const row = document.createElement("div");
        row.className = "bar-row" + (index === overallTop ? " highlighted" : "");

        const label = document.createElement("div");
        label.className = "bar-label";
        label.textContent = brackets[index];

        const track = document.createElement("div");
        track.className = "bar-track";
        track.setAttribute("role", "img");
        track.setAttribute("aria-label", `${brackets[index]}: ${value < 1 ? "less than 1" : value} percent`);

        const fill = document.createElement("div");
        fill.className = "bar-fill";
        track.appendChild(fill);

        const valueLabel = document.createElement("div");
        valueLabel.className = "bar-value";
        valueLabel.textContent = value < 1 ? "<1%" : `${value}%`;

        row.append(label, track, valueLabel);
        bars.appendChild(row);
        requestAnimationFrame(() => fill.style.width = `${Math.max((value / maxValue) * 100, value > 0 ? 2 : 0)}%`);
      });
    }

    function showResults() {
      const key = $("experience").value;
      if (!key || !incomeData[key]) {
        $("error-message").style.display = "block";
        $("experience").focus();
        return;
      }

      state.selectedKey = key;
      state.filter = "all";
      document.querySelectorAll(".ghost-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.filter === "all"));
      $("error-message").style.display = "none";

      const selected = incomeData[key];
      const maxValue = Math.max(...selected.distribution);
      const topIndex = selected.distribution.indexOf(maxValue);
      const sixFigureShare = selected.distribution.slice(6).reduce((sum, value) => sum + value, 0);
      const overallMedian = incomeData["all-realtors"].median;
      const gap = selected.median - overallMedian;

      $("results-title").innerHTML = `If you’ve been in real estate for <em>${selected.label}</em>, here’s what the data show.`;
      $("results-summary").textContent = `REALTORS® in this experience group had a median annual income of ${currency.format(selected.median)}. The chart below shows how earnings were distributed across ten income brackets.`;
      animateNumber($("median-income"), selected.median);
      $("top-bracket").textContent = brackets[topIndex];
      $("top-bracket-copy").textContent = `${maxValue < 1 ? "Less than 1" : maxValue}% of this group fell into this range.`;
      $("six-figure-share").textContent = `${sixFigureShare}%`;
      $("benchmark").textContent = gap === 0 ? "Near overall median" : `${currency.format(Math.abs(gap))} ${gap > 0 ? "above" : "below"}`;
      $("benchmark-copy").textContent = `Compared with the $59,200 median for All REALTORS®.`;

      $("compare-result").classList.remove("visible");
      renderBars();
      $("results").classList.add("visible");
      $("results").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    document.querySelectorAll(".ghost-btn").forEach(button => {
      button.addEventListener("click", () => {
        state.filter = button.dataset.filter;
        document.querySelectorAll(".ghost-btn").forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        renderBars();
      });
    });

    function renderComparison() {
      const compareKey = $("compare-experience").value;
      if (!compareKey || !state.selectedKey) return;
      const base = incomeData[state.selectedKey];
      const other = incomeData[compareKey];
      const delta = other.median - base.median;
      const maxMedian = Math.max(base.median, other.median, 1);
      const baseHeight = Math.max(28, Math.round((base.median / maxMedian) * 160));
      const otherHeight = Math.max(28, Math.round((other.median / maxMedian) * 160));

      $("compare-selected-label").textContent = base.label;
      $("compare-selected-amount").textContent = currency.format(base.median);
      $("compare-other-label").textContent = other.label;
      $("compare-other-amount").textContent = currency.format(other.median);
      $("selected-bar-value").textContent = currency.format(base.median);
      $("other-bar-value").textContent = currency.format(other.median);
      $("selected-bar-label").textContent = `Your group (${base.label})`;
      $("other-bar-label").textContent = other.label;
      $("compare-copy").innerHTML = delta === 0
        ? `<span class="compare-difference">The two groups have the same 2025 median gross income.</span>`
        : `<span class="compare-difference">${currency.format(Math.abs(delta))} ${delta > 0 ? "higher" : "lower"}</span> than your selected group.`;
      $("compare-chart").setAttribute("aria-label", `${base.label}: ${currency.format(base.median)}; ${other.label}: ${currency.format(other.median)}`);
      $("compare-result").classList.add("visible");

      $("selected-bar").style.height = "0px";
      $("other-bar").style.height = "0px";
      requestAnimationFrame(() => requestAnimationFrame(() => {
        $("selected-bar").style.height = `${baseHeight}px`;
        $("other-bar").style.height = `${otherHeight}px`;
      }));
    }

    $("compare-btn").addEventListener("click", renderComparison);


    $("submit").addEventListener("click", showResults);
    $("experience").addEventListener("change", () => $("error-message").style.display = "none");
    $("experience").addEventListener("keydown", event => { if (event.key === "Enter") showResults(); });
