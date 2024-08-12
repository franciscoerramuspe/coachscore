import { SignUp } from "@clerk/nextjs";
import React from "react";

const page = () => {
  return (
    <div className="flex justify-center items-center flex-col w-full h-[calc(100vh-70px)]">
      <div className="my-5 font-semibold text-[12px] uppercase">Sign Up</div>

      <SignUp />
    </div>
  );
};

export default page;