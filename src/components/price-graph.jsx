import { useMemo, useRef } from "react";
import Chart from "react-apexcharts";

const CHART_WIDTH = Math.min(500, window.screen.width - 50);
const CHART_HEIGHT = (CHART_WIDTH / 500) * 300;

export const PriceGraph = ({
  data,
  currPrice,
  kdaToUsd,
  showInKda,
  dataCandle,
  showCandle,
}) => {
  const { series, max, exponent, multiplier } = useMemo(() => {
    let max = 0;
    const vals = [];
    for (let i = 0; i < data.length; i++) {
      const price = showInKda ? data[i].price_in_kda : data[i].price_in_usd;
      max = Math.max(max, price);
      vals.push([parseInt(data[i].unix_time) * 1000, price]);
    }
    // Add latest curr price entry
    if (currPrice != null && kdaToUsd != null) {
      vals.push([Date.now(), currPrice * (showInKda ? 1 : kdaToUsd)]);
    }

    const { exponent, multiplier } = getExponentAndMultiplier(max);
    if (exponent !== null) {
      for (let i = 0; i < vals.length; i++) {
        vals[i][1] = vals[i][1] * multiplier;
      }
    }

    return {
      series: [
        {
          name: `Price in ${showInKda ? "KDA" : "USD"}`,
          data: vals,
        },
      ],
      max,
      exponent,
      multiplier,
    };
  }, [data, currPrice, kdaToUsd, showInKda]);

  const candleSeries = useMemo(() => {
    const vals = [];

    dataCandle.forEach((candleData) => {
      let priceArr;
      if (showInKda) {
        priceArr = [
          candleData.price_in_kda_start,
          candleData.price_in_kda_high,
          candleData.price_in_kda_low,
          candleData.price_in_kda_end,
        ];
      } else {
        priceArr = [
          candleData.price_in_usd_start,
          candleData.price_in_usd_high,
          candleData.price_in_usd_low,
          candleData.price_in_usd_end,
        ];
      }

      if (multiplier !== null) {
        for (let i = 0; i < priceArr.length; i++) {
          priceArr[i] = priceArr[i] * multiplier;
        }
      }
      vals.push({
        x: new Date(candleData.unix_time * 1000),
        y: priceArr,
      });
    });
    return [{ data: vals }];
  }, [dataCandle, showInKda, multiplier]);

  const chartRef = useRef(null);
  const candeChartRef = useRef(null);

  let options = getGraphOptions(showInKda);

  useMemo(() => {
    const chart = chartRef?.current?.chart;
    const candleChart = candeChartRef?.current?.chart;
    chart?.updateOptions({ yaxis: getYOptions(exponent) });
    candleChart?.updateOptions({ yaxis: getYOptions(exponent) });
    // showCandle and showinKda is passed in to force a refresh when switching graphs
  }, [showInKda, showCandle, exponent]);

  return (
    <div>
      <div className="row">
        {showCandle !== true && (
          <div className="mixed-chart">
            <Chart
              ref={chartRef}
              options={options}
              series={series}
              type="area"
              width={CHART_WIDTH}
            />
          </div>
        )}
        {showCandle === true && (
          <div id="candle-chart">
            <Chart
              ref={candeChartRef}
              options={options}
              series={candleSeries}
              type="candlestick"
              width={CHART_WIDTH}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const showIcons = window.screen.width > 500;

function valueFormatter(val, exponent) {
  return `${val.toPrecision(3)}${exponent == null ? "" : `e-${exponent}`}`;
}

function getYOptions(exponent) {
  return {
    labels: {
      offsetX: -10,
      formatter: (val) => valueFormatter(val, exponent),
    },
    tooltip: {
      enabled: true,
    },
    tickAmount: 5,
    max: (max) => max,
  };
}
function getGraphOptions() {
  return {
    chart: {
      type: "area",
      height: CHART_HEIGHT,
      foreColor: "#FFFFFF",
      stacked: true,
      toolbar: {
        tools: {
          pan: showIcons,
          zoom: showIcons,
          download: false,
          reset: false,
        },
        fill: "FFFFFF",
      },
    },
    colors: ["#00E396", "#FFFFFF"],
    stroke: {
      curve: "smooth",
      width: 3,
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 0,
      strokeColor: "#ffffff",
      strokeWidth: 3,
      strokeOpacity: 1,
      fillOpacity: 1,
      hover: {
        size: 6,
      },
    },
    xaxis: {
      type: "datetime",
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: getYOptions(),
    grid: {
      padding: {
        left: -5,
        right: 5,
      },
    },
    tooltip: {
      x: {
        format: "dd MMM yyyy HH:mm",
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
    },
    zoom: {
      type: "x",
      enabled: true,
      autoScaleYaxis: true,
    },
    fill: {
      type: "solid",
      fillOpacity: 0.7,
    },
  };
}

function getExponentAndMultiplier(x) {
  let exponent = null;
  let multiplier = null;
  const zeroes = zeroesAfterPoint(x);
  if (zeroes > 4) {
    exponent = zeroes + 1;
    multiplier = 10 ** exponent;
  }
  return { exponent, multiplier };
}
function zeroesAfterPoint(x) {
  if (x % 1 === 0) {
    return 0;
  } else {
    return -1 - Math.floor(Math.log10(x % 1));
  }
}
