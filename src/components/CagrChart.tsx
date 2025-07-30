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
        100000, 85010, 66488, 81995, 89367, 94407, 105865, 112624, 68289, 84333,
        96581, 94850, 113459, 141999, 161389, 162567, 178558, 212025, 198049,
        258305, 299013, 378541, 304208, 376534, 466704,
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

  const tableData = [
    ["2000", "0.00%", "100,000", "0.00%", "100,000"],
    ["2001", "-14.99%", "85,010", "0.00%", "100,000"],
    ["2002", "-21.78%", "66,488", "0.00%", "100,000"],
    ["2003", "23.31%", "81,995", "10.50%", "110,500"],
    ["2004", "8.99%", "89,367", "9.00%", "120,445"],
    ["2005", "5.63%", "94,407", "5.63%", "127,272"],
    ["2006", "12.16%", "105,865", "10.50%", "140,602"],
    ["2007", "6.36%", "112,624", "6.11%", "149,194"],
    ["2008", "-39.37%", "68,289", "0.00%", "149,194"],
    ["2009", "23.45%", "84,333", "10.50%", "174,395"],
    ["2010", "14.52%", "96,581", "11.00%", "193,627"],
    ["2011", "-1.79%", "94,850", "0.00%", "193,627"],
    ["2012", "19.63%", "113,459", "12.60%", "218,099"],
    ["2013", "25.16%", "141,999", "10.50%", "241,005"],
    ["2014", "13.65%", "161,389", "10.50%", "266,260"],
    ["2015", "0.73%", "162,567", "0.00%", "266,260"],
    ["2016", "9.84%", "178,558", "10.50%", "294,418"],
    ["2017", "18.74%", "212,025", "10.50%", "349,756"],
    ["2018", "-6.59%", "198,049", "0.00%", "349,756"],
    ["2019", "30.43%", "258,305", "10.50%", "416,009"],
    ["2020", "15.76%", "299,013", "7.52%", "447,609"],
    ["2021", "26.60%", "378,541", "16.53%", "521,194"],
    ["2022", "-19.64%", "304,208", "0.00%", "521,194"],
    ["2023", "23.79%", "376,534", "5.16%", "548,159"],
    ["2024", "23.95%", "466,704", "8.06%", "592,321"],
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
