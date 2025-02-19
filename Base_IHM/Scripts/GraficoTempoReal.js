let chartData = {
  temperatura: {
    intervalo: 60, // segundos
    label: "Temperatura",
    color: "blue",
    hysteresisColor: "#71B48D33",
    setpointColor: "#71B48D",
    data: [],
    currentValue: 0,
    currentSetpoint: 0,
    currentHysteresis: 0,
    unit: "°C",
  },
  pressao1: {
    intervalo: 60, // segundos
    label: "Pressão1",
    color: "red",
    hysteresisColor: "#00000000",
    setpointColor: "#71B48D",
    data: [],
    currentValue: 0,
    currentSetpoint: 0,
    currentHysteresis: 0,
    unit: "bar",
  },
  pressao2: {
    intervalo: 60, // segundos
    label: "Pressão2",
    color: "red",
    hysteresisColor: "#00000000",
    setpointColor: "#71B48D",
    data: [],
    currentValue: 0,
    currentSetpoint: 0,
    currentHysteresis: 0,
    unit: "bar",
  },
};

setTimeout(() => {
  var temperaturaSymbol = new TcHmi.Symbol(
    "%s%PLC1.GVL_Automatico.Higienizacao.rTemperaturaTanque%/s%"
  );
  temperaturaSymbol.watch(function (data) {
    // console.log(data);
    if (data.error === TcHmi.Errors.NONE) {
      chartData.temperatura.currentValue = data.value;
    } else {
      // Handle error...
    }
  });
  var setpointTemperaturaSymbol = new TcHmi.Symbol(
    "%s%PLC1.GVL_Automatico.Higienizacao.rTemperaturaSetPoint%/s%"
  );
  setpointTemperaturaSymbol.watch(function (data) {
    // console.log(data);
    if (data.error === TcHmi.Errors.NONE) {
      chartData.temperatura.currentSetpoint = data.value;
    } else {
      // Handle error...
    }
  });
  var histereseTemperaturaSymbol = new TcHmi.Symbol(
    "%s%PLC1.GVL_Automatico.Higienizacao.rTemperaturaHisterese%/s%"
  );
  histereseTemperaturaSymbol.watch(function (data) {
    // console.log(data);
    if (data.error === TcHmi.Errors.NONE) {
      chartData.temperatura.currentHysteresis = data.value;
    } else {
      // Handle error...
    }
  });

  // ------------------------------------------

  var pressao1Symbol = new TcHmi.Symbol(
    "%s%PLC1.GVL_Automatico.Higienizacao.rPressaoSaidaGrupo1%/s%"
  );
  pressao1Symbol.watch(function (data) {
    // console.log(data);
    if (data.error === TcHmi.Errors.NONE) {
      chartData.pressao1.currentValue = data.value;
    } else {
      // Handle error...
    }
  });
  var setpointPressao1Symbol = new TcHmi.Symbol(
    "%s%PLC1.GVL_Automatico.Higienizacao.rPressaoSetPointGrupo1%/s%"
  );
  setpointPressao1Symbol.watch(function (data) {
    // console.log(data);
    if (data.error === TcHmi.Errors.NONE) {
      chartData.pressao1.currentSetpoint = data.value;
    } else {
      // Handle error...
    }
  });
  var pressao2Symbol = new TcHmi.Symbol(
    "%s%PLC1.GVL_Automatico.Higienizacao.rPressaoSaidaGrupo2%/s%"
  );
  pressao2Symbol.watch(function (data) {
    // console.log(data);
    if (data.error === TcHmi.Errors.NONE) {
      chartData.pressao2.currentValue = data.value;
    } else {
      // Handle error...
    }
  });
  var setpointPressao2Symbol = new TcHmi.Symbol(
    "%s%PLC1.GVL_Automatico.Higienizacao.rPressaoSetPointGrupo2%/s%"
  );
  setpointPressao2Symbol.watch(function (data) {
    // console.log(data);
    if (data.error === TcHmi.Errors.NONE) {
      chartData.pressao2.currentSetpoint = data.value;
    } else {
      // Handle error...
    }
  });

  function updateData() {
    const now = new Date();
    Object.keys(chartData).forEach((key) => {
      chartData[key].data.push({
        time: now,
        value: chartData[key].currentValue,
        setpoint: chartData[key].currentSetpoint,
        hysteresis: chartData[key].currentHysteresis,
      });

      // Keep only the last 10 minutes of data
      chartData[key].data = chartData[key].data.filter(
        (d) => d.time > new Date(Date.now() - chartData[key].intervalo * 1050)
      );

      // console.log(chartData);
    });
  }
  setInterval(() => {
    updateData();
  }, 100);
}, 5000);

function createRealtimeChart(svgId, variable) {
  // console.log("createRealtimeChart", svgId, variable);

  const svg = d3.select(`#${svgId}`);

  const wrapper = document.querySelector(`#${svgId}`);
  const { width, height } = wrapper.getBoundingClientRect();

  const margin = { top: 15, right: 10, bottom: 10, left: 60 };

  const domainLengthSeconds = chartData[variable].intervalo;
    
  svg.attr("aspect-ratio", "none");
  svg.attr("preserveAspectRatio", "none");

  // Clip path to prevent lines from overlapping axes
  svg
    .append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x", margin.left)
    .attr("y", margin.top)
    .attr("width", width - margin.left - margin.right)
    .attr("height", height - margin.top - margin.bottom);

  const xScale = d3
    .scaleTime()
    .domain([
      new Date(Date.now() - domainLengthSeconds * 1000),
      new Date(Date.now() - 100),
    ])
    .range([margin.left, width - margin.right]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([height - margin.bottom, margin.top]);

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%H:%M:%S"));
  const yAxis = d3
    .axisLeft(yScale)
    .ticks(5)
    .tickFormat((d) => `${d} ${chartData[variable]?.unit || ""}`);

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .attr("class", "x-axis")
    .call(xAxis);

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .attr("class", "y-axis")
    .call(yAxis);

  const chartGroup = svg
    .append("g")
    .attr("class", "chart-area")
    .attr("clip-path", "url(#clip)");

  function updateChart() {
    const now = new Date();
    xScale.domain([
      new Date(Date.now() - domainLengthSeconds * 1000),
      new Date(Date.now() - 100),
    ]);
    svg.select(".x-axis").call(xAxis);

    const minValue =
      d3.min(chartData[variable].data, (d) =>
        Math.min(
          d.value,
          d.setpoint !== undefined && d.hysteresis !== undefined
            ? d.setpoint - d.hysteresis
            : d.value
        )
      ) || 0;

    const maxValue = d3.max(chartData[variable].data, (d) =>
      Math.max(
        d.value,
        d.setpoint !== undefined && d.hysteresis !== undefined
          ? d.setpoint + d.hysteresis
          : d.value
      )
    );

    yScale.domain([minValue - 1, maxValue + 1]).nice();
    svg.select(".y-axis").call(yAxis);

    // Line generator
    const lineGen = d3
      .line()
      .x((d) => xScale(d.time))
      .y((d) => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Area generator for hysteresis
    const areaGen = d3
      .area()
      .x((d) => xScale(d.time))
      .y0((d) => yScale(d.setpoint - d.hysteresis))
      .y1((d) => yScale(d.setpoint + d.hysteresis))
      .curve(d3.curveMonotoneX);

    // Temperature line update
    const tempLine = chartGroup
      .selectAll(".line")
      .data([chartData[variable].data]);

    tempLine
      .enter()
      .append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke-width", "2px")
      .merge(tempLine)
      .attr("stroke", chartData[variable].color)
      .attr("d", lineGen);

    tempLine.exit().remove();

    // Setpoint dashed line (only if there is data)
    if (chartData[variable].data.some((d) => d.setpoint !== undefined)) {
      // Setpoint Line generator
      const setpointLineGen = d3
        .line()
        .x((d) => xScale(d.time))
        .y((d) => yScale(d.setpoint))
        .curve(d3.curveMonotoneX);

      const setpointLine = chartGroup
        .selectAll(".setpoint-line")
        .data([chartData[variable].data]);

      setpointLine
        .enter()
        .append("path")
        .attr("class", "setpoint-line")
        .attr("fill", "none")
        .attr("stroke-width", "2px")
        .attr("opacity", 0.5)
        .merge(setpointLine)
        .attr("stroke", chartData[variable].setpointColor)
        //   .attr("stroke-dasharray", "5,5")
        .attr("d", setpointLineGen);

      setpointLine.exit().remove();
    }

    // Hysteresis area (only if there is data)
    if (
      chartData[variable].data.some((d) => d.hysteresis !== undefined) &&
      chartData[variable].data.some((d) => d.setpoint !== undefined)
    ) {
      const hysteresisArea = chartGroup
        .selectAll(".hysteresis-area")
        .data([chartData[variable].data]);

      hysteresisArea
        .enter()
        .append("path")
        .attr("class", "hysteresis-area")
        .merge(hysteresisArea)
        .attr("fill", chartData[variable].hysteresisColor)
        .attr("opacity", 1)
        .attr("d", areaGen);

      hysteresisArea.exit().remove();
    }

    requestAnimationFrame(updateChart);
  }

  requestAnimationFrame(updateChart);
}
