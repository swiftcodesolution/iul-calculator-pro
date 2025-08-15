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
        100000, // 2000 (initial value, matches table)
        94510, // 2001
        80342.95, // 2002
        77493.26, // 2003
        84459.9, // 2004
        89214.99, // 2005
        100063.53, // 2006
        106427.57, // 2007
        64527.04, // 2008
        79658.63, // 2009
        91225.06, // 2010
        89592.13, // 2011
        107179.07, // 2012
        134145.32, // 2013
        152456.16, // 2014
        153569.09, // 2015
        168680.29, // 2016
        200290.98, // 2017
        187091.8, // 2018
        244023.83, // 2019
        282481.99, // 2020
        357622.2, // 2021
        287385.2, // 2022
        355754.14, // 2023
        440957.26, // 2024
      ],
      borderColor: "#c0392b",
      backgroundColor: "rgba(192, 57, 43, 0.2)",
      fill: true,
    },
    {
      label: "Tax Free Plan",
      data: [
        100000, // 2000 (initial value, matches table)
        100000, // 2001
        100000, // 2002
        110500, // 2003
        120445, // 2004
        127226.05, // 2005
        140584.79, // 2006
        149174.52, // 2007
        149174.52, // 2008
        164837.84, // 2009
        182970.01, // 2010
        182970.01, // 2011
        206024.23, // 2012
        227656.77, // 2013
        251560.73, // 2014
        251560.73, // 2015
        277974.61, // 2016
        307161.94, // 2017
        307161.94, // 2018
        339413.95, // 2019
        364937.88, // 2020
        425262.11, // 2021
        425262.11, // 2022
        447205.63, // 2023
        483250.41, // 2024
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
