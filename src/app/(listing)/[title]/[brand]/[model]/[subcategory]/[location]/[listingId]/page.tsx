import React from "react"
import MintCarousel from "@/src/components/pageMint/MintCarousel"
import MintQA from "@/src/components/pageMint/MintQA"
import MintOffer from "@/src/components/pageMintOffers/MintOffer"
import MintList from "@/src/components/pageMint/MintList"
import MintInfo from "@/src/components/pageMint/MintInfo"
import MintRenew from "@/src/components/pageMint/MintRenew"
import MintSold from "@/src/components/pageMint/MintSold"
import MintSoldRenew from "@/src/components/pageMint/MintSoldRenew"
import MintManager from "@/src/components/pageMint/MintManager"
import { authOptions } from "@/src/lib/auth/auth-options"
import { formatTimeToNow } from "@/src/lib/utils"
import Link from "next/link"
import { db } from "@/src/server/db"
import { listings, queries, offers, users } from "@/src/server/db/schema"
import { listingsType, queryType, userType } from "@/src/types/db"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
  QueryCache,
} from "@tanstack/react-query"
import { eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import ShareButtons from "@/src/components/pageMint/ShareButtons"

interface MintPageProps {
  params: {
    title: string
    brand: string
    model: string
    subcategory: string
    location: string
    listingId: string
  }
}

export default async function MintPage({ params }: MintPageProps) {
  const param = params
  const decodedParam = decodeURIComponent(param.listingId)
  const session = await getServerSession(authOptions)
  const domain = process.env.URL!
  const queryClient = new QueryClient()
  const listingId = decodedParam.toString()
  const userId = session?.user.id.toString() || ""

  const listing: listingsType[] =
    (await db.select().from(listings).where(eq(listings.id, decodedParam))) ||
    []

  const user: userType[] = await db
    .select()
    .from(users)
    .where(eq(users.id, listing[0].authorId))

  const userName = user[0].name.replace(" ", "-")

  //  // OFFER QUERY
  //  await queryClient.prefetchQuery({
  //   queryKey: ["adOffers", listingId],
  //   queryFn: () => listing && getAdOffers(listingId),
  // })

  // // QUERIES QUERY
  // await queryClient.prefetchQuery({
  //   queryKey: ["adQueries", listingId],
  //   queryFn: () => listing && getAdQueries(listingId),
  // })

  // PRICE TEXT FORMATTER
  const formatPrice = (price: any) => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
    })

    return formatter.format(price)
  }

  return (
    <div className="flex h-auto w-full">
      {/* <HydrationBoundary state={dehydrate(queryClient)}> */}
      <div className="mx-auto w-10/12 md:w-8/12">
        {listing &&
          listing.map((item, index) => (
            <div key={index} className="mb-60">
              {/* TOP SECTION */}
              <div className="mt-10 flex w-full flex-row justify-between">
                <div className="my-auto w-full">
                  <div className="flex w-full justify-between">
                    <p className="mb-5 text-3xl font-bold text-customAccent">
                      R {formatPrice(item.price)}
                    </p>
                    {session &&
                      (item.price &&
                      item.title &&
                      item.authorId !== session.user.id ? (
                        <MintOffer listing={item} />
                      ) : item.isExpired ? (
                        <MintRenew listing={item} />
                      ) : item.isSold ? (
                        <MintSoldRenew listing={item} />
                      ) : (
                        <MintSold listing={item} />
                      ))}
                  </div>
                  <h1 className="mb-2 text-2xl font-bold">{item.title}</h1>
                  <p className="text-xs italic text-secondary">
                    Listed {formatTimeToNow(item.createdAt!)}
                  </p>
                </div>
              </div>
              <div className="flex flex-col py-5 md:flex-row">
                {/* @ts-expect-error Server Component */}
                <MintCarousel listing={item.images} />
                <MintInfo listing={item} />
              </div>
              <Link
                className="flex w-full italic"
                href={`/more-ads-by/${userName}/${user[0].id}`}
              >
                More ads by:
                <span className="pl-2 font-bold text-customAccent">{`${user[0].name}`}</span>
              </Link>

              {session?.user.id && (
                <>
                  {/* MANAGER SECTION */}
                  <hr className="my-2 border border-t-muted-foreground" />
                  <div className="flex min-h-[40px] justify-between">
                    <ShareButtons domain={domain} />
                    <MintManager listing={item} />
                  </div>
                  {/* @ts-expect-error Server Component */}
                  <MintList
                    items={item.items}
                    adId={item.id}
                    sellerId={item.authorId}
                  />
                </>
              )}

              {/* DESCRIPTION SECTION */}
              <hr className="my-2 border border-t-muted-foreground" />
              <h1 className="mt-5 text-lg font-bold">Description:</h1>
              <p className="my-5 whitespace-pre-line pl-2 text-sm md:text-base">
                {item.description}
              </p>
              <hr className="my-2 border border-t-muted-foreground" />

              {/* QUERIES SECTION */}
              <h1 className="mt-5 text-lg font-bold">Questions & Answers:</h1>
              <MintQA listing={item} />
            </div>
          ))}
      </div>
      {/* </HydrationBoundary> */}
    </div>
  )
}
