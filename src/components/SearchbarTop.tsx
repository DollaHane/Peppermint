"use client"
import React, { useState, useEffect } from "react"
import { Input } from "./components-ui/Input"
import { Button } from "./components-ui/Button"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import useMediaQuery from "../hooks/useMediaQuery"
import useKeyPress from "../hooks/useKeyPress"
import { useQueryClient } from "@tanstack/react-query"

export default function SearchbarTop() {
  const isAboveMediumScreens = useMediaQuery("(min-width: 768px)")
  const queryClient = useQueryClient()
  const router = useRouter()
  const [input, setInput] = useState<string>("")
  const enterKey = useKeyPress("Enter")
  const searchParams = input.replace(/ /g, "-")

  const handleSearch = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["results"],
    })
    if (searchParams !== "") {
      router.push(`/find-ads/${searchParams}`)
    } else {
      router.push(`/find-ads/no-result`)
    }
  }

  useEffect(() => {
    if (enterKey) {
      handleSearch()
    }
  }, [enterKey])

  return (
    <div className="flex w-full items-center justify-center">
      <Input
        className="z-40 w-full rounded-full border border-transparent bg-background placeholder:text-customAccent dark:border-muted"
        placeholder="Your search begins here.."
        value={input}
        onChange={(event: any) => setInput(event.target.value)}
      />
      <Button
        className="relative z-30 -ml-8 flex h-10 w-[85px] items-center justify-end rounded-full bg-customAccent text-zinc-100 hover:text-customAccent"
        onClick={() => {
          handleSearch()
        }}
      >
        <Search />
      </Button>
    </div>
  )
}
