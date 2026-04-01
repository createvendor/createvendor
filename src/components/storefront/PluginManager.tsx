'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';
import { PluginData } from '@/types';

interface PluginManagerProps {
    plugins?: PluginData[];
}

export const PluginManager: React.FC<PluginManagerProps> = ({ plugins }) => {
    if (!plugins || plugins.length === 0) return null;

    return (
        <>
            {plugins.map((plugin) => {
                if (!plugin.isEnabled || !plugin.config) return null;

                switch (plugin.id) {
                    case 'google-analytics':
                        return (
                            <React.Fragment key={plugin.id}>
                                <Script
                                    src={`https://www.googletagmanager.com/gtag/js?id=${plugin.config.measurementId}`}
                                    strategy="afterInteractive"
                                />
                                <Script id="google-analytics-init" strategy="afterInteractive">
                                    {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${plugin.config.measurementId}', {
                      page_path: window.location.pathname,
                    });
                  `}
                                </Script>
                            </React.Fragment>
                        );

                    case 'facebook-pixel':
                        return (
                            <Script id="facebook-pixel-init" strategy="afterInteractive" key={plugin.id}>
                                {`
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${plugin.config.pixelId}');
                  fbq('track', 'PageView');
                `}
                            </Script>
                        );

                    case 'microsoft-clarity':
                        return (
                            <Script id="microsoft-clarity-init" strategy="afterInteractive" key={plugin.id}>
                                {`
                  (function(c,l,a,r,i,t,y){
                      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                  })(window, document, "clarity", "script", "${plugin.config.clarityId}");
                `}
                            </Script>
                        );

                    case 'tawk-to':
                        return (
                            <Script id="tawk-to-init" strategy="afterInteractive" key={plugin.id}>
                                {`
                  var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
                  (function(){
                  var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
                  s1.async=true;
                  s1.src='https://embed.tawk.to/${plugin.config.propertyId}/${plugin.config.widgetId}';
                  s1.charset='UTF-8';
                  s1.setAttribute('crossorigin','*');
                  s0.parentNode.insertBefore(s1,s0);
                  })();
                `}
                            </Script>
                        );

                    case 'whatsapp':
                        return (
                            <a
                                key={plugin.id}
                                href={`https://wa.me/${plugin.config.phone}?text=${encodeURIComponent(plugin.config.message || '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="fixed bottom-6 right-6 z-[9999] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center animate-bounce"
                                title="Chat with us on WhatsApp"
                            >
                                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-white">
                                    <path d="M12.031 6.172c-2.32 0-4.28 1.961-4.28 4.271 0 .743.2 1.411.543 2.013L7.747 14.4l2.134-.543c.563.308 1.211.48 1.903.48 2.32 0 4.28-1.961 4.28-4.271 0-2.31-1.96-4.271-4.033-3.894zm-.001 7.701c-.644 0-1.24-.188-1.748-.521l-.125-.073-1.3.332.348-1.232-.089-.141a3.52 3.52 0 01-.541-1.892c0-1.956 1.594-3.55 3.55-3.55a3.55 3.55 0 013.55 3.55c0 1.956-1.594 3.55-3.55 3.55zM12 2C6.477 2 2 6.477 2 12c0 1.84.498 3.563 1.365 5.048L2 22l5.09-1.332A9.956 9.956 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.63 0-3.156-.47-4.444-1.278l-.318-.198-3.048.798.811-2.924-.22-.351A7.952 7.952 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
                                </svg>
                            </a>
                        );

                    case 'shop-ai':
                        // Simple AI Chatbot UI (Expansion point for real AI)
                        return (
                            <div
                                key={plugin.id}
                                className="fixed bottom-24 right-6 z-[9999] bg-indigo-600 text-white p-4 rounded-3xl shadow-2xl hover:scale-110 transition-transform cursor-pointer flex items-center gap-2 group border-4 border-white"
                            >
                                <div className="bg-white/20 p-2 rounded-xl">
                                    <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-white fill-none stroke-[2]">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{plugin.config.botName || 'AI Assistant'}</span>
                                    <span className="text-xs font-bold leading-none">{plugin.config.welcomeMsg || 'How can I help you?'}</span>
                                </div>
                            </div>
                        )

                    default:
                        return null;
                }
            })}
        </>
    );
};
