import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { FaUserShield, FaLock } from 'react-icons/fa';

const Register: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login after 5 seconds
    const timer = setTimeout(() => {
      router.push('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Head>
        <title>Register - CRM Pro</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-2xl mb-4">
              <FaLock className="text-4xl text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Registration Disabled</h1>
            <p className="text-slate-400 mt-2">Admin-Only User Creation</p>
          </div>

          {/* Info Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4">
                <FaUserShield className="text-3xl text-blue-400" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">
                  Self-Registration is Not Available
                </h2>
                
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    For security reasons, new user accounts can only be created by system administrators.
                  </p>
                </div>
                
                <div className="space-y-2 text-left bg-slate-800/50 rounded-xl p-4">
                  <p className="text-slate-300 text-sm font-semibold">To get access:</p>
                  <ul className="list-disc list-inside text-slate-400 text-sm space-y-1 ml-2">
                    <li>Contact your system administrator</li>
                    <li>Request account creation from an admin</li>
                    <li>You will receive login credentials via email</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-300 shadow-lg shadow-blue-500/25"
                >
                  Go to Login
                </Link>
              </div>
              
              <p className="text-slate-500 text-xs">
                Redirecting to login page in 5 seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
