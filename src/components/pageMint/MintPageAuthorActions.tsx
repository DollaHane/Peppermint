import React from "react"
import Link from "next/link"
import { FileEdit } from "lucide-react"
import MintDelete from "./MintDelete"
import MintManageOffers from "./MintManageOffers"
import MintManageQueries from "./MintManagerQueries"
import ChatSheet from "../pageMintChat/ChatSheet"
import ShareButtons from "./ShareButtons"
import { listingsType } from "@/src/types/db"

interface AuthorActionsProps {
  listing: listingsType
}

export default function MintPageAuthorActions({ listing }: AuthorActionsProps) {
  console.log("Author Ad Id:", listing)

  return (
    <div className="flex w-full justify-end">
      <div className="flex w-full justify-end space-x-2">
        <MintManageOffers listing={listing} />
        <MintManageQueries listing={listing} />
        <Link
          href={`/ad/edit/${listing.id}`}
          className="group flex h-10 w-10 items-center justify-center hover:text-amber-500"
        >
          <FileEdit />
        </Link>
        <MintDelete listingId={listing.id} />
        <ChatSheet listingId={listing.id} />
      </div>
    </div>
  )
}
