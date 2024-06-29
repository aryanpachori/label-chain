/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { BACKEND_URL } from "@/utils";
import { Loader2Icon } from "lucide-react";

interface Task {
  id: number;
  amount: number;
  title: string;
  options: {
    id: number;
    image_url: string;
    task_id: number;
  }[];
}

export default function NextTask() {
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNextTask(); 
  }, []);

  const fetchNextTask = () => {
    setLoading(true);
    axios
      .get(`${BACKEND_URL}/v1/workers/nextTask`, {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((res) => {
        if (res.data.task) {
          setCurrentTask(res.data.task);
        } else {
          setCurrentTask(null);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching next task:", error);
        setLoading(false); 
      });
  };

  const handleOptionSelect = async (taskId: string, optionId: string) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/v1/workers/submission`,
        {
          taskId,
          OptionId: optionId,
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );
      const nextTask = response.data.nextTask;

      if (nextTask) {
        setCurrentTask(nextTask);
      } else {
        setCurrentTask(null);
      }
    } catch (error) {
      console.error("Error submitting option:", error);
    
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-400 border-t-transparent mt-[-50vh]" />
      </div>
    );
  }

  if (!currentTask) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-red-300 text-xl mt-[-30vh]">
        No tasks available at the moment. Please check back later:)
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="text-5xl text-center pt-10 mb-10  flex justify-center text-green-300 font-semi-bold text-pretty font-mono">
        {currentTask?.title} 
      </div>
      <div className="flex justify-center text-red-300 mt-5 ">
           Select the most appropriate option :
           </div>
      <div className="flex justify-center pt-8">
        {currentTask?.options.map((option) => (
          <Option
            key={option.id}
            imageUrl={option.image_url}
            onSelect={() => handleOptionSelect(currentTask.id.toString(), option.id.toString())}
          />
          
        ))}
      </div>
    </div>
  );
}

interface OptionProps {
  imageUrl: string;
  onSelect: () => void;
}


  
  function Option({ imageUrl, onSelect }: OptionProps) {
    return (
      <div className="p-4">
        <img
          onClick={onSelect}
          className="rounded-md border border-gray-300 w-90 h-80 object-cover"
          src={imageUrl}
          alt="Option Image"
        />
      </div>
    );
  }
  

