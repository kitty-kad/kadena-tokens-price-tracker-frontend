import { useMemo, useRef } from "react";
import Chart from "react-apexcharts";

const CHART_WIDTH = Math.min(500, window.screen.width-50);
const CHART_HEIGHT = CHART_WIDTH / 500 * 300;

export const PriceGraph = ({data, currPrice, kdaToUsd, showInKda}) => {
    const series = useMemo( () => {
        const vals = [];
        for(let i = 0; i <data.length; i++){
            const price = showInKda ? data[i].price_in_kda:  data[i].price_in_usd ;
            vals.push([parseInt(data[i].unix_time) * 1000, price]);
        }
        // Add latest curr price entry
        if (currPrice != null && kdaToUsd != null) {
          vals.push([Date.now(), currPrice * (showInKda ? 1 : kdaToUsd)]);
        }
        return [{
            name: 'Price in USD',
            data: vals
        }];
    }, [data, currPrice, kdaToUsd, showInKda]);
    const chartRef = useRef(null);
    let options = getGraphOptions();
    useMemo( () => {
      const chart = chartRef?.current?.chart;
      if(chart == null) {
        return;
        // return getGraphOptions(false);
      }

      chart.updateOptions({yaxis: getYOptions(showInKda)});
    }, [showInKda]);

      return (
        <div>
          <div className="row">
            <div className="mixed-chart">
              <Chart
                ref={chartRef}
                options={options}
                series={series}
                type="area"
                width={CHART_WIDTH}
              />
            </div>
          </div>
        </div>
      );
}

const showIcons = window.screen.width > 500;

function getYOptions (showInKda) {
  return {
    labels: {
      offsetX: -10,
      formatter: function (val) {
          return `${showInKda === true? '': '$'}${val.toFixed(showInKda === true? 3: 2)}`;
      }
    },
    tooltip: {
      enabled: true,
    }
  }
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
        fill : "FFFFFF",
      }
    },
    colors: ['#00E396', '#FFFFFF'],
    stroke: {
      curve: "smooth",
      width: 3
    },
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 0,
      strokeColor: "#ffffff",
      strokeWidth: 3,
      strokeOpacity: 1,
      fillOpacity: 1,
      hover: {
        size: 6
      }
    },
    xaxis: {
      type: "datetime",
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: getYOptions(),
    grid: {
      padding: {
        left: -5,
        right: 5
      }
    },
    tooltip: {
      x: {
        format: "dd MMM yyyy HH:mm"
      },
    },
    legend: {
      position: 'top',
      horizontalAlign: 'left'
    },
    zoom: {
        type: 'x',
        enabled: true,
        autoScaleYaxis: true
      },
    fill: {
      type: "solid",
      fillOpacity: 0.7
    }
  }
}