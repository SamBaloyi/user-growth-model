import React from "react";
import ReactApexChart from "react-apexcharts";
import moment from "moment";
import { DatePicker, Space } from "antd";
import "antd/dist/antd.css";

const { RangePicker } = DatePicker;

class ApexChart extends React.Component {
  constructor(props) {
    super(props);
    this.growthList = [];
    this.state = {
      series: [
        {
          name: "Users",
          data: [],
        },
      ],
      options: {
        chart: {
          height: 350,
          type: "line",
          zoom: {
            enabled: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "straight",
        },
        title: {
          text: "User Growth Trends by Day",
          align: "centre",
          style: {
            fontSize: "32px",
          },
        },
        grid: {
          row: {
            colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
            opacity: 0.5,
          },
        },
        xaxis: {
          min: undefined,
          max: undefined,
          labels: {
            format: "dd MMM",
            formatter: function (val, timestamp) {
              return moment(new Date(timestamp)).format("DD MMM");
            },
          },
          type: "datetime",
        },
        yaxis: {
          max: undefined,
        },
        markers: {
          size: 4,
          colors: "red",
          strokeColors: "#fff",
          strokeWidth: 2,
          strokeOpacity: 0.9,
          strokeDashArray: 0,
          fillOpacity: 1,
          discrete: [],
          shape: "circle",
          radius: 2,
          offsetX: 0,
          offsetY: 0,
          onClick: undefined,
          onDblClick: undefined,
          showNullDataPoints: true,
          hover: {
            size: undefined,
            sizeOffset: 3,
          },
        },
      },
    };
    this.onChange = this.onChange.bind(this);
  }


  /**
   * Converts UK date format to US date format
   * @param {*} date 
   * @returns 
   */
  convertDateToUS(date) {
    date = date.split("-");
    [date[0], date[1]] = [date[1], date[0]];
    return date.join("-");
  }


  /**
   * Custom on change function provided by RangePicker
   * Updates the time range of user growth data
   * @param {*} dates 
   * @param {*} dateStrings 
   */
  onChange(dates, dateStrings) {
    console.log("From: ", dateStrings[0], ", to: ", dateStrings[1]);
    const minDate = new Date(dateStrings[0]).getTime();
    const maxDate = new Date(dateStrings[1]).getTime();
    this.setState((state) => ({
      options: {
        xaxis: { min: minDate, max: maxDate },
      },
    }));
    console.log("Updated data on graphy")
  }

  /**
   * Retrieves the start from the data pairs provided by the API
   * @returns start date
   */
  getStartDate() {
    const startDate = this.growthList[0]["x"];
    const start = moment(startDate, "MM-DD-YYYY");
    return start;
  }

  /**
   * Retrieves the end from the data pairs provided by the API
   * @returns end date
   */
  getEndDate() {
    const endDate = this.growthList[this.growthList.length - 1]["x"];
    const end = moment(endDate, "MM-DD-YYYY").add(1, "d");
    return end;
  }

  /**
   * lifecycle function that allows us to execute React code when the component is already placed in the DOM
   * fetches data from an external API
   * maps data in a local list
   * updates State so that chart can display received data
   */
  componentDidMount() {
    fetch(`https://elasticsnivelinghashmaps.dacod.repl.co/`)
      .then((res) => res.json())
      .then((json) => {
        console.log("Fetched data from API");
        for (const key in json) {
          let dayEntry = { x: this.convertDateToUS(key), y: json[key] };
          this.growthList.push(dayEntry);
        }
        this.setState((state) => ({
          series: [
            {
              data: this.growthList,
            },
          ],
        }));
        console.log("Plotted data to graph");
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }

  render() {
    return (
      <div id="chart">
        <ReactApexChart
          options={this.state.options}
          series={this.state.series}
          type="line"
          height={350}
        />
        <Space direction="vertical" size={24}>
          <RangePicker
            onChange={this.onChange}
            disabledDate={(current) => {
              // Can not select days that aren't available on data received
              return (
                current < this.getStartDate() || current > this.getEndDate()
              );
            }}
          />
        </Space>
      </div>
    );
  }
}

export default ApexChart;
