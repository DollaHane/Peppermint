"use client"

import React, { useCallback, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "@/src/hooks/use-toast"
import { useUploadThing } from "@/src/hooks/useUploadThing"
import { categoryHousehold } from "@/src/lib/categories/mintHousehold"
import { southAfrica } from "@/src/lib/locations/southAfrica"
import {
  HouseholdCreationRequest,
  validateHousehold,
} from "@/src/lib/validators/validateHousehold"
import { listingsType } from "@/src/types/db"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useDropzone } from "@uploadthing/react/hooks"
import axios from "axios"
import { ImagePlus, Loader } from "lucide-react"
import { FileWithPath } from "react-dropzone"
import { useForm } from "react-hook-form"
import { generateClientDropzoneAccept } from "uploadthing/client"
import { z } from "zod"

import { Button } from "../components-ui/Button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components-ui/Form"
import { Input } from "../components-ui/Input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components-ui/Select"
import { Textarea } from "../components-ui/Textarea"

type FormData = z.infer<typeof validateHousehold>

interface EditHouseholdProps {
  listing: listingsType[]
}

export default function EditHousehold({ listing }: EditHouseholdProps) {
  const router = useRouter()
  const mintId = listing[0].id
  console.log('listing:', listing)

  // ----------------------------------------------------------------------------------
  // UPLOADTHING
  const [files, setFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [uploadData, setuploadData] = useState([])
  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setFiles(acceptedFiles)
  }, [])
  const fileUrls = uploadData.map((file: any) => file.fileUrl)
  const urlJson = JSON.stringify(fileUrls)

  const { startUpload, permittedFileInfo } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res: any) => {
      const data = res
      setuploadData(data)
      setIsLoading(false)
      return toast({
        title: "Success!.",
        description: "Your files have been uploaded successfully.",
      })
    },
    onUploadError: () => {
      setIsLoading(true)
      return toast({
        title: "Something went wrong.",
        description: "An error occured while uploading. Please try again.",
        variant: "destructive",
      })
    },
    onUploadBegin: () => {
      setIsLoading(true)
      return toast({
        title: "Please wait..",
        description: "Your upload has started.",
      })
    },
  })

  const fileTypes = permittedFileInfo?.config
    ? Object.keys(permittedFileInfo?.config)
    : []

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
  })

  // ----------------------------------------------------------------------------------
  // REACT-HOOK-FORM
  const form = useForm<FormData>({
    resolver: zodResolver(validateHousehold),
    defaultValues: {
      category: listing[0].category || "",
      price: listing[0].price || 0,
      title: listing[0].title || "",
      brand: listing[0].brand || "",
      model: listing[0].model || "",
      description: listing[0].description || "",
      images: listing[0].images || "",
      location: listing[0].location || "",
      meetup: listing[0].meetup || "",
    },
  })

  const { mutate: updatePost } = useMutation({
    // PAYLOAD
    mutationFn: async ({
      category,
      price,
      title,
      brand,
      model,
      description,
      images,
      location,
      meetup,
    }: HouseholdCreationRequest) => {
      const payload: HouseholdCreationRequest = {
        category,
        price,
        title,
        brand,
        model,
        description,
        images,
        location,
        meetup,
      }
      const { data } = await axios.patch(
        `/api/editHousehold/${mintId}`,
        payload
      )

      return data
    },

    // ERROR
    onError: () => {
      return toast({
        title: "Something went wrong.",
        description: "Your listing was not updated. Please try again.",
        variant: "destructive",
      })
    },

    // SUCCESS
    onSuccess: () => {
      router.push("/p/mymints")
      router.refresh()
      return toast({
        description: "Your listing has been successfully updated.",
      })
    },
  })

  async function onSubmit(data: FormData) {
    const payload: HouseholdCreationRequest = {
      category: data.category,
      price: data.price,
      title: data.title,
      brand: data.brand,
      model: data.model,
      description: data.description,
      images: listing[0].images || "",
      location: data.location,
      meetup: data.meetup,
    }
    console.log("edit payload:", payload)
    updatePost(payload)
  }

  // ----------------------------------------------------------------------------------
  // UI
  return (
    <div className="mx-auto mb-32 mt-10 w-full rounded-lg bg-background p-2">
      {/* IMAGES */}
      <p className="mb-3 text-sm">Image Upload</p>
      <div className="border-l-1 relative mb-3 flex h-auto min-h-[100px] justify-center rounded-lg border border-dashed border-zinc-300 text-center shadow-lg">
        {isLoading === true && (
          <div className="absolute inset-0 z-50 flex h-full w-full justify-center rounded-lg bg-slate-300/30 backdrop-blur-sm">
            <Loader className="my-auto h-16 w-16 animate-spin text-slate-500" />
          </div>
        )}
        {fileUrls.length > 0 ? (
          <div className="flex h-full w-full flex-wrap gap-2 p-2">
            {fileUrls.map((file: any, index: number) => (
              <div key={index}>
                <img
                  src={file}
                  alt={`Image ${index}`}
                  className="h-20 w-20 rounded-md object-contain shadow-md"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="my-auto flex h-auto">
            {files.length > 0 ? (
              <Button onClick={() => startUpload(files)} variant="outline">
                Upload {files.length} files
              </Button>
            ) : (
              <div
                {...getRootProps()}
                className="my-auto h-auto italic text-zinc-400"
              >
                <input {...getInputProps()} />
                <ImagePlus className="h-10 w-10 animate-pulse" />
              </div>
            )}
          </div>
        )}
      </div>
      <p className="mb-10 text-xs text-muted-foreground">
        (Max Images: 10 | Max file size: 1mb)
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="flex flex-row gap-10">
            {/* CATEGORY */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <div className="flex h-5 w-full justify-between">
                    <FormLabel className="py-1">Category </FormLabel>
                    <FormLabel className="py-1 text-xs italic text-rose-400">
                      (required)
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Select
                      required
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-96 overflow-auto p-2">
                        {categoryHousehold.map((category, index) => (
                          <div key={index}>
                            <hr className="mb-10"></hr>
                            <p
                              className="text-lg font-bold text-primary"
                              key={category.name}
                            >
                              {category.name}
                            </p>
                            {category.subCategories.map((subs) => (
                              <SelectItem key={subs} value={subs}>
                                {subs}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Select an appropriate category..
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* PRICE */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <div className="flex h-5 w-full justify-between">
                    <FormLabel className="py-1">Price </FormLabel>
                    <FormLabel className="py-1 text-xs italic text-rose-400">
                      (required)
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Input {...field} type="number" className="w-60" required />
                  </FormControl>
                  <FormDescription>Have a price in mind?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* TITLE */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <div className="flex h-5 w-full justify-between">
                  <FormLabel className="py-1">Title </FormLabel>
                  <FormLabel className="py-1 text-xs italic text-rose-400">
                    (required)
                  </FormLabel>
                </div>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormDescription>
                  What are we listing for you today?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex w-full flex-col justify-between gap-10 md:flex-row">
            {/* BRAND */}
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    It&apos;s all about the branding..
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* MODEL */}
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>Model name/number..</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/* DESCRIPTION */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <div className="flex h-5 w-full justify-between">
                  <FormLabel className="py-1">Description </FormLabel>
                  <FormLabel className="py-1 text-xs italic text-rose-400">
                    (required)
                  </FormLabel>
                </div>
                <FormControl>
                  <Textarea {...field} required />
                </FormControl>
                <FormDescription>
                  Good descriptions = Speedy sales!
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-10 md:flex-row">
            {/* LOCATION */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <div className="flex h-5 w-full justify-between">
                    <FormLabel className="py-1">Location </FormLabel>
                    <FormLabel className="py-1 text-xs italic text-rose-400">
                      (required)
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Select
                      required
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-96 overflow-auto p-2">
                        {southAfrica.map((category, index) => (
                          <div key={index}>
                            <hr className="mb-10"></hr>
                            <p
                              className="text-lg font-bold text-primary"
                              key={category.name}
                            >
                              {category.name}
                            </p>
                            {category.subCategories.map((subs) => (
                              <SelectItem key={subs} value={subs}>
                                {subs}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>Where are you from?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* MEET */}
            <FormField
              control={form.control}
              name="meetup"
              render={({ field }) => (
                <FormItem>
                  <div className="flex h-5 w-full justify-between">
                    <FormLabel className="py-1">Meeting preferance </FormLabel>
                    <FormLabel className="py-1 text-xs italic text-rose-400">
                      (required)
                    </FormLabel>
                  </div>
                  <FormControl>
                    <Select
                      required
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-auto p-2">
                        <SelectItem key="pub" value="public">
                          Meet in public
                        </SelectItem>
                        <SelectItem key="col" value="collect">
                          Buyer collects
                        </SelectItem>
                        <SelectItem key="del" value="deliver">
                          Deliver to buyer
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    How is this deal going down?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-10">
            <Button type="submit" variant="outline">
              Update
            </Button>
            <Button>
              <Link href={`/p/mint/${mintId}`}>Cancel</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
