"use client"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { JSX, SVGProps } from "react"

export default function Component() {
  return (
    <div className="bg-gray-900">
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8 font-sans pt-0">
      <form className="space-y-6">
        <div>
         <div className="text-lg font-medium font-mono text-green-300 mb-2">
          Create a task: 
         </div>
          <Label htmlFor="title" className="block text-sm font-medium text-gray-400 dark:text-gray-400">
            Title
          </Label>
          <div className="mt-1">
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="Enter a title"
              className="bg-[#FFFFF7]  block w-full rounded-md shadow-sm  dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 bg-transparent text-white"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="images" className="block text-sm font-medium text-gray-400 dark:text-gray-300">
            Add Images
          </Label>
          <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6 dark:border-gray-600">
            <div className="space-y-1 text-center">
              <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md bg-green font-medium text-green-700 focus-within:outline-none focus-within:ring-0 focus-within:ring-[#90ee90] focus-within:ring-offset-2 dark:bg-gray-800 dark:text-[#90ee90]"
                >
                  <span>Upload a file</span>
                  <Input id="file-upload" name="file-upload" type="file" multiple className="sr-only" />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <Button
            type="submit"
            className="bg-green-700 hover:bg-[#80d080] focus:ring-[#90ee90] dark:bg-[#90ee90] dark:hover:bg-[#80d080] dark:focus:ring-[#90ee90] text-black font-mono font-semibold "
          >
            Submit 
          </Button>
        </div>
      </form>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <img
            key={index}
            src="/placeholder.svg"
            alt={`Uploaded Image ${index + 1}`}
            width={320}
            height={240}
            className="rounded-lg object-cover"
          />
        ))}
      </div>
    </div>
    </div>
  )
}

function UploadIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}