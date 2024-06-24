/* eslint-disable react/jsx-key */
"use client";
import Appbar from "@/tools/Appbar";
import { BACKEND_URL } from "@/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

async function getTaskDetails(taskId: string) {
  const response = await axios.get(
    `${BACKEND_URL}/v1/user/task?taskId=${taskId}`,
    {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    }
  );
  return response.data;
}

export default function Page({
  params: { taskId },
}: {
  params: { taskId: string };
}) {
  const [result, setResult] = useState<
    Record<
      string,
      {
        count: number;
        option: {
          imageUrl: string;
        };
      }
    >
  >({});
  const [taskDetails, setTaskDetails] = useState<{
    title?: string;
  }>({});

  useEffect(() => {
    getTaskDetails(taskId).then((data) => {
      setResult(data.result);
      setTaskDetails(data.taskDetails);
    });
  }, [taskId]);

  const taskIds = Object.keys(result);
  const counts = taskIds.map(id => result[id].count);
  const imageUrls = taskIds.map(id => result[id].option.imageUrl);

  const data = {
    labels: taskIds,
    datasets: [
      {
        label: 'Votes',
        data: counts,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Task Votes Count',
        color: 'white', 
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white', 
        },
      },
      y: {
        ticks: {
          color: 'white', 
        },
      },
    
    },
  };

  return (
    <div className="bg-gray-900 min-h-screen pb-20">
      <Appbar />
      <div className="text-2xl pt-15 flex justify-center text-green-300">
        {taskDetails.title}
      </div>
      <div className="flex justify-center pt-8 text-green-300">
        <div>
          <Bar data={data} options={options} style={{ width: '80%', height: '250px'}} />
        </div>
      </div>
      <div className="flex justify-center pt-8 text-green-300">
        {taskIds.map((taskId) => (
          <Task
            key={taskId}
            imageUrl={result[taskId].option.imageUrl}
            votes={result[taskId].count}
          />
        ))}
      </div>
    </div>
  );
}

function Task({ imageUrl, votes }: { imageUrl: string; votes: number }) {
  return (
    <div>
      <img className="p-2 w-96 rounded-md" src={imageUrl} alt="Task Image" />
      <div className="flex justify-center">{votes}</div>
    </div>
  );
}