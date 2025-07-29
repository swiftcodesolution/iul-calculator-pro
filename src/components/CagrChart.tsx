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
        90890, 80001, 62185, 80045, 88705, 92954, 107585, 113460, 71230, 90540,
        104004, 106157, 120157, 155716, 173717, 172535, 189458, 225008, 210222,
        274167, 317318, 401923, 322948, 399814, 495649,
      ],
      borderColor: "#c0392b",
      backgroundColor: "rgba(192, 57, 43, 0.2)",
      fill: true,
    },
    {
      label: "Tax Free Plan",
      data: [
        100000, 100000, 100000, 117000, 127530, 131356, 149220, 154443, 154443,
        180698, 203828, 203828, 230834, 265961, 273407, 273407, 302276, 359050,
        359050, 427584, 459896, 535697, 535697, 563288, 608337,
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
    ["2000", "-10.14%", "90,890", "0.00%", "100,000"],
    ["2001", "-13.04%", "80,001", "0.00%", "100,000"],
    ["2002", "-23.37%", "62,185", "0.00%", "100,000"],
    ["2003", "26.38%", "80,045", "0.00%", "117,000"],
    ["2004", "8.99%", "88,705", "0.00%", "127,530"],
    ["2005", "3.00%", "92,954", "0.00%", "131,356"],
    ["2006", "13.62%", "107,585", "9.56%", "149,220"],
    ["2007", "3.55%", "113,460", "5.45%", "154,443"],
    ["2008", "-38.47%", "71,230", "10.85%", "154,443"],
    ["2009", "23.49%", "90,540", "7.79%", "180,698"],
    ["2010", "12.64%", "104,004", "20.93%", "203,828"],
    ["2011", "0.00%", "106,157", "7.11%", "203,828"],
    ["2012", "13.29%", "120,157", "12.60%", "230,834"],
    ["2013", "29.60%", "155,716", "14.34%", "265,961"],
    ["2014", "11.54%", "173,717", "2.83%", "273,407"],
    ["2015", "-0.73%", "172,535", "0.00%", "273,407"],
    ["2016", "9.84%", "189,458", "10.64%", "302,276"],
    ["2017", "18.74%", "225,008", "26.75%", "359,050"],
    ["2018", "-6.59%", "210,222", "0.00%", "359,050"],
    ["2019", "30.43%", "274,167", "19.15%", "427,584"],
    ["2020", "15.76%", "317,318", "7.52%", "459,896"],
    ["2021", "26.60%", "401,923", "16.53%", "535,697"],
    ["2022", "-19.64%", "322,948", "0.00%", "535,697"],
    ["2023", "23.79%", "399,814", "5.16%", "563,288"],
    ["2024", "23.95%", "495,649", "8.06%", "608,337"],
  ];
  */

  const tableHeaders = [
    "Year",
    "S&P Return",
    "S&P Value",
    "TFP Return",
    "TFP Value",
  ];

  /*
  const tableData = [
    ["2000", "-15.09%", "84,910", "0.00%", "100,000"],
    ["2001", "-17.74%", "69,837", "0.00%", "100,000"],
    ["2002", "-23.70%", "53,286", "0.00%", "100,000"],
    ["2003", "27.05%", "67,695", "20.29%", "120,290"],
    ["2004", "9.19%", "73,912", "6.89%", "128,578"],
    ["2005", "1.37%", "74,924", "1.03%", "129,902"],
    ["2006", "10.11%", "82,498", "7.58%", "139,749"],
    ["2007", "-0.08%", "82,432", "0.00%", "139,749"],
    ["2008", "-39.29%", "50,044", "0.00%", "139,749"],
    ["2009", "25.52%", "62,815", "19.14%", "166,496"],
    ["2010", "14.67%", "72,030", "11.00%", "184,811"],
    ["2011", "1.73%", "73,276", "1.30%", "187,213"],
    ["2012", "15.43%", "84,576", "11.57%", "208,862"],
    ["2013", "31.50%", "111,217", "23.62%", "258,200"],
    ["2014", "13.19%", "125,885", "9.89%", "283,743"],
    ["2015", "0.86%", "126,967", "0.64%", "285,559"],
    ["2016", "11.47%", "141,537", "8.60%", "310,117"],
    ["2017", "19.88%", "169,674", "14.91%", "356,338"],
    ["2018", "-6.59%", "158,492", "0.00%", "356,338"],
    ["2019", "30.43%", "206,716", "19.15%", "424,561"],
    ["2020", "15.76%", "239,294", "7.52%", "456,484"],
    ["2021", "26.60%", "302,966", "16.53%", "531,938"],
    ["2022", "-19.64%", "243,471", "0.00%", "531,938"],
    ["2023", "23.79%", "301,406", "5.16%", "559,380"],
    ["2024", "23.95%", "373,585", "8.06%", "604,451"],
  ];
  */

  const tableData = [
    ["1995", "35.49%", "135,490", "10.50%", "110,500"],
    ["1996", "20.88%", "163,774", "10.50%", "122,103"],
    ["1997", "28.10%", "209,779", "10.50%", "134,923"],
    ["1998", "23.52%", "259,119", "10.50%", "149,090"],
    ["1999", "20.24%", "311,574", "10.50%", "164,744"],
    ["2000", "-5.44%", "294,625", "0.00%", "164,744"],
    ["2001", "-14.99%", "250,465", "0.00%", "164,744"],
    ["2002", "-22.10%", "195,312", "0.00%", "164,744"],
    ["2003", "23.18%", "240,599", "10.50%", "182,042"],
    ["2004", "9.00%", "262,253", "9.00%", "198,426"],
    ["2005", "5.63%", "277,013", "5.63%", "209,595"],
    ["2006", "12.16%", "310,696", "10.50%", "231,602"],
    ["2007", "6.11%", "329,669", "6.11%", "245,753"],
    ["2008", "-39.37%", "199,898", "0.00%", "245,753"],
    ["2009", "23.45%", "246,783", "10.50%", "271,557"],
    ["2010", "13.39%", "279,814", "10.50%", "300,070"],
    ["2011", "-2.18%", "273,717", "0.00%", "300,070"],
    ["2012", "18.75%", "325,029", "10.50%", "331,577"],
    ["2013", "25.33%", "407,324", "10.50%", "366,393"],
    ["2014", "13.91%", "463,989", "10.50%", "404,864"],
    ["2015", "0.94%", "468,350", "0.94%", "408,669"],
    ["2016", "10.78%", "518,823", "10.50%", "451,579"],
    ["2017", "17.24%", "608,273", "10.50%", "498,985"],
    ["2018", "-6.24%", "570,297", "0.00%", "498,985"],
    ["2019", "29.91%", "740,805", "10.50%", "551,378"],
    ["2020", "16.26%", "861,260", "10.50%", "609,262"],
    ["2021", "24.94%", "1,076,039", "10.50%", "673,234"],
    ["2022", "-16.56%", "897,853", "0.00%", "673,234"],
    ["2023", "22.46%", "1,099,519", "10.50%", "743,893"],
    ["2024", "24.31%", "1,366,805", "10.50%", "821,971"],
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
            {/* <div className="mt-2 w-full border border-gray-300 p-4 rounded">
              <table className="w-full text-sm table-auto border-collapse">
                <thead>
                  <tr className="text-center border-b">
                    <th className="p-2"></th>
                    <th className="p-2">S&P Taxable</th>
                    <th className="p-2">Tax Free Plan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 font-bold">Average</td>
                    <td className="p-2">8.71%</td>
                    <td className="p-2">7.42%</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">CAGR</td>
                    <td className="p-2">7.02%</td>
                    <td className="p-2">7.96%</td>
                  </tr>
                </tbody>
              </table>
            </div> */}
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
                  <tr className="border-b">
                    <td className="p-2 font-bold">Average</td>
                    <td className="p-2">10.64%</td>
                    <td className="p-2">6.66%</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-bold">CAGR</td>
                    <td className="p-2">9.16%</td>
                    <td className="p-2">7.37%</td>
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
