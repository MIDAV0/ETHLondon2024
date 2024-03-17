import { CategoryScale, Chart, LineController, LineElement, LinearScale, PointElement } from "chart.js";
import { Line } from "react-chartjs-2";

Chart.register(CategoryScale, LinearScale, LineController, PointElement, LineElement);

const LineGraph = () => {
  // Sample data
  const randomArray = [];
  for (let i = 0; i < 7; i++) {
    // Generate a random number between 0 and 100 (inclusive)
    const randomNumber = Math.floor(Math.random() * 101);
    randomArray.push(randomNumber);
  }

  const data = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Sample Data",
        data: randomArray,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="flex flex-col w-[600px] self-center">
      <p className="text-lg font-bold text-center">Shares Price Chart</p>
      <Line data={data} />
    </div>
  );
};

export default LineGraph;
