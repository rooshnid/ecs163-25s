

    // Load data and draw chart
    d3.csv("Student Mental health.csv").then(data => {
      // Aggregate counts
      const years = ["Year 1", "Year 2", "Year 3", "Year 4"];
      const conditions = [
        {key: "Do you have Depression?", label: "Depression"},
        {key: "Do you have Anxiety?", label: "Anxiety"},
        {key: "Do you have Panic attack?", label: "Panic Attack"}
      ];

      // Prepare aggregation
      let yearConditionCounts = {};
      years.forEach(y => yearConditionCounts[y] = {"Depression": 0, "Anxiety": 0, "Panic Attack": 0});

      data.forEach(d => {
        const year = normalizeYear(d["Your current year of Study"]);
        if (!year) return;
        conditions.forEach(cond => {
          if (d[cond.key] && d[cond.key].trim().toLowerCase() === "yes") {
            yearConditionCounts[year][cond.label]++;
          }
        });
      });

      // Prepare data in D3-friendly format
      const chartData = years.map(year => ({
        year: year,
        ...yearConditionCounts[year]
      }));

      // For grouped bars, D3 likes "long" format
      const longData = [];
      chartData.forEach(row => {
        conditions.forEach(cond => {
          longData.push({
            year: row.year,
            condition: cond.label,
            value: row[cond.label]
          });
        });
      });

      // X0: years, X1: conditions within year
      const x0 = d3.scaleBand()
        .domain(years)
        .range([0, width])
        .paddingInner(0.2);

      const x1 = d3.scaleBand()
        .domain(conditions.map(d => d.label))
        .range([0, x0.bandwidth()])
        .padding(0.1);

      // Y: value
      const y = d3.scaleLinear()
        .domain([0, d3.max(longData, d => d.value) + 2]) // add some space
        .range([height, 0]);

      // X Axis
      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("font-size", "14px");

      // Y Axis
      svg.append("g")
        .call(d3.axisLeft(y).ticks(8))
        .selectAll("text")
        .attr("font-size", "14px");

      // Axis labels
      svg.append("text")
        .attr("class", "axis-label")
        .attr("x", width / 2)
        .attr("y", height + 45)
        .attr("text-anchor", "middle")
        .text("Academic Year");

      svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .text("Number of Students");

      // Title
      svg.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -25)
        .text("Prevalence of Mental Health Conditions by Academic Year");

      // Tooltip
      const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      // Bars
      svg.selectAll("g.year-group")
        .data(chartData)
        .join("g")
        .attr("class", "year-group")
        .attr("transform", d => `translate(${x0(d.year)},0)`)
        .selectAll("rect")
        .data(d => conditions.map(cond => ({
          condition: cond.label,
          value: d[cond.label],
          year: d.year
        })))
        .join("rect")
        .attr("class", "bar")
        .attr("x", d => x1(d.condition))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => conditionColors[d.condition])
        .on("mouseover", function(event, d) {
          d3.select(this).attr("opacity", 0.7);
          tooltip.transition().duration(100).style("opacity", 1);
          tooltip.html(`<strong>${d.condition}</strong><br>Year: ${d.year}<br>Count: ${d.value}`)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 30) + "px");
        })
        .on("mousemove", function(event) {
          tooltip.style("left", (event.pageX + 15) + "px")
                 .style("top", (event.pageY - 30) + "px");
        })
        .on("mouseout", function() {
          d3.select(this).attr("opacity", 1);
          tooltip.transition().duration(200).style("opacity", 0);
        });

      // Legend
      const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 130}, 5)`);

      conditions.forEach((cond, i) => {
        const g = legend.append("g")
          .attr("transform", `translate(0,${i * 26})`);
        g.append("rect")
          .attr("width", 22)
          .attr("height", 22)
          .attr("fill", conditionColors[cond.label]);
        g.append("text")
          .attr("x", 30)
          .attr("y", 16)
          .text(cond.label)
          .attr("font-size", "15px")
          .attr("fill", "#333");
      });
    });
 
    d3.csv("Student-Mental-health.csv").then(function(data) {
      // Normalize year and categorical fields
      data.forEach(d => {
        d.CGPA = +d.CGPA;
        d.Age = +d.Age;
        d.Gender = d.Gender.trim();
        d.Year = d["Your current year of Study"].replace(/year\s*/i, "Year ").trim();
        d.Depression = d["Do you have Depression?"].trim().toLowerCase();
        d.Anxiety = d["Do you have Anxiety?"].trim().toLowerCase();
        d.Panic = d["Do you have Panic attack?"].trim().toLowerCase();
      });
    
      // Define dimensions and their types
      const dimensions = [
        {
          name: "CGPA",
          scale: d3.scaleLinear()
            .domain(d3.extent(data, d => d.CGPA))
            .range([350, 20]),
          type: "number"
        },
        {
          name: "Age",
          scale: d3.scaleLinear()
            .domain(d3.extent(data, d => d.Age))
            .range([350, 20]),
          type: "number"
        },
        {
          name: "Gender",
          scale: d3.scalePoint()
            .domain([...new Set(data.map(d => d.Gender))])
            .range([350, 20]),
          type: "string"
        },
        {
          name: "Year",
          scale: d3.scalePoint()
            .domain(["Year 1", "Year 2", "Year 3", "Year 4"])
            .range([350, 20]),
          type: "string"
        },
        {
          name: "Depression",
          scale: d3.scalePoint()
            .domain(["yes", "no"])
            .range([350, 20]),
          type: "string"
        },
        {
          name: "Anxiety",
          scale: d3.scalePoint()
            .domain(["yes", "no"])
            .range([350, 20]),
          type: "string"
        },
        {
          name: "Panic",
          scale: d3.scalePoint()
            .domain(["yes", "no"])
            .range([350, 20]),
          type: "string"
        }
      ];
    
      // Set up SVG
      const svg = d3.select("#parallel-coords"),
            width = +svg.attr("width"),
            height = +svg.attr("height"),
            margin = {top: 40, right: 40, bottom: 10, left: 40};
    
      // X scale for axes
      const x = d3.scalePoint()
        .domain(dimensions.map(d => d.name))
        .range([margin.left, width - margin.right]);
    
      // Draw background lines (all students)
      svg.append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("d", d => d3.line()(dimensions.map(dim => [
          x(dim.name), dim.scale(d[dim.name])
        ])))
        .attr("stroke", "#bbb")
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .attr("opacity", 0.3);
    
      // Draw foreground lines (highlighted, e.g., by Depression)
      svg.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("d", d => d3.line()(dimensions.map(dim => [
          x(dim.name), dim.scale(d[dim.name])
        ])))
        .attr("stroke", d => d.Depression === "yes" ? "#d62728" : "#1f77b4")
        .attr("stroke-width", 1.5)
        .attr("fill", "none")
        .attr("opacity", 0.5);
    
      // Draw axes
      const axis = d3.axisLeft();
      svg.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", d => `translate(${x(d.name)})`)
        .each(function(d) {
          d3.select(this).call(axis.scale(d.scale));
        })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", 10)
        .attr("x", 0)
        .attr("dy", "-1.2em")
        .text(d => d.name)
        .style("font-size", "14px")
        .style("font-weight", "bold");
    
      // Title
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-weight", "bold")
        .text("Parallel Coordinates: Student Mental Health Dimensions");
    
      // Legend
      svg.append("rect").attr("x", width-210).attr("y", 40).attr("width", 16).attr("height", 16).attr("fill", "#d62728");
      svg.append("text").attr("x", width-190).attr("y", 53).text("Depression: Yes").style("font-size", "13px").attr("alignment-baseline","middle");
      svg.append("rect").attr("x", width-210).attr("y", 60).attr("width", 16).attr("height", 16).attr("fill", "#1f77b4");
      svg.append("text").attr("x", width-190).attr("y", 73).text("Depression: No").style("font-size", "13px").attr("alignment-baseline","middle");
    });
    const sankey = d3.sankey()
  .nodeWidth(20)
  .nodePadding(16)
  .extent([[1, 40], [sankeyWidth - 1, sankeyHeight - 1]])
  .nodeSort(null)
  .nodeAlign(d3.sankeyLeft); // This aligns nodes by their order in the flow
    
