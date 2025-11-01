import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"
import { Button } from "../ui/button";

// const user = {
//     image: "https://www.pngall.com/wp-content/uploads/12/Avatar-Profile-PNG-Image-File.png",
//     username: "john_doe",
//     email: "john@doi.com",
//     status: "Active",
// }

function UserCard({ user }) {

    const status = (user?.status || "").toString().toLowerCase();

    let badgeClass = "bg-gray-200 text-gray-800";
    switch (status) {
        case "active":
            badgeClass = "bg-green-300 text-green-800";
            break;
        case "pending_mobile_verify":
            badgeClass = "bg-yellow-300 text-yellow-800";
            break;
      
        case "deleted":
            badgeClass = "bg-red-300 text-red-800";
            break;
    }
    
  return (
    <div className=" w-full p-2 px-5 flex justify-between  border-2 rounded-lg">
      
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src= {user.image}/>
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <div className=" -mt-4">
            <h2 className="text-xl font-bold mt-4">{user.username}<sup> <Badge className={`${badgeClass}`}  variant="secondary">{user.status}</Badge></sup></h2>
                
            <p className="text-muted-foreground text-[14px] text-left">{user.email}</p>
          
        </div>
      </div>

      <div className=" h-full my-auto ">
        <Button className="" variant="outline">View Profile</Button>
      </div>

    </div>
  )
}

export default UserCard;
