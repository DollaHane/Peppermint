"use client"
import React, { useState } from "react"
import { useParams } from "next/navigation"
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import MintFilter from "@/src/components/pageMintFilter/MintFilter"
import { Button } from "@/src/components/components-ui/Button"
import CardsFeed from "@/src/components/componentsCards/CardsFeed"
import { Loader2, Filter, Search } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/src/components/components-ui/DropdownMenu"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/src/components/components-ui/Sheet"
import { queryLimit } from "@/src/server/queryLimit"
import { currentYear } from "@/src/lib/utils"
import SortIcon from "@/src/components/pageMintFilter/SortIcon"
import { listingsType } from "@/src/types/db"

export default function FindAds() {
  const params = useParams()
  const paramsString = JSON.stringify(params?.params)
  const searchParams = paramsString.replace(/-/g, " ")
  const queryClient = useQueryClient()

  const [sort, setSort] = useState<string>("latest")

  const [payload, setPayload] = useState<any>({
    search: searchParams,
    tab: "",
    category: "",
    subCategory: "",
    priceMin: 0,
    priceMax: 9999999,
    location: "",
    mileageMin: 0,
    mileageMax: 300000,
    yearMin: 1900,
    yearMax: currentYear,
    transmission: "",
    sort: sort,
  })

  const fetchResults = async ({ pageParam }: any) => {
    try {
      const response = await axios.get(
        `/api/search?page=${pageParam}&limit=${queryLimit}&searchParam=${searchParams}`,
        { params: { payload } }
      )
      return response.data
    } catch (error) {
      console.error("fetch error:", error)
    }
  }

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["results"],
    queryFn: fetchResults,
    initialPageParam: 1,
    getNextPageParam: (_, pages) => {
      return pages.length + 1
    },
  })

  const getSetFilterCallback = async (data: any) => {
    setPayload({
      search: searchParams,
      tab: data.tab,
      category: data.category,
      subCategory: data.subCategory,
      priceMin: data.priceMin,
      priceMax: data.priceMax,
      location: data.location,
      mileageMin: data.mileageMin,
      mileageMax: data.mileageMax,
      yearMin: data.yearMin,
      yearMax: data.yearMax,
      transmission: data.transmission,
      sort: sort,
    })
    await queryClient.invalidateQueries({ queryKey: ["results"] })
  }

  const listings: listingsType[] = data?.pages.flatMap(
    (page) => page && page.rows
  ) || [""]

  if (sort === "latest") {
    listings.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateB - dateA
    })
  }

  if (sort === "oldest") {
    listings.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateA - dateB
    })
  }

  if (sort === "high") {
    listings.sort((a: any, b: any) => b.price! - a.price!)
  }

  if (sort === "low") {
    listings.sort((a: any, b: any) => a.price! - b.price!)
  }
  return (
    <div className="min-w-screen relative min-h-screen w-full">
      <div className="mx-auto mb-52 h-auto min-h-screen w-11/12 min-w-[280px] overflow-hidden md:w-8/12">
        <div className="mt-10 flex flex-row justify-between md:items-center ">
          <div className="flex flex-col items-start justify-start sm:flex-row">
            <h1 className="pr-3 text-left text-xl font-bold">
              Showing results for:
            </h1>
            <span className="text-xl font-bold italic text-customAccent">
              {searchParams}
            </span>
          </div>
          <div className="fixed right-0 z-50 flex h-32 w-10  flex-col items-center justify-center gap-5 rounded-bl-3xl rounded-tl-3xl border-l-2 border-customAccent bg-background shadow-lg md:static md:h-10 md:w-32 md:flex-row md:justify-end md:rounded-full md:border-2 md:border-transparent md:shadow-none">
            <Sheet>
              <SheetTrigger className="flex items-center justify-center rounded-full bg-background font-bold shadow-xl hover:text-customAccent md:h-10 md:w-10 md:shadow-lg">
                <Filter size={22} />
              </SheetTrigger>
              <SheetContent side="left">
                <SheetTitle className="text-customAccent">
                  Filter Results:
                </SheetTitle>
                <MintFilter
                  setFilterCallback={getSetFilterCallback}
                  initPayload={payload}
                />
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger className="z-50 flex h-10 w-10 items-center justify-center rounded-full hover:text-customAccent focus:outline-none md:shadow-lg">
                <SortIcon state={sort} />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background">
                <DropdownMenuLabel></DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    setSort("latest"),
                      await queryClient.invalidateQueries({
                        queryKey: ["results"],
                      })
                  }}
                >
                  Latest
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setSort("oldest"),
                      await queryClient.invalidateQueries({
                        queryKey: ["results"],
                      })
                  }}
                >
                  Oldest
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setSort("high"),
                      await queryClient.invalidateQueries({
                        queryKey: ["results"],
                      })
                  }}
                >
                  Price: High-Low
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    setSort("low"),
                      await queryClient.invalidateQueries({
                        queryKey: ["results"],
                      })
                  }}
                >
                  Price: Low-High
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <hr className="mt-2 h-[2px] w-full bg-muted-foreground" />
        {/* @ts-ignore */}
        {listings[0] !== undefined && listings[0] !== "" ? (
          <CardsFeed listings={listings} />
        ) : (
          // null
          <div className="flex  h-40 w-full items-center justify-center gap-5">
            <Search size={30} />
            <p className="text-center italic">No results found</p>
          </div>
        )}

        <Button
          onClick={() => fetchNextPage()}
          className="ml-5 flex w-28 items-center justify-center"
        >
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <p>Load More</p>
          )}
        </Button>
      </div>
    </div>
  )
}
