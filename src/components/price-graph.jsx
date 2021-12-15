import { useMemo } from "react";
import Chart from "react-apexcharts";

export const PriceGraph = ({data}) => {
    const series = useMemo( () => {
        const vals = [];
        for(let i = 0; i <data.length; i++){
            vals.push([parseInt(data[i].unix_time) * 1000, data[i].price_in_usd]);
        }
        return [{
            name: 'Price in USD',
            data: vals
        }];
    }, [data]);

      return (
        <div>
          <div className="row">
            <div className="mixed-chart">
              <Chart
                options={GRAPH_OPTIONS}
                series={series}
                type="area"
                width={Math.min(500, window.screen.width-50)}
              />
            </div>
          </div>
        </div>
      );
}

const GRAPH_OPTIONS = {
    chart: {
      type: "area",
      height: 300,
      foreColor: "#FFFFFF",
      stacked: true,
      dropShadow: {
        enabled: true,
        enabledSeries: [0],
        top: -2,
        left: 2,
        blur: 5,
        opacity: 0.06
      },
      toolbar: {
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
    yaxis: {
      labels: {
        offsetX: -10,
        formatter: function (val) {
            return `$${val.toFixed(2)}`;
        }
      },
      tooltip: {
        enabled: true,
      }
    },
    grid: {
      padding: {
        left: -5,
        right: 5
      }
    },
    tooltip: {
      x: {
        format: "dd MMM yyyy"
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
  };