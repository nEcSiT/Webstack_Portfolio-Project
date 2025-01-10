// app/pages/signup.js or app/pages/signup.tsx (depending on your setup)
import React from "react";
import SignUpForm from "@/app/components/Customers/Signup/SignUp";

const SignUpPage = () => {
  return (
    <div className="signup-container">
      <h1 className="text-center text-2xl font-semibold">Sign Up</h1>
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;
