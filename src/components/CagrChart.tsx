import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Chart as ChartJS,
  ChartOptions,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const data = {
  labels: [
    "2000",
    "2001",
    "2002",
    "2003",
    "2004",
    "2005",
    "2006",
    "2007",
    "2008",
    "2009",
    "2010",
    "2011",
    "2012",
    "2013",
    "2014",
    "2015",
    "2016",
    "2017",
    "2018",
    "2019",
    "2020",
    "2021",
    "2022",
    "2023",
    "2024",
  ],
  datasets: [
    {
      label: "S&P 500",
      data: [
        100000, 94510, 73956.82, 91194.94, 99394.98, 104989.09, 117762.06,
        125250.65, 75930.54, 93737.71, 107349.31, 105427.95, 126127.98,
        157865.65, 179413.12, 180722.65, 198502.49, 235694.92, 220162.53,
        287112.86, 332336.27, 420696.28, 338139.47, 418546.98, 518803.29,
      ],
      borderColor: "#c0392b",
      backgroundColor: "rgba(192, 57, 43, 0.2)",
      fill: true,
    },
    {
      label: "Tax Free Plan",
      data: [
        100000, 100000, 100000, 110500, 120445, 127272, 140602, 149194, 149194,
        174395, 193627, 193627, 218099, 241005, 266260, 266260, 294418, 349756,
        349756, 416009, 447609, 521194, 521194, 548159, 592321,
      ],
      borderColor: "#27ae60",
      backgroundColor: "rgba(39, 174, 96, 0.2)",
      fill: true,
    },
  ],
};

const options: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "S&P Average vs Tax Free Plan",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Value ($)",
      },
    },
    x: {
      title: {
        display: true,
        text: "Year",
      },
    },
  },
};

export default function CagrChart() {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);

  const handleRowClick = (year: string) => {
    setSelectedYear(selectedYear === year ? null : year);
  };

  const handleColClick = (col: number) => {
    setSelectedColumn(selectedColumn === col ? null : col);
  };

  /*
  const tableData = [
    ["2000", "-5.49%", "100,000", "0.00%", "100,000"],
    ["2001", "-14.99%", "94,510", "0.00%", "100,000"],
    ["2002", "-21.78%", "73,957", "0.00%", "100,000"],
    ["2003", "23.31%", "91,195", "10.50%", "110,500"],
    ["2004", "8.99%", "99,395", "9.00%", "120,445"],
    ["2005", "5.63%", "104,989", "5.63%", "127,272"],
    ["2006", "12.16%", "117,762", "10.50%", "140,602"],
    ["2007", "6.36%", "125,251", "6.11%", "149,194"],
    ["2008", "-39.37%", "75,931", "0.00%", "149,194"],
    ["2009", "23.45%", "93,738", "10.50%", "174,395"],
    ["2010", "14.52%", "107,349", "11.00%", "193,627"],
    ["2011", "-1.79%", "105,428", "0.00%", "193,627"],
    ["2012", "19.63%", "126,128", "12.60%", "218,099"],
    ["2013", "25.16%", "157,866", "10.50%", "241,005"],
    ["2014", "13.65%", "179,413", "10.50%", "266,260"],
    ["2015", "0.73%", "180,723", "0.00%", "266,260"],
    ["2016", "9.84%", "198,502", "10.50%", "294,418"],
    ["2017", "18.74%", "235,695", "10.50%", "349,756"],
    ["2018", "-6.59%", "220,163", "0.00%", "349,756"],
    ["2019", "30.43%", "287,113", "10.50%", "416,009"],
    ["2020", "15.76%", "332,336", "7.52%", "447,609"],
    ["2021", "26.60%", "420,696", "16.53%", "521,194"],
    ["2022", "-19.64%", "338,139", "0.00%", "521,194"],
    ["2023", "23.79%", "418,547", "5.16%", "548,159"],
    ["2024", "23.95%", "518,803", "8.06%", "592,321"],
  ];
  */

  const tableData = [
    ["2000", "-5.49%", "94,510", "0.00%", "100,000"],
    ["2001", "-14.99%", "80,342.95", "0.00%", "100,000"],
    ["2002", "-21.78%", "62,844.26", "0.00%", "100,000"],
    ["2003", "23.31%", "77,493.26", "10.50%", "110,500"],
    ["2004", "8.99%", "84,459.90", "9.00%", "120,445"],
    ["2005", "5.63%", "89,214.99", "5.63%", "127,226.05"],
    ["2006", "12.16%", "100,063.53", "10.50%", "140,584.79"],
    ["2007", "6.36%", "106,427.57", "6.11%", "149,174.52"],
    ["2008", "-39.37%", "64,527.04", "0.00%", "149,174.52"],
    ["2009", "23.45%", "79,658.63", "10.50%", "164,837.84"],
    ["2010", "14.52%", "91,225.06", "11.00%", "182,970.01"],
    ["2011", "-1.79%", "89,592.13", "0.00%", "182,970.01"],
    ["2012", "19.63%", "107,179.07", "12.60%", "206,024.23"],
    ["2013", "25.16%", "134,145.32", "10.50%", "227,656.77"],
    ["2014", "13.65%", "152,456.16", "10.50%", "251,560.73"],
    ["2015", "0.73%", "153,569.09", "0.00%", "251,560.73"],
    ["2016", "9.84%", "168,680.29", "10.50%", "277,974.61"],
    ["2017", "18.74%", "200,290.98", "10.50%", "307,161.94"],
    ["2018", "-6.59%", "187,091.80", "0.00%", "307,161.94"],
    ["2019", "30.43%", "244,023.83", "10.50%", "339,413.95"],
    ["2020", "15.76%", "282,481.99", "7.52%", "364,937.88"],
    ["2021", "26.60%", "357,622.20", "16.53%", "425,262.11"],
    ["2022", "-19.64%", "287,385.20", "0.00%", "425,262.11"],
    ["2023", "23.79%", "355,754.14", "5.16%", "447,205.63"],
    ["2024", "23.95%", "440,957.26", "8.06%", "483,250.41"],
  ];

  const calculateCAGR = (initial: number, final: number, periods: number) => {
    return ((final / initial) ** (1 / periods) - 1) * 100;
  };

  const spFinal = data.datasets[0].data[
    data.datasets[0].data.length - 1
  ] as number;
  const tfpFinal = data.datasets[1].data[
    data.datasets[1].data.length - 1
  ] as number;
  const periods = data.labels.length - 1;
  const spCagr = calculateCAGR(100000, spFinal, periods).toFixed(2);
  const tfpCagr = calculateCAGR(100000, tfpFinal, periods).toFixed(2);

  const tableHeaders = [
    "Year",
    "S&P Return",
    "S&P Value",
    "TFP Return",
    "TFP Value",
  ];

  return (
    <div className="w-full p-0">
      <CardHeader>
        <CardTitle>S&P Average vs Tax Free Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 w-full">
          <div className="flex flex-col justify-around w-1/2">
            <div className="w-full h-[380px] relative">
              <Line data={data} options={options} className="w-full h-full" />
            </div>
            <div className="mt-2 w-full border border-gray-300 p-4 rounded">
              <table className="w-full text-sm table-auto border-collapse">
                <thead>
                  <tr className="text-center border-b">
                    <th className="p-2"></th>
                    <th className="p-2">S&P Taxable</th>
                    <th className="p-2">Tax Free Plan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 font-bold">CAGR</td>
                    <td className="p-2">{spCagr}%</td>
                    <td className="p-2">{tfpCagr}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="w-1/2">
            <div className="border border-gray-300 p-4 rounded h-[600px] overflow-y-scroll">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {tableHeaders.map((header, i) => (
                      <th
                        key={i}
                        onClick={() => handleColClick(i)}
                        className={`p-2 cursor-pointer ${
                          selectedColumn === i
                            ? "border-2 border-amber-400"
                            : ""
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, i) => (
                    <tr
                      key={i}
                      onClick={() => handleRowClick(row[0])}
                      className={`cursor-pointer ${
                        selectedYear === row[0]
                          ? "bg-amber-400 dark:bg-amber-400 text-black dark:text-black"
                          : ""
                      }`}
                    >
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={`p-2 ${j > 1 ? "text-right" : ""} ${
                            (j === 1 && cell.includes("-")) ||
                            (j === 0 && row[1].includes("-"))
                              ? "text-red-600"
                              : ""
                          } ${
                            selectedColumn === j
                              ? "border-2 border-amber-400"
                              : ""
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </div>
  );
}
