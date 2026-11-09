import { ImageResponse } from 'next/og';
export const alt = 'JX STUDIO – Design. Development. Digital Solutions.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return new ImageResponse(<div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'space-between',background:'#090b10',color:'#fff',padding:72}}><div style={{fontSize:32,letterSpacing:8}}>JX STUDIO</div><div style={{display:'flex',flexDirection:'column',fontSize:76,fontWeight:700,lineHeight:1.1}}><span>Design. Development.</span><span style={{color:'#82a8ff'}}>Digital Solutions.</span></div><div style={{fontSize:24,color:'#aeb7c8'}}>Websites · Software · KI · Bremen & Stuhr</div></div>,size);
}
