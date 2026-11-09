import type { Metadata } from 'next';
export const metadata: Metadata = {title:'Administration | JX STUDIO',robots:{index:false,follow:false},alternates:{canonical:'/admin'}};
export default function Layout({children}:{children:React.ReactNode}) { return children; }
