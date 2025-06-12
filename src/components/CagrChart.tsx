import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      borderColor: "#f1c40f",
      backgroundColor: "rgba(241, 196, 15, 0.2)",
      fill: true,
    },
    {
      label: "Tax Free Plan",
      data: [
        100000, 100000, 100000, 117000, 127530, 131356, 149220, 154443, 154443,
        180698, 203828, 203828, 230834, 265961, 273407, 273407, 302276, 359050,
        359050, 427584, 459896, 535697, 535697, 563288, 608337,
      ],
      borderColor: "#2ecc71",
      backgroundColor: "rgba(46, 204, 113, 0.2)",
      fill: true,
    },
  ],
};

const options: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top", // This is now acceptable because it's explicitly typed
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
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>S&P Average vs Tax Free Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 w-full">
          <div className="flex flex-col justify-around w-1/2">
            <div className="w-full h-[400px] relative">
              <Line data={data} options={options} className="w-full h-full" />
            </div>
            <div className="mt-2 w-full border border-gray-300 p-4 rounded">
              <table className="w-full text-sm table-auto border-collapse">
                <thead>
                  <tr className="text-center border-b">
                    <th className="p-2"></th>
                    <th className="p-2">S&amp;P Taxable</th>
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
                    <td className="p-2">7.24%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="w-1/2">
            <div className="border border-gray-300 p-4 rounded">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>S&P Return</th>
                    <th>S&P Value</th>
                    <th>TFP Return</th>
                    <th>TFP Value</th>
                  </tr>
                </thead>
                <tbody>
                  {[
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
                  ].map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} className={j > 1 ? "text-right" : ""}>
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
    </Card>
  );
}
