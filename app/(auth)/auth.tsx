"use client";
import { SignIn, SignUp } from '@clerk/nextjs'
import { Unauthenticated } from 'convex/react';

export default function Auth({ isSignup }: { isSignup?: boolean }) {
  return (
    <Unauthenticated>
      {
        isSignup ? <SignUp signInUrl='/sign-in' /> : <SignIn signUpUrl='/sign-up' />
      }
    </Unauthenticated>
  )
}