/* eslint-disable react/jsx-key */
"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Upload } from "./Upload";
import { BACKEND_URL } from "@/utils";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function UploadImage() {
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const router = useRouter();

  async function onSubmit(event: any) {
    event.preventDefault();

    try {
      const response = await axios.post(
        `${BACKEND_URL}/v1/user/task`,
        {
          options: images.map((image) => ({
            imageUrl: image,
          })),
          title,
          signature: "txSignature",
        },
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      console.log("Response:", response);

      // Ensure response.data.id is a valid task ID
      if (response.data.id) {
        router.push(`/task/${response.data.id}`);
      } else {
        console.error("No task ID in response:", response.data);
      }
    } catch (error) {
      console.error("Error submitting task:", error);
    }
  }

  return (
    <div className="bg-gray-900 min-h-screen ">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8 font-sans pt-0">
        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <div className="text-lg font-medium font-mono text-green-300 mb-2 pb-5">
              Create a task:
            </div>
            <Label
              htmlFor="title"
              className="block text-sm font-medium text-gray-400 dark:text-gray-400 pb-1"
            >
              Title
            </Label>
            <div className="mt-1">
              <Input
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                id="title"
                name="title"
                type="text"
                placeholder="Enter a title"
                className="bg-[#FFFFF7] block w-full rounded-md shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 bg-transparent text-white"
              />
            </div>
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-400 dark:text-gray-300">
              Add Images
            </Label>
            <div className="flex justify-center pt-4 max-w-screen-lg h-22">
              {images.map((image, index) => (
                <Upload
                  key={index}
                  image={image}
                  onImageAdded={(imageUrl) => {
                    setImages((i) => [...i, imageUrl]);
                  }}
                />
              ))}
            </div>
            <div className="ml-4 pt-2 flex justify-center">
              <Upload
                onImageAdded={(imageUrl) => {
                  setImages((i) => [...i, imageUrl]);
                }}
              />
            </div>
          </div>
          <div className="flex justify-center items-center ">
            <Button
              type="submit"
              className="bg-green-700 hover:bg-[#80d080] focus:ring-[#90ee90] dark:bg-[#90ee90] dark:hover:bg-[#80d080] dark:focus:ring-[#90ee90] text-black font-mono font-semibold ml-2 "
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
