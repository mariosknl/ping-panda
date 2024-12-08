import { DashboardPage } from "@/components/DashboardPage"
import { db } from "@/db"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { DashboardPageContent } from "./DashboardPageContent"
import { CreateEventCategoryModal } from "@/components/CreateEventCategoryModal"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { createCheckoutSession } from "@/lib/stripe"
import { PaymentSuccessmodal } from "@/components/PaymentSuccessmodal"

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

const Page = async ({ searchParams }: PageProps) => {
  const auth = await currentUser()

  if (!auth) {
    redirect("/sign-in")
  }

  const intent = searchParams.intent

  const user = await db.user.findUnique({
    where: { externalId: auth.id },
  })

  if (!user) {
    redirect("/sign-in")
  }

  if (intent === "upgrade") {
    const session = await createCheckoutSession({
      userEmail: user.email,
      userId: user.id,
    })

    if (session.url) redirect(session.url)
  }

  const success = searchParams.success

  return (
    <>
      {success ? <PaymentSuccessmodal /> : null}

      <DashboardPage
        cta={
          <CreateEventCategoryModal>
            <Button className="w-full sm:w-fit">
              <PlusIcon className="size-4 mr-2" />
              Add Category
            </Button>
          </CreateEventCategoryModal>
        }
        title="Dashboard"
      >
        <DashboardPageContent />
      </DashboardPage>
    </>
  )
}
export default Page
