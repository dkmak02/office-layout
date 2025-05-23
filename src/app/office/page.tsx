import { redirect } from "next/navigation";
import dayjs from "dayjs";
export default function OfficeRedirectPage() {
  const today = dayjs().format("YYYY-MM-DD");
  redirect(`/office/floor-7?date=${today}`);
}
