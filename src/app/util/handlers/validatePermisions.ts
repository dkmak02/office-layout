import { Reservation } from "@/app/models/deskModel";
import { User } from "@/app/models/userModel";

export const allowDeleteReservation = (userData?:User, reservation?: Reservation, projectCode?:string) => {
  if (userData?.isAdmin || userData?.isModerator) return true;
    if (
      reservation &&
      userData?.id === reservation?.userId &&
      projectCode === "Hotdesk"
    ) {
      return true;
    }
    return false;
  };
export const allowOwnUnreserv = () =>{
    return true;
  
}