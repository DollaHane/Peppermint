"use client"
import React from "react"
import { FileQuestion } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components-ui/Sheet"
import MintQueries from "../pageMintQueries/MintQueries"

export default function MintManageQueries() {
  return (
    <Sheet>
      <SheetTrigger className="group flex h-10 w-10 items-center justify-center hover:text-teal-500">
        <FileQuestion />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="h-full">
          <SheetDescription className="h-full">
            <SheetTitle className="mt-5 text-customAccent">Queries:</SheetTitle>
            <MintQueries />
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}
