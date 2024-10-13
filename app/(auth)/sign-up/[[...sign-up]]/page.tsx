import Auth from "app/(auth)/auth";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex justify-center items-start md:items-center p-8">
      <Auth isSignup={true} />
    </div>
  );
}
