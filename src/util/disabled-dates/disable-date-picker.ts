import dayjs from "dayjs";

export function isPastDate(current: any): boolean {
  return current && current < dayjs().startOf("day");
}
