"use client";
import { SignIn, SignUp, useUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation';

export default function Auth({ isSignup }: { isSignup?: boolean }) {
    const { isSignedIn } = useUser()
  
  if(isSignedIn){
    redirect("/");
  }

  return (
    isSignup ? <SignUp signInUrl='/login' /> : <SignIn signUpUrl='/signup' />
  )
}