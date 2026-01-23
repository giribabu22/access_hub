import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AccessHub VMS
                </h3>
                <p className="text-slate-400 text-sm">Visitor Management System</p>
              </div>
            </div>
            <p className="text-slate-300 mb-6 max-w-md leading-relaxed">
              Streamline your organization's visitor management with our comprehensive, secure, and user-friendly platform. From small offices to large enterprises, we've got you covered.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="group p-3 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-all duration-300">
                <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="group p-3 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-all duration-300">
                <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="group p-3 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-all duration-300">
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.750-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                </svg>
              </a>
              <a href="#" className="group p-3 bg-slate-800/50 rounded-xl hover:bg-slate-700/50 transition-all duration-300">
                <svg className="w-5 h-5 text-slate-400 group-hover:text-red-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="text-indigo-400">🚀</span>
              Quick Links
            </h4>
            <div className="space-y-3">
              <Link to="/dashboard" className="block text-slate-300 hover:text-indigo-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-slate-500 rounded-full group-hover:bg-indigo-400 transition-colors duration-300"></span>
                Dashboard
              </Link>
              <Link to="/visitors" className="block text-slate-300 hover:text-indigo-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-slate-500 rounded-full group-hover:bg-indigo-400 transition-colors duration-300"></span>
                Visitor Management
              </Link>
              <Link to="/employees" className="block text-slate-300 hover:text-indigo-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-slate-500 rounded-full group-hover:bg-indigo-400 transition-colors duration-300"></span>
                Employee Management
              </Link>
              <Link to="/reports" className="block text-slate-300 hover:text-indigo-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-slate-500 rounded-full group-hover:bg-indigo-400 transition-colors duration-300"></span>
                Analytics & Reports
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="text-purple-400">💬</span>
              Support
            </h4>
            <div className="space-y-3">
              <a href="#" className="block text-slate-300 hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-slate-500 rounded-full group-hover:bg-purple-400 transition-colors duration-300"></span>
                Help Center
              </a>
              <a href="#" className="block text-slate-300 hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-slate-500 rounded-full group-hover:bg-purple-400 transition-colors duration-300"></span>
                API Documentation
              </a>
              <a href="#" className="block text-slate-300 hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-slate-500 rounded-full group-hover:bg-purple-400 transition-colors duration-300"></span>
                Contact Support
              </a>
              <a href="#" className="block text-slate-300 hover:text-purple-400 transition-colors duration-300 flex items-center gap-2 group">
                <span className="w-1 h-1 bg-slate-500 rounded-full group-hover:bg-purple-400 transition-colors duration-300"></span>
                System Status
              </a>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 pt-8 border-t border-slate-700/50">
          <h4 className="text-lg font-semibold text-white mb-6 text-center">
            🌟 Why Choose AccessHub VMS?
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-slate-800/30 rounded-2xl border border-slate-700/30">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h5 className="text-white font-semibold mb-2">Secure & Compliant</h5>
              <p className="text-slate-300 text-sm">Enterprise-grade security with GDPR compliance and data encryption</p>
            </div>
            <div className="text-center p-6 bg-slate-800/30 rounded-2xl border border-slate-700/30">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h5 className="text-white font-semibold mb-2">Lightning Fast</h5>
              <p className="text-slate-300 text-sm">Check-in visitors in seconds with our optimized workflow and UI</p>
            </div>
            <div className="text-center p-6 bg-slate-800/30 rounded-2xl border border-slate-700/30">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h5 className="text-white font-semibold mb-2">User Friendly</h5>
              <p className="text-slate-300 text-sm">Intuitive design that works great for all ages and technical levels</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-slate-900/80 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-slate-400 text-sm">
              © {currentYear} AccessHub VMS. All rights reserved. Built with ❤️ for modern organizations.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors duration-300">Terms of Service</a>
              <a href="#" className="text-slate-400 hover:text-indigo-400 transition-colors duration-300">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;