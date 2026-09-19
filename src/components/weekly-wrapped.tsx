import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Share2 } from 'lucide-react';
import './weekly-wrapped.css';

// ─── API Keys ─────────────────────────────────────────────────────────────────
const GROQ_API_KEY      = '';
const ELEVENLABS_API_KEY = '';
const LUMINA_VOICE_ID   = 'Lw21wLjWqPPaL3TcYWek';

// ─── API Helpers ──────────────────────────────────────────────────────────────
const callGroqAPI = async (prompt: string): Promise<string> => {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', max_tokens: 300, temperature: 0.7,
        messages: [
          { role: 'system', content: 'You are Lumina, a deeply empathetic AI therapist.' },
          { role: 'user', content: prompt },
        ],
      }),
    });
    if (!res.ok) throw new Error('Groq Error');
    return (await res.json()).choices[0].message.content.trim();
  } catch { return "You've grown so much this week."; }
};

const playLuminaVoice = async (text: string, emotion: string) => {
  const settings: Record<string, object> = {
    sadness: { stability: 0.4, similarity_boost: 0.8, style: 0.2 },
    trust:   { stability: 0.7, similarity_boost: 0.9, style: 0.0 },
  };
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${LUMINA_VOICE_ID}`, {
      method: 'POST',
      headers: { 'xi-api-key': ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: 'eleven_turbo_v2_5', voice_settings: settings[emotion] || settings.trust }),
    });
    if (!res.ok) throw new Error('ElevenLabs Error');
    const buf = await res.arrayBuffer();
    const actx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const abuf = await actx.decodeAudioData(buf);
    const src  = actx.createBufferSource();
    src.buffer = abuf; src.connect(actx.destination); src.start(0);
    return src;
  } catch { /* silent fallback */ }
};

// ─── Color utils ──────────────────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  if (h.length < 6) return [30, 30, 40];
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}
function lerpRgb(a: [number,number,number], b: [number,number,number], t: number): [number,number,number] {
  return [Math.round(a[0]+(b[0]-a[0])*t), Math.round(a[1]+(b[1]-a[1])*t), Math.round(a[2]+(b[2]-a[2])*t)];
}

// ═════════════════════════════════════════════════════════════════════════════
// CANVAS 1 — Vortex (default galaxy for title/dominant/vocab/hardest/best/closing)
// ═════════════════════════════════════════════════════════════════════════════
const VortexCanvas: React.FC<{ bgColor: string }> = ({ bgColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const tRef      = useRef(0);
  const curC      = useRef<[number,number,number]>(hexToRgb(bgColor));
  const prevC     = useRef<[number,number,number]>(hexToRgb(bgColor));
  const lerpT     = useRef(1);

  useEffect(() => { prevC.current=[...curC.current] as any; curC.current=hexToRgb(bgColor); lerpT.current=0; }, [bgColor]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width=innerWidth; canvas.height=innerHeight; };
    resize(); addEventListener('resize', resize);

    type P = {angle:number;radius:number;z:number;speed:number;size:number;op:number;glow:boolean;life:number;ls:number;};
    const pts: P[] = Array.from({length:1800}, () => {
      const frac=Math.random(), arm=Math.floor(Math.random()*3);
      return { angle:(arm/3)*Math.PI*2+frac*Math.PI*4.5+(Math.random()-.5)*.7, radius:Math.pow(frac,.55),
        z:Math.random(), speed:.5+Math.random()*.9, size:.4+Math.random()*2.2, op:.25+Math.random()*.75,
        glow:Math.random()<.06, life:Math.random(), ls:.001+Math.random()*.003 };
    });

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      tRef.current += .016; const t=tRef.current;
      if(lerpT.current<1) lerpT.current=Math.min(1,lerpT.current+.012);
      const [cr,cg,cb] = lerpRgb(prevC.current,curC.current,lerpT.current);
      const W=canvas.width, H=canvas.height, cx=W/2, cy=H/2, maxR=Math.min(W,H)*.46;

      ctx.fillStyle=`rgb(${cr*.04|0},${cg*.04|0},${cb*.04|0})`; ctx.fillRect(0,0,W,H);
      const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,maxR*1.6);
      bg.addColorStop(0,`rgba(${cr},${cg},${cb},.10)`); bg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

      for(const p of pts) {
        p.life+=p.ls;
        if(p.life>1){ p.life=0; const f=Math.random(); p.radius=Math.pow(f,.55); p.angle=Math.random()*Math.PI*2+f*Math.PI*4; }
        p.angle+=(p.speed*.015)/(p.radius*.55+.12);
        const r=p.radius*maxR, wb=Math.sin(t*.6+p.angle*2.5)*3.5;
        const px=cx+Math.cos(p.angle)*(r+wb), py=cy+Math.sin(p.angle)*(r+wb)*.38;
        const lc=Math.sin(p.life*Math.PI), al=p.op*(.3+.7*p.z)*lc;
        const br=.55+p.radius*.45;
        const pr=Math.min(255,cr*br+60|0), pg=Math.min(255,cg*br+60|0), pb=Math.min(255,cb*br+60|0);
        const sz=p.size*(.35+p.z*.75);
        if(p.glow) {
          const ps=sz*(1.8+.5*Math.sin(t*2.5));
          const g=ctx.createRadialGradient(px,py,0,px,py,ps*4);
          g.addColorStop(0,`rgba(255,255,255,${al*.95})`); g.addColorStop(.25,`rgba(${pr},${pg},${pb},${al*.55})`); g.addColorStop(1,'rgba(0,0,0,0)');
          ctx.beginPath(); ctx.arc(px,py,ps*4,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
        } else { ctx.beginPath(); ctx.arc(px,py,sz,0,Math.PI*2); ctx.fillStyle=`rgba(${pr},${pg},${pb},${al})`; ctx.fill(); }
      }
      const bh=ctx.createRadialGradient(cx,cy,0,cx,cy,maxR*.38);
      bh.addColorStop(0,'rgba(0,0,0,1)'); bh.addColorStop(.6,'rgba(0,0,0,.4)'); bh.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=bh; ctx.fillRect(0,0,W,H);
      const rim=ctx.createRadialGradient(cx,cy,maxR*.28,cx,cy,maxR*.48);
      const rp=.12+.05*Math.sin(t*1.2);
      rim.addColorStop(0,`rgba(${cr},${cg},${cb},${rp})`); rim.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=rim; ctx.fillRect(0,0,W,H);
      const vig=ctx.createRadialGradient(cx,cy,maxR*.4,cx,cy,maxR*1.5);
      vig.addColorStop(0,'rgba(0,0,0,0)'); vig.addColorStop(1,'rgba(0,0,0,.88)');
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
    };
    draw();
    return () => { cancelAnimationFrame(rafRef.current); removeEventListener('resize',resize); };
  }, []);

  return <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none'}} />;
};

// ═════════════════════════════════════════════════════════════════════════════
// CANVAS 2 — Mood Journey: animated grid + line graph drawing itself
// Reference: minimal dark grid, glowing dots, line draws across 7 data points
// ═════════════════════════════════════════════════════════════════════════════
const JourneyCanvas: React.FC<{ scores: number[] }> = ({ scores }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width=innerWidth; canvas.height=innerHeight; };
    resize(); addEventListener('resize', resize);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      tRef.current += 0.012; const t = tRef.current;
      const W=canvas.width, H=canvas.height;

      // Dark bg with subtle warm tint
      ctx.fillStyle='rgb(8,6,8)'; ctx.fillRect(0,0,W,H);
      const bgG=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,W*.6);
      bgG.addColorStop(0,'rgba(80,40,60,.18)'); bgG.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=bgG; ctx.fillRect(0,0,W,H);

      // Chart area
      const padX=W*.18, padY=H*.22;
      const cw=W-padX*2, ch=H-padY*2;

      // Animated grid — lines fade in
      const gridAlpha=Math.min(1, t/2)*.18;
      ctx.strokeStyle=`rgba(255,255,255,${gridAlpha})`;
      ctx.lineWidth=.6;
      const COLS=6, ROWS=4;
      for(let i=0;i<=COLS;i++){
        const x=padX+cw*(i/COLS);
        ctx.beginPath(); ctx.moveTo(x,padY); ctx.lineTo(x,padY+ch); ctx.stroke();
      }
      for(let i=0;i<=ROWS;i++){
        const y=padY+ch*(i/ROWS);
        ctx.beginPath(); ctx.moveTo(padX,y); ctx.lineTo(padX+cw,y); ctx.stroke();
      }

      // Data points from actual mood scores (0-10 scale)
      const pts7 = scores.length===7 ? scores : Array.from({length:7},(_,i)=>scores[i]??5);
      const mapPt = (idx:number, sc:number) => ({
        x: padX + cw*(idx/6),
        y: padY + ch*(1 - (sc/10))
      });
      const mapped = pts7.map((s,i)=>mapPt(i,s));

      // Line draws itself over time — progress 0→1 over 3s
      const progress = Math.min(1, (t - 0.3) / 3);
      if(progress>0){
        // Draw line segment by segment
        ctx.strokeStyle='rgba(220,180,255,.85)';
        ctx.lineWidth=1.4;
        ctx.setLineDash([]);
        ctx.beginPath();
        let totalSegs = mapped.length-1;
        let drawn = progress * totalSegs;
        ctx.moveTo(mapped[0].x, mapped[0].y);
        for(let i=0;i<totalSegs;i++){
          if(i < Math.floor(drawn)){
            ctx.lineTo(mapped[i+1].x, mapped[i+1].y);
          } else {
            const frac=drawn-Math.floor(drawn);
            ctx.lineTo(mapped[i].x+(mapped[i+1].x-mapped[i].x)*frac, mapped[i].y+(mapped[i+1].y-mapped[i].y)*frac);
            break;
          }
        }
        ctx.stroke();

        // Glow on line
        ctx.strokeStyle='rgba(180,100,255,.22)';
        ctx.lineWidth=8;
        ctx.stroke();
      }

      // Dots appear one by one
      for(let i=0;i<mapped.length;i++){
        const dotProgress = Math.min(1, (t - 0.3 - i*0.35) / 0.4);
        if(dotProgress<=0) continue;
        const {x,y}=mapped[i];
        const pulse = 1 + .15*Math.sin(t*2+i);
        const r = 5*dotProgress*pulse;
        // Glow
        const grd=ctx.createRadialGradient(x,y,0,x,y,r*4);
        grd.addColorStop(0,`rgba(255,255,255,${.9*dotProgress})`);
        grd.addColorStop(.3,`rgba(220,160,255,${.35*dotProgress})`);
        grd.addColorStop(1,'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(x,y,r*4,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();
        // Solid dot
        ctx.beginPath(); ctx.arc(x,y,r*.9,0,Math.PI*2); ctx.fillStyle=`rgba(255,255,255,${dotProgress})`; ctx.fill();
      }

      // Vignette
      const vig=ctx.createRadialGradient(W/2,H/2,W*.2,W/2,H/2,W*.8);
      vig.addColorStop(0,'rgba(0,0,0,0)'); vig.addColorStop(1,'rgba(0,0,0,.75)');
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
    };
    draw();
    return () => { cancelAnimationFrame(rafRef.current); removeEventListener('resize',resize); };
  }, [scores]);

  return <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none'}} />;
};

// ═════════════════════════════════════════════════════════════════════════════
// CANVAS 3 — Person: neural fountain — curved lines explode from glowing base
// Reference: colored bezier lines from 2 source points, dots at tips, cyan+magenta+green
// ═════════════════════════════════════════════════════════════════════════════
const PersonCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width=innerWidth; canvas.height=innerHeight; };
    resize(); addEventListener('resize', resize);

    // Generate fixed tendrils
    const PALETTES = ['0,220,200','220,60,200','60,220,120','100,150,255','255,100,180','0,180,255'];
    type Tendril = { sx:number; sy:number; tx:number; ty:number; cx1:number; cy1:number; cx2:number; cy2:number; color:string; dotR:number; phase:number; speed:number; };
    const tendrils: Tendril[] = Array.from({length:70}, (_,i) => {
      const angle = (i/70)*Math.PI + Math.PI*.07; // spread from 0 to 180°
      const dist  = 0.35 + Math.random()*0.55;
      const color = PALETTES[Math.floor(Math.random()*PALETTES.length)];
      return {
        sx: 0, sy: 0, // set in draw based on canvas size
        tx: Math.cos(angle-(Math.random()-.5)*.4)*dist,
        ty: -Math.abs(Math.sin(angle))*dist - Math.random()*.3,
        cx1: (Math.random()-.5)*.5,
        cy1: -.15-Math.random()*.25,
        cx2: (Math.random()-.5)*.4,
        cy2: -dist*.5,
        color,
        dotR: 3+Math.random()*5,
        phase: Math.random()*Math.PI*2,
        speed: .5+Math.random()*.8,
      };
    });

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      tRef.current += .014; const t = tRef.current;
      const W=canvas.width, H=canvas.height;
      const ox=W/2, oy=H*.82; // source origin near bottom center
      const scale=Math.min(W,H)*.48;

      ctx.fillStyle='rgb(3,3,12)'; ctx.fillRect(0,0,W,H);
      // Deep blue-purple bg gradient
      const bg=ctx.createRadialGradient(ox,oy,0,ox,oy,H*.7);
      bg.addColorStop(0,'rgba(20,10,50,.9)'); bg.addColorStop(1,'rgba(0,0,8,.95)');
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

      // Source glow
      const srcG=ctx.createRadialGradient(ox,oy,0,ox,oy,60);
      srcG.addColorStop(0,'rgba(255,255,255,.95)'); srcG.addColorStop(.3,'rgba(180,160,255,.6)'); srcG.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.arc(ox,oy,60,0,Math.PI*2); ctx.fillStyle=srcG; ctx.fill();

      const progress = Math.min(1, t/2.5);

      for(const td of tendrils) {
        const tx2 = ox + td.tx*scale;
        const ty2 = oy + td.ty*scale;
        const c1x = ox + td.cx1*scale;
        const c1y = oy + td.cy1*scale;
        const c2x = ox + td.cx2*scale;
        const c2y = oy + td.cy2*scale;

        // Animated dot float
        const floatY = Math.sin(t*td.speed+td.phase)*8;
        const endX = tx2, endY = ty2 + floatY;

        // Draw bezier at current progress
        const steps=40;
        const drawn=Math.floor(progress*steps);
        if(drawn<1) continue;

        // Compute bezier point at t=progress
        const bezier=(tt:number)=>{
          const u=1-tt;
          return {
            x: u*u*u*ox + 3*u*u*tt*c1x + 3*u*tt*tt*c2x + tt*tt*tt*endX,
            y: u*u*u*oy + 3*u*u*tt*c1y + 3*u*tt*tt*c2y + tt*tt*tt*endY,
          };
        };

        ctx.beginPath();
        ctx.moveTo(ox,oy);
        for(let s=1;s<=drawn;s++){
          const bt=bezier(s/steps);
          ctx.lineTo(bt.x,bt.y);
        }
        ctx.strokeStyle=`rgba(${td.color},.65)`;
        ctx.lineWidth=1.2; ctx.stroke();

        // Glow stroke
        ctx.strokeStyle=`rgba(${td.color},.15)`;
        ctx.lineWidth=4; ctx.stroke();

        // Dot tip
        if(progress>0.6){
          const tipProgress=Math.min(1,(progress-0.6)/0.4);
          const tip=bezier(progress);
          const dotPulse=td.dotR*(1+.2*Math.sin(t*td.speed*2+td.phase));
          const dg=ctx.createRadialGradient(tip.x,tip.y,0,tip.x,tip.y,dotPulse*3);
          dg.addColorStop(0,`rgba(255,255,255,${.9*tipProgress})`);
          dg.addColorStop(.4,`rgba(${td.color},${.45*tipProgress})`);
          dg.addColorStop(1,'rgba(0,0,0,0)');
          ctx.beginPath(); ctx.arc(tip.x,tip.y,dotPulse*3,0,Math.PI*2); ctx.fillStyle=dg; ctx.fill();
          ctx.beginPath(); ctx.arc(tip.x,tip.y,dotPulse*.6,0,Math.PI*2); ctx.fillStyle=`rgba(255,255,255,${tipProgress})`; ctx.fill();
        }
      }

      const vig=ctx.createRadialGradient(W/2,H/2,W*.15,W/2,H/2,W*.7);
      vig.addColorStop(0,'rgba(0,0,0,0)'); vig.addColorStop(1,'rgba(0,0,0,.8)');
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
    };
    draw();
    return () => { cancelAnimationFrame(rafRef.current); removeEventListener('resize',resize); };
  }, []);

  return <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none'}} />;
};

// ═════════════════════════════════════════════════════════════════════════════
// CANVAS 4 — Trigger: Spotlight stage — beam from top, floating dust particles
// Reference: dark stage, single cone of white light from above
// ═════════════════════════════════════════════════════════════════════════════
const SpotlightCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width=innerWidth; canvas.height=innerHeight; };
    resize(); addEventListener('resize', resize);

    // Dust motes
    type Mote = { x:number; y:number; r:number; speed:number; drift:number; op:number; };
    const motes: Mote[] = Array.from({length:120},()=>({
      x: .3+Math.random()*.4, y: Math.random(), r: .5+Math.random()*2,
      speed: .0003+Math.random()*.0006, drift: (Math.random()-.5)*.0002, op: .1+Math.random()*.5,
    }));

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      tRef.current += .016; const t = tRef.current;
      const W=canvas.width, H=canvas.height;
      ctx.fillStyle='rgb(0,0,0)'; ctx.fillRect(0,0,W,H);

      // Spotlight beam — cone from top-center
      const bx=W/2, by=-20, beamW=W*.32, floorY=H*.88;
      const beam=ctx.createLinearGradient(bx,by,bx,floorY);
      beam.addColorStop(0,'rgba(255,255,255,.0)');
      beam.addColorStop(.15,'rgba(255,255,255,.22)');
      beam.addColorStop(.6,'rgba(255,250,240,.10)');
      beam.addColorStop(1,'rgba(255,255,255,.0)');
      ctx.beginPath();
      ctx.moveTo(bx,by);
      ctx.lineTo(bx-beamW/2,floorY);
      ctx.lineTo(bx+beamW/2,floorY);
      ctx.closePath();
      ctx.fillStyle=beam; ctx.fill();

      // Beam edge light rays
      for(let side=-1;side<=1;side+=2){
        const edgeG=ctx.createLinearGradient(bx,by,bx+side*beamW/2,floorY);
        edgeG.addColorStop(0,'rgba(255,255,255,0)');
        edgeG.addColorStop(.3,'rgba(255,255,255,.08)');
        edgeG.addColorStop(1,'rgba(255,255,255,0)');
        ctx.beginPath(); ctx.moveTo(bx,by);
        ctx.lineTo(bx+side*beamW/2,floorY);
        ctx.lineTo(bx+side*(beamW/2+12),floorY);
        ctx.closePath(); ctx.fillStyle=edgeG; ctx.fill();
      }

      // Floor reflection glow
      const fG=ctx.createRadialGradient(W/2,floorY,0,W/2,floorY,beamW*.7);
      fG.addColorStop(0,'rgba(255,255,248,.35)'); fG.addColorStop(.4,'rgba(220,220,200,.06)'); fG.addColorStop(1,'rgba(0,0,0,0)');
      ctx.beginPath(); ctx.ellipse(W/2,floorY,beamW*.55,20,0,0,Math.PI*2); ctx.fillStyle=fG; ctx.fill();

      // Stage floor line
      ctx.strokeStyle='rgba(255,255,255,.08)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(0,floorY); ctx.lineTo(W,floorY); ctx.stroke();

      // Dust motes inside beam
      for(const m of motes){
        m.y -= m.speed; m.x += m.drift;
        if(m.y<0){ m.y=1; m.x=.3+Math.random()*.4; }
        const px=m.x*W, py=m.y*H;
        // Only inside beam cone
        const coneW = (floorY-Math.max(0,py))/(floorY-by)*beamW/2;
        const inBeam=Math.abs(px-W/2)<coneW;
        if(!inBeam) continue;
        const pulse=m.op*(.7+.3*Math.sin(t*3+m.x*10));
        ctx.beginPath(); ctx.arc(px,py,m.r,0,Math.PI*2); ctx.fillStyle=`rgba(255,255,240,${pulse})`; ctx.fill();
      }

      const vig=ctx.createRadialGradient(W/2,H*.5,W*.08,W/2,H*.5,W*.7);
      vig.addColorStop(0,'rgba(0,0,0,0)'); vig.addColorStop(1,'rgba(0,0,0,.88)');
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
    };
    draw();
    return () => { cancelAnimationFrame(rafRef.current); removeEventListener('resize',resize); };
  }, []);

  return <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none'}} />;
};

// ═════════════════════════════════════════════════════════════════════════════
// CANVAS 5 — Silent Spiral: recursive rotating squares, fractal geometry
// Reference: white line on black, squares recursively rotate toward center
// ═════════════════════════════════════════════════════════════════════════════
const SpiralCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width=innerWidth; canvas.height=innerHeight; };
    resize(); addEventListener('resize', resize);

    const drawSquare=(cx:number,cy:number,size:number,angle:number,depth:number,t:number)=>{
      if(depth>28||size<1) return;
      const corners=[
        {x:cx+Math.cos(angle)*size,          y:cy+Math.sin(angle)*size},
        {x:cx+Math.cos(angle+Math.PI/2)*size, y:cy+Math.sin(angle+Math.PI/2)*size},
        {x:cx+Math.cos(angle+Math.PI)*size,   y:cy+Math.sin(angle+Math.PI)*size},
        {x:cx+Math.cos(angle+Math.PI*1.5)*size,y:cy+Math.sin(angle+Math.PI*1.5)*size},
      ];
      const alpha=Math.max(0,.08+(1-depth/28)*.35);
      ctx.strokeStyle=`rgba(255,255,255,${alpha})`;
      ctx.lineWidth=Math.max(.2,1.2-(depth*.04));
      ctx.beginPath();
      ctx.moveTo(corners[0].x,corners[0].y);
      for(let i=1;i<4;i++) ctx.lineTo(corners[i].x,corners[i].y);
      ctx.closePath(); ctx.stroke();
      // Draw lines from each corner to next-level corner
      for(let i=0;i<4;i++){
        const next=corners[(i+1)%4];
        const mid={x:(corners[i].x+next.x)*.5,y:(corners[i].y+next.y)*.5};
        ctx.beginPath(); ctx.moveTo(corners[i].x,corners[i].y); ctx.lineTo(mid.x,mid.y); ctx.stroke();
      }
      const shrink=.68+.04*Math.sin(t*.3+depth*.5);
      const rotStep=.15+t*.015;
      drawSquare(cx,cy,size*shrink,angle+rotStep,depth+1,t);
    };

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      tRef.current += .012; const t = tRef.current;
      const W=canvas.width, H=canvas.height;
      ctx.fillStyle='rgb(5,5,5)'; ctx.fillRect(0,0,W,H);
      const size=Math.min(W,H)*.46;
      const globalAngle=t*.04;
      drawSquare(W/2,H/2,size,globalAngle,0,t);
      // Subtle center glow
      const cg=ctx.createRadialGradient(W/2,H/2,0,W/2,H/2,100);
      cg.addColorStop(0,'rgba(255,255,255,.06)'); cg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=cg; ctx.fillRect(0,0,W,H);
      const vig=ctx.createRadialGradient(W/2,H/2,W*.35,W/2,H/2,W*.75);
      vig.addColorStop(0,'rgba(0,0,0,0)'); vig.addColorStop(1,'rgba(0,0,0,.85)');
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
    };
    draw();
    return () => { cancelAnimationFrame(rafRef.current); removeEventListener('resize',resize); };
  }, []);

  return <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none'}} />;
};

// ═════════════════════════════════════════════════════════════════════════════
// CANVAS 6 — Closing: Aurora wave — layered sinusoidal colour ribbons
// ═════════════════════════════════════════════════════════════════════════════
const AuroraCanvas: React.FC<{ bgColor: string }> = ({ bgColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);
  const curC  = useRef<[number,number,number]>(hexToRgb(bgColor));
  const prevC = useRef<[number,number,number]>(hexToRgb(bgColor));
  const lerpT = useRef(1);
  useEffect(() => { prevC.current=[...curC.current] as any; curC.current=hexToRgb(bgColor); lerpT.current=0; }, [bgColor]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width=innerWidth; canvas.height=innerHeight; };
    resize(); addEventListener('resize', resize);
    const BANDS=[
      {freq:.4,amp:.1,phase:0,     color:'120,80,255'},
      {freq:.3,amp:.08,phase:1.2,  color:'60,200,255'},
      {freq:.5,amp:.07,phase:2.4,  color:'255,80,180'},
      {freq:.25,amp:.12,phase:3.5, color:'80,255,180'},
      {freq:.6,amp:.06,phase:.8,   color:'200,120,255'},
    ];
    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      tRef.current += .012; const t=tRef.current;
      if(lerpT.current<1) lerpT.current=Math.min(1,lerpT.current+.012);
      const [cr,cg,cb] = lerpRgb(prevC.current,curC.current,lerpT.current);
      const W=canvas.width, H=canvas.height;
      ctx.fillStyle=`rgb(${cr*.05|0},${cg*.05|0},${cb*.05|0})`; ctx.fillRect(0,0,W,H);
      for(const band of BANDS){
        ctx.beginPath();
        for(let x=0;x<=W;x+=4){
          const y=H*.5+H*band.amp*Math.sin(band.freq*(x/W)*Math.PI*2+t+band.phase)
                  +H*.06*Math.sin(band.freq*2*(x/W)*Math.PI*2+t*.7+band.phase*1.3);
          x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        }
        ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
        const grad=ctx.createLinearGradient(0,H*.3,0,H*.8);
        grad.addColorStop(0,`rgba(${band.color},.22)`); grad.addColorStop(1,`rgba(${band.color},0)`);
        ctx.fillStyle=grad; ctx.fill();
        // Glow line
        ctx.beginPath();
        for(let x=0;x<=W;x+=4){
          const y=H*.5+H*band.amp*Math.sin(band.freq*(x/W)*Math.PI*2+t+band.phase)
                  +H*.06*Math.sin(band.freq*2*(x/W)*Math.PI*2+t*.7+band.phase*1.3);
          x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
        }
        ctx.strokeStyle=`rgba(${band.color},.55)`; ctx.lineWidth=1.2; ctx.stroke();
      }
      // Floating star particles
      // (reuse time as seed — deterministic per frame)
      for(let i=0;i<60;i++){
        const px=((Math.sin(i*127.1+t*.2)*0.5+0.5))*W;
        const py=((Math.sin(i*311.7+t*.15)*0.5+0.5))*H;
        const op=.1+.5*Math.abs(Math.sin(i+t*.8));
        ctx.beginPath(); ctx.arc(px,py,1+Math.sin(i)*1,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,255,${op})`; ctx.fill();
      }
      const vig=ctx.createRadialGradient(W/2,H/2,W*.2,W/2,H/2,W*.8);
      vig.addColorStop(0,'rgba(0,0,0,0)'); vig.addColorStop(1,'rgba(0,0,0,.75)');
      ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);
    };
    draw();
    return () => { cancelAnimationFrame(rafRef.current); removeEventListener('resize',resize); };
  }, []);

  return <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none'}} />;
};

// ═════════════════════════════════════════════════════════════════════════════
// SLIDE CANVAS DISPATCHER
// ═════════════════════════════════════════════════════════════════════════════
const SlideCanvas: React.FC<{ slide: SlideData }> = ({ slide }) => {
  switch(slide.type) {
    case 'journey': return <JourneyCanvas scores={slide.moodScores ?? [5,7,4,8,6,3,9]} />;
    case 'person':  return <PersonCanvas />;
    case 'trigger': return <SpotlightCanvas />;
    case 'spiral':  return <SpiralCanvas />;
    case 'closing': return <AuroraCanvas bgColor={slide.bgColor} />;
    default:        return <VortexCanvas bgColor={slide.bgColor} />;
  }
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface SlideData {
  id: string; type: string; bgColor: string; duration: number;
  title?: string; subtitle?: string; emotion?: string;
  days?: any[]; entries?: any[]; moodScores?: number[];
  dayName?: string; person?: string; trigger?: string; count?: number;
  words?: string[]; text?: string; score?: string; userName?: string;
  audio?: { text: string; emotion: string };
}

// ─── Main Component ───────────────────────────────────────────────────────────
const WeeklyWrapped: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [slides, setSlides]                          = useState<SlideData[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex]   = useState(0);
  const [isReady, setIsReady]                        = useState(false);
  const audioSourceRef = useRef<any>(null);
  const slideTimerRef  = useRef<ReturnType<typeof setTimeout>|null>(null);
  const userId = localStorage.getItem('lumina_userId');

  useEffect(() => {
    async function loadData() {
      let userName = 'Explorer';
      try { const d=await(await fetch(`http://localhost:5000/api/user/profile/${userId}`)).json(); if(d.name) userName=d.name; } catch {}

      let entries: any[] = [];
      try { const d=await(await fetch(`http://localhost:5000/api/journal/entries?userId=${userId}`)).json(); entries=d.entries||[]; } catch {}

      let brainNodes: Record<string,any> = {};
      try { const d=await(await fetch(`http://localhost:5000/api/user/memory-nodes/${userId}`)).json(); brainNodes=d.nodes||{}; } catch {}

      if(!entries.length) entries=[
        {createdAt:new Date(Date.now()-86400000).toISOString(), detectedEmotion:'joy', moodScore:8, triggers:['friends']},
        {createdAt:new Date(Date.now()-3*86400000).toISOString(), detectedEmotion:'sadness', moodScore:3, triggers:['work']},
      ];

      const emotionTally=entries.reduce((acc:any,e:any)=>{const m=e.detectedEmotion||'neutral';acc[m]=(acc[m]||0)+1;return acc;},{});
      const dominantEmotion=Object.keys(emotionTally).sort((a,b)=>emotionTally[b]-emotionTally[a])[0]||'neutral';

      const getPast7=()=>{const d=[];for(let i=6;i>=0;i--){const dt=new Date();dt.setDate(dt.getDate()-i);d.push({date:dt.toISOString().split('T')[0],dayName:dt.toLocaleDateString('en-US',{weekday:'long'})});}return d;};
      const last7=getPast7();

      const moodScores: number[] = last7.map((d: any)=>{
        const match=entries.find((e:any)=>new Date(e.createdAt).toISOString().split('T')[0]===d.date);
        return match?.moodScore??5;
      });

      const COL={
        title:'#000010',dominant:'#0a0010',journey:'#060308',
        missing:'#050505',person:'#03030e',trigger:'#000000',
        vocab:'#060610',hardest:'#000508',best:'#000a02',
        spiral:'#050505',closing:'#080012',
      };

      const weekDataStr=JSON.stringify({
        highestMood:Math.max(...entries.map((e:any)=>e.moodScore||5)),
        lowestMood:Math.min(...entries.map((e:any)=>e.moodScore||5)),
        dominantEmotion,
      });

      // Default AI text used immediately — no blocking
      const aiText={slide7:'It was a tough day, but you made it through.',slide8:'You found joy again.',slide10:'I am always here for you.'};

      // Helper to build the full slide array
      const buildSlides = (ai: typeof aiText): SlideData[] => {
        let topPerson='someone special';
        Object.keys(brainNodes).forEach(k=>{if(brainNodes[k].type==='person') topPerson=brainNodes[k].label;});
        const gen: SlideData[] = [
          {id:'s1',type:'title',bgColor:COL.title,title:'YOUR WEEK',subtitle:userName,
            audio:{text:`Hi ${userName}, let's reflect on your week.`,emotion:'trust'},duration:5},
          {id:'s2',type:'dominant',emotion:dominantEmotion,bgColor:COL.dominant,duration:5},
          {id:'s3',type:'journey',days:last7,entries,moodScores,bgColor:COL.journey,duration:7},
        ];
        last7.forEach(d=>{
          const has=entries.some((e:any)=>new Date(e.createdAt).toISOString().split('T')[0]===d.date);
          if(!has) gen.push({id:`miss-${d.date}`,type:'missing',dayName:d.dayName,bgColor:COL.missing,duration:3});
        });
        gen.push(
          {id:'s4',type:'person',person:topPerson,emotion:'love',bgColor:COL.person,duration:6},
          {id:'s5',type:'trigger',trigger:'work',count:4,bgColor:COL.trigger,duration:5},
          {id:'s6',type:'vocab',words:Object.keys(emotionTally),bgColor:COL.vocab,duration:5},
          {id:'s7',type:'hardest',text:ai.slide7,bgColor:COL.hardest,
            audio:{text:ai.slide7,emotion:'sadness'},duration:6},
          {id:'s8',type:'best',text:ai.slide8,bgColor:COL.best,
            audio:{text:ai.slide8,emotion:'trust'},duration:6},
          {id:'s9',type:'spiral',text:'Lumina noticed the spiral before you did.',bgColor:COL.spiral,duration:5},
        );
        const avg=(entries.reduce((a:number,b:any)=>a+(b.moodScore||7),0)/(entries.length||1)).toFixed(1);
        gen.push({id:'s10',type:'closing',text:ai.slide10,score:avg,userName,bgColor:COL.closing,
          audio:{text:ai.slide10,emotion:'trust'},duration:7});
        return gen;
      };

      // ✅ Show slides immediately with default text
      setSlides(buildSlides(aiText));
      setIsReady(true);

      // 🔄 Fetch AI text in background, update when ready
      callGroqAPI(`Week data: ${weekDataStr}. Return ONLY a JSON object with exactly these keys: slide7, slide8, slide10. Each value should be one short empathetic sentence.`)
        .then(raw => {
          try {
            const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? '{}');
            if (parsed.slide7 || parsed.slide8 || parsed.slide10) {
              setSlides(buildSlides({...aiText,...parsed}));
            }
          } catch { /* keep defaults */ }
        })
        .catch(() => { /* keep defaults */ });
    }
    loadData();
    return ()=>{ try{audioSourceRef.current?.stop();}catch{} slideTimerRef.current&&clearTimeout(slideTimerRef.current); };
  },[userId]);

  const handleNext = useCallback(()=>setCurrentSlideIndex(p=>Math.min(p+1,slides.length-1)),[slides.length]);
  const handlePrev = useCallback(()=>setCurrentSlideIndex(p=>Math.max(p-1,0)),[]);

  const handleClick=(e:React.MouseEvent)=>{
    if((e.target as HTMLElement).closest('.wrapped-close-btn')||(e.target as HTMLElement).closest('.share-btn')) return;
    e.clientX<window.innerWidth/3?handlePrev():handleNext();
  };

  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{ if(e.key==='ArrowRight') handleNext(); if(e.key==='ArrowLeft') handlePrev(); };
    window.addEventListener('keydown',h); return()=>window.removeEventListener('keydown',h);
  },[handleNext,handlePrev]);

  useEffect(()=>{
    if(!isReady||!slides.length) return;
    let cancelled=false;
    const slide=slides[currentSlideIndex];
    try{audioSourceRef.current?.stop();}catch{} audioSourceRef.current=null;
    if(slide.audio) playLuminaVoice(slide.audio.text,slide.audio.emotion).then(src=>{if(cancelled&&src){try{src.stop();}catch{}}else audioSourceRef.current=src;});
    slideTimerRef.current&&clearTimeout(slideTimerRef.current);
    slideTimerRef.current=setTimeout(handleNext,slide.duration*1000);
    return()=>{ cancelled=true; slideTimerRef.current&&clearTimeout(slideTimerRef.current); };
  },[currentSlideIndex,isReady,slides,handleNext]);

  if(!isReady) return (
    <div className="wrapped-overlay" style={{justifyContent:'center',alignItems:'center'}}>
      <VortexCanvas bgColor="#001030" />
      <motion.div style={{position:'relative',zIndex:10,color:'#fff',fontSize:'1.2rem',letterSpacing:'.2em'}}
        animate={{opacity:[.4,1,.4]}} transition={{repeat:Infinity,duration:1.5}}>✦ LOADING YOUR WEEK</motion.div>
    </div>
  );

  const current=slides[currentSlideIndex];

  return (
    <div className="wrapped-overlay" onClick={handleClick}>
      <button className="wrapped-close-btn" onClick={e=>{e.stopPropagation();onClose();}}><X size={26}/></button>

      <div className="wrapped-progress-container">
        {slides.map((s,i)=>(
          <div key={i} className="wrapped-progress-bar">
            <div className="wrapped-progress-fill" style={{
              width:i<currentSlideIndex?'100%':i===currentSlideIndex?'100%':'0%',
              transition:i===currentSlideIndex?`width ${s.duration}s linear`:'none',
            }}/>
          </div>
        ))}
      </div>

      {slides.map((slide,i)=>{
        const isActive=i===currentSlideIndex;
        return (
          <div key={slide.id} className={`wrapped-slide ${isActive?'active':''}`}>
            {/* Each slide gets its own animated canvas */}
            {isActive && <SlideCanvas slide={slide} />}
            {slide.type==='missing' && <div className="film-grain"/>}

            <div style={{position:'relative',zIndex:10,display:'flex',flexDirection:'column',
              alignItems:'center',justifyContent:'center',width:'100%',height:'100%',padding:'2rem',maxWidth:'880px',margin:'0 auto'}}>

              {slide.type==='title' && (
                <motion.div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'1.5rem'}}
                  initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:.9,ease:[.16,1,.3,1]}}>
                  <p style={{fontSize:'.8rem',letterSpacing:'.45em',opacity:.45,color:'#fff'}}>LUMINA WEEKLY</p>
                  <h1 className="wrapped-title">{slide.title}</h1>
                  <p style={{fontSize:'2.2rem',opacity:.8,color:'#fff',fontWeight:500}}>{slide.subtitle}</p>
                </motion.div>
              )}

              {slide.type==='dominant' && (
                <motion.div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'1rem'}}
                  initial={{opacity:0,scale:.65}} animate={{opacity:1,scale:1}} transition={{duration:1,ease:[.16,1,.3,1]}}>
                  <p className="wrapped-subtitle" style={{opacity:.5}}>YOU FELT MOST</p>
                  <h1 className="wrapped-huge-word" style={{fontSize:'10rem',lineHeight:1}}>{slide.emotion}</h1>
                  <p className="wrapped-subtitle" style={{opacity:.4}}>THIS WEEK</p>
                </motion.div>
              )}

              {slide.type==='journey' && (
                <motion.div style={{display:'flex',flexDirection:'column',alignItems:'center',width:'100%',gap:'2rem'}}
                  initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.6}}>
                  <h2 className="wrapped-title" style={{fontSize:'2.8rem'}}>MOOD JOURNEY</h2>
                  <p style={{color:'rgba(255,255,255,.35)',fontSize:'.8rem',letterSpacing:'.3em'}}>7 DAYS · MOOD SCORE</p>
                </motion.div>
              )}

              {slide.type==='missing' && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.5}}>
                  <h2 className="wrapped-title" style={{fontSize:'2.5rem',opacity:.3}}>no entry</h2>
                  <p className="wrapped-subtitle" style={{opacity:.25}}>{slide.dayName}</p>
                </motion.div>
              )}

              {slide.type==='person' && (
                <motion.div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'1.2rem'}}
                  initial={{opacity:0,y:50}} animate={{opacity:1,y:0}} transition={{duration:.9}}>
                  <p style={{color:'rgba(255,255,255,.4)',letterSpacing:'.3em',fontSize:'.8rem'}}>THE PERSON WHO LIVED IN YOUR MIND</p>
                  <h1 className="wrapped-title" style={{fontSize:'6rem'}}>{slide.person}</h1>
                  <p style={{color:'rgba(255,255,255,.55)',fontSize:'1.1rem'}}>Appeared with <strong className="uppercase">{slide.emotion}</strong></p>
                </motion.div>
              )}

              {slide.type==='trigger' && (
                <motion.div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'1rem'}}
                  initial={{opacity:0,scale:.8}} animate={{opacity:1,scale:1}} transition={{duration:.8}}>
                  <p style={{color:'rgba(255,255,255,.4)',letterSpacing:'.35em',fontSize:'.8rem'}}>YOUR BIGGEST TRIGGER</p>
                  <h1 className="wrapped-huge-word">{slide.trigger}</h1>
                  <p style={{color:'rgba(255,255,255,.55)',fontSize:'1.2rem'}}>appeared <strong>{slide.count}</strong> times</p>
                </motion.div>
              )}

              {slide.type==='vocab' && (
                <motion.div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'2rem'}}
                  initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.7}}>
                  <p style={{color:'rgba(255,255,255,.4)',letterSpacing:'.3em',fontSize:'.8rem'}}>YOUR EMOTIONAL VOCABULARY</p>
                  <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'1.5rem'}}>
                    {slide.words?.map((w,idx)=>(
                      <motion.span key={idx}
                        initial={{opacity:0,y:20}} animate={{opacity:.75,y:0}}
                        transition={{delay:idx*.1,duration:.5}}
                        style={{fontSize:`${2.5+idx*.2}rem`,fontWeight:900,color:'#fff',
                          transform:`rotate(${(Math.random()-.5)*14}deg)`,letterSpacing:'-.02em'}}>
                        {w}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {slide.type==='hardest' && (
                <motion.div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'2rem'}}
                  initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:.9}}>
                  <p style={{color:'rgba(255,255,255,.35)',letterSpacing:'.3em',fontSize:'.75rem'}}>HARDEST MOMENT</p>
                  <h2 style={{fontSize:'2.6rem',fontWeight:800,lineHeight:1.25,maxWidth:'680px',color:'#fff',textAlign:'center'}}>
                    "{slide.text}"
                  </h2>
                </motion.div>
              )}

              {slide.type==='best' && (
                <motion.div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'2rem'}}
                  initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:.9}}>
                  <p style={{color:'rgba(255,255,255,.35)',letterSpacing:'.3em',fontSize:'.75rem'}}>BEST MOMENT</p>
                  <h2 style={{fontSize:'2.6rem',fontWeight:800,lineHeight:1.25,maxWidth:'680px',color:'#fff',textAlign:'center'}}>
                    "{slide.text}"
                  </h2>
                </motion.div>
              )}

              {slide.type==='spiral' && (
                <motion.div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'2rem'}}
                  initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1.3}}>
                  <p style={{color:'rgba(255,255,255,.3)',letterSpacing:'.4em',fontSize:'.75rem'}}>PATTERN DETECTED</p>
                  <h2 style={{fontSize:'2.2rem',fontWeight:700,fontStyle:'italic',opacity:.65,color:'#fff',
                    maxWidth:'580px',lineHeight:1.5,textAlign:'center'}}>{slide.text}</h2>
                </motion.div>
              )}

              {slide.type==='closing' && (
                <motion.div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'1rem'}}
                  initial={{opacity:0,scale:.88}} animate={{opacity:1,scale:1}} transition={{duration:1,ease:[.16,1,.3,1]}}>
                  <h1 className="wrapped-huge-word" style={{fontSize:'9rem'}}>{slide.score}</h1>
                  <p style={{color:'rgba(255,255,255,.4)',letterSpacing:'.3em',fontSize:'.8rem'}}>AVERAGE MOOD SCORE</p>
                  <h2 style={{fontSize:'1.75rem',fontStyle:'italic',opacity:.85,maxWidth:'600px',
                    textAlign:'center',color:'#fff',marginTop:'1.5rem',lineHeight:1.55}}>"{slide.text}"</h2>
                  <p style={{color:'rgba(255,255,255,.3)',fontSize:'.8rem',letterSpacing:'.4em',marginTop:'2rem'}}>✦ LUMINA</p>
                  {i===slides.length-1&&(
                    <button className="share-btn" style={{display:'flex',alignItems:'center',gap:'.5rem',marginTop:'1.5rem'}} onClick={e=>e.stopPropagation()}>
                      <Share2 size={16}/> Share Your Week
                    </button>
                  )}
                </motion.div>
              )}

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyWrapped;
