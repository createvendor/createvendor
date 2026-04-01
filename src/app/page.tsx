'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Logo } from '@/components/Logo';
import { ArrowRight, CheckCircle, Zap, Shield, Globe, BarChart3, Layers, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary/20 selection:text-primary">
      <Navbar />
      
      {/* Hero Section */}
      <main className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-primary bg-primary/10 mb-8 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              v2.0 is now live
            </div>
            <h1 className="text-5xl font-black tracking-tight text-gray-900 sm:text-7xl md:text-8xl mb-8 leading-[0.9]">
              Commerce <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Reimagined.</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 sm:text-2xl leading-relaxed font-medium">
              Launch a world-class online store in seconds. No code, no limits, just pure growth. The platform for the next generation of brands.
            </p>
            <div className="mt-10 max-w-md mx-auto sm:flex sm:justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-white bg-gray-900 hover:bg-black transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/demo"
                className="w-full sm:w-auto mt-4 sm:mt-0 flex items-center justify-center px-8 py-4 text-lg font-bold rounded-full text-gray-900 bg-white border-2 border-gray-200 hover:border-gray-900 transition-all"
              >
                View Demo
              </Link>
            </div>
            <div className="mt-12 flex items-center justify-center space-x-8 text-sm font-semibold text-gray-500">
              <div className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> No credit card required</div>
              <div className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> 14-day free trial</div>
              <div className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Cancel anytime</div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-base font-bold text-primary tracking-wide uppercase">Why Choose Us</h2>
            <p className="mt-2 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
              Everything you need to scale.
            </p>
            <p className="mt-4 text-xl text-gray-500">
              Powerful tools that work together seamlessly to help you build, manage, and grow your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <Zap className="h-8 w-8 text-yellow-500" />,
                title: "Lightning Fast",
                desc: "Built on edge infrastructure for sub-second load times globally. Don't lose customers to loading screens."
              },
              {
                icon: <Shield className="h-8 w-8 text-blue-500" />,
                title: "Enterprise Security",
                desc: "Bank-grade encryption, automated backups, and 99.99% uptime guarantee. Your data is safe with us."
              },
              {
                icon: <Globe className="h-8 w-8 text-green-500" />,
                title: "Global Ready",
                desc: "Multi-currency, multi-language, and automated tax calculation for over 100 countries out of the box."
              },
              {
                icon: <BarChart3 className="h-8 w-8 text-purple-500" />,
                title: "Deep Analytics",
                desc: "Real-time insights into sales, customer behavior, and inventory. Make data-driven decisions."
              },
              {
                icon: <Layers className="h-8 w-8 text-red-500" />,
                title: "Drag & Drop Builder",
                desc: "Visual editor lets you customize every pixel of your store without writing a single line of code."
              },
              {
                icon: <Smartphone className="h-8 w-8 text-indigo-500" />,
                title: "Mobile First",
                desc: "Every store is automatically optimized for mobile devices, ensuring a perfect shopping experience anywhere."
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-800">
            <div className="p-4">
              <div className="text-5xl font-black text-primary mb-2">10k+</div>
              <div className="text-gray-400 font-medium uppercase tracking-widest text-sm">Active Stores</div>
            </div>
            <div className="p-4">
              <div className="text-5xl font-black text-primary mb-2">$2B+</div>
              <div className="text-gray-400 font-medium uppercase tracking-widest text-sm">Revenue Generated</div>
            </div>
            <div className="p-4">
              <div className="text-5xl font-black text-primary mb-2">99.9%</div>
              <div className="text-gray-400 font-medium uppercase tracking-widest text-sm">Uptime</div>
            </div>
            <div className="p-4">
              <div className="text-5xl font-black text-primary mb-2">24/7</div>
              <div className="text-gray-400 font-medium uppercase tracking-widest text-sm">Expert Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-black text-white sm:text-5xl mb-6">
            Ready to dominate your market?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of entrepreneurs who are building the future of commerce. Start your free trial today.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold rounded-full text-primary bg-white hover:bg-gray-50 transition-all shadow-2xl transform hover:-translate-y-1"
          >
            Start Your Empire
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <Logo className="mb-6 transform -translate-x-1" />
              <p className="text-gray-500 max-w-xs text-[15px] leading-relaxed">
                The most powerful multi-vendor e-commerce website builder. Launch your store on createvendor.shop in seconds.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-primary">Features</a></li>
                <li><a href="#" className="hover:text-primary">Pricing</a></li>
                <li><a href="#" className="hover:text-primary">Enterprise</a></li>
                <li><a href="#" className="hover:text-primary">Showcase</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-primary">Documentation</a></li>
                <li><a href="#" className="hover:text-primary">API Reference</a></li>
                <li><a href="#" className="hover:text-primary">Blog</a></li>
                <li><a href="#" className="hover:text-primary">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-primary">About</a></li>
                <li><a href="#" className="hover:text-primary">Careers</a></li>
                <li><a href="#" className="hover:text-primary">Legal</a></li>
                <li><a href="#" className="hover:text-primary">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-primary">Twitter</a></li>
                <li><a href="#" className="hover:text-primary">GitHub</a></li>
                <li><a href="#" className="hover:text-primary">Discord</a></li>
                <li><a href="#" className="hover:text-primary">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 Commerce Inc. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-sm text-gray-500 font-medium">Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
