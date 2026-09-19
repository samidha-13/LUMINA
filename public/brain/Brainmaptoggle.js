// ================================================================
//  LUMINA — brainMapToggle.js  (SINGLE FILE, ALL-IN-ONE)
//  Questions: People→Emotion, Life→Emotion, Trauma→Emotion
//  Nodes build LIVE as you answer. Drop-in for brain HTML.
// ================================================================
(function(){
'use strict';

// ── 1. EMOTION SYSTEM ─────────────────────────────────────────
const EC={Joy:'#d4a843',Trust:'#3a8f6e',Fear:'#8b2fc9',Anger:'#c0392b',
  Sadness:'#3a5fa8',Surprise:'#2a7fbf',Anticipation:'#c07a2b',Disgust:'#6b8c3a',Neutral:'#4a5568'};

const WE={happy:'Joy',joy:'Joy',love:'Joy',loved:'Joy',great:'Joy',amazing:'Joy',wonderful:'Joy',
  cheerful:'Joy',glad:'Joy',pleased:'Joy',delighted:'Joy',thrilled:'Joy',content:'Joy',
  grateful:'Joy',proud:'Joy',enjoy:'Joy',bliss:'Joy',laugh:'Joy',smile:'Joy',excited:'Joy',
  eager:'Anticipation',motivated:'Anticipation',driven:'Anticipation',ambitious:'Anticipation',
  hoping:'Anticipation',hope:'Anticipation',hopeful:'Anticipation',dream:'Anticipation',
  curious:'Anticipation',inspired:'Anticipation',energetic:'Anticipation',planning:'Anticipation',
  trust:'Trust',safe:'Trust',secure:'Trust',comfortable:'Trust',confident:'Trust',
  calm:'Trust',peaceful:'Trust',peace:'Trust',relaxed:'Trust',stable:'Trust',
  loyal:'Trust',supported:'Trust',understood:'Trust',accepted:'Trust',connected:'Trust',
  fear:'Fear',afraid:'Fear',scared:'Fear',anxious:'Fear',anxiety:'Fear',nervous:'Fear',
  worried:'Fear',worry:'Fear',stress:'Fear',stressed:'Fear',panic:'Fear',overwhelmed:'Fear',
  helpless:'Fear',insecure:'Fear',uncertain:'Fear',doubt:'Fear',terrified:'Fear',
  pressure:'Fear',uneasy:'Fear',dread:'Fear',intimidated:'Fear',vulnerable:'Fear',
  anger:'Anger',angry:'Anger',frustrated:'Anger',annoyed:'Anger',irritated:'Anger',
  mad:'Anger',furious:'Anger',rage:'Anger',upset:'Anger',resentful:'Anger',bitter:'Anger',
  outraged:'Anger',hate:'Anger',hostile:'Anger',conflict:'Anger',aggressive:'Anger',
  sad:'Sadness',sadness:'Sadness',depressed:'Sadness',depression:'Sadness',lonely:'Sadness',
  loneliness:'Sadness',alone:'Sadness',grief:'Sadness',heartbroken:'Sadness',hurt:'Sadness',
  pain:'Sadness',crying:'Sadness',miss:'Sadness',missing:'Sadness',lost:'Sadness',
  loss:'Sadness',hopeless:'Sadness',empty:'Sadness',numb:'Sadness',broken:'Sadness',
  disappointed:'Sadness',unhappy:'Sadness',melancholy:'Sadness',despair:'Sadness',
  isolated:'Sadness',rejected:'Sadness',
  surprised:'Surprise',shocked:'Surprise',shock:'Surprise',unexpected:'Surprise',
  stunned:'Surprise',confused:'Surprise',
  disgusted:'Disgust',gross:'Disgust',sick:'Disgust',tired:'Disgust',
  exhausted:'Disgust',drained:'Disgust',burnout:'Disgust',toxic:'Disgust',
  okay:'Neutral',fine:'Neutral',normal:'Neutral',neutral:'Neutral',alright:'Neutral'};

function emo(text){
  const ws=text.toLowerCase().replace(/[^a-z\s]/g,' ').split(/\s+/);
  const order=['Sadness','Fear','Anger','Disgust','Joy','Anticipation','Trust','Surprise'];
  const found=new Set();
  ws.forEach(w=>{if(WE[w])found.add(WE[w]);});
  if(!found.size)return'Neutral';
  for(const p of order)if(found.has(p))return p;
  return[...found][0];
}

// ── 2. KEYWORD EXTRACT ────────────────────────────────────────
const LA={work:'Work',job:'Work',office:'Work',company:'Work',workplace:'Work',
  career:'Career',internship:'Work',school:'School',class:'School',homework:'School',
  college:'College',university:'College',campus:'College',degree:'College',
  exam:'College',exams:'College',study:'College',assignment:'College',semester:'College',
  family:'Family',home:'Family',parents:'Family',
  relationship:'Relationship',dating:'Relationship',breakup:'Relationship',
  marriage:'Relationship',divorce:'Relationship',
  health:'Health',hospital:'Health',doctor:'Health',therapy:'Health',
  sleep:'Health',gym:'Health',fitness:'Health',diet:'Health',exercise:'Health',
  money:'Finance',debt:'Finance',loan:'Finance',savings:'Finance',bills:'Finance',rent:'Finance',
  friends:'Social Life',social:'Social Life',party:'Social Life',hangout:'Social Life',
  travel:'Travel',trip:'Travel',vacation:'Travel',holiday:'Travel',
  music:'Hobbies',gaming:'Hobbies',reading:'Hobbies',cooking:'Hobbies',
  dancing:'Hobbies',singing:'Hobbies',sports:'Hobbies',movies:'Hobbies',drawing:'Hobbies'};

const PROLES=['mom','mother','dad','father','brother','sister','sibling','friend',
  'best friend','boyfriend','girlfriend','partner','spouse','husband','wife','teacher',
  'professor','manager','boss','colleague','coworker','classmate','uncle','aunt',
  'grandpa','grandma','grandfather','grandmother','cousin','neighbor','roommate'];

const STOP=new Set(['i','me','my','we','us','our','you','your','he','she','it','they',
  'them','the','a','an','and','or','but','so','in','on','at','to','for','of','with',
  'that','this','is','are','was','were','be','been','have','has','had','do','does',
  'did','will','would','could','should','can','not','no','yes','very','really','just',
  'like','also','about','when','what','how','why','who','which','where','there','here',
  'then','than','get','got','make','made','feel','felt','think','thought','know','knew',
  'lot','much','many','some','any','every','all','always','never','sometimes','often',
  'still','even','only','too','more','most','less','something','anything','nothing',
  'everything','because','since','lately','recently','right','now','today','yesterday',
  'actually','basically','already','again','back','well','want','need','going','come',
  'came','let','way','bit','quite','pretty','little','big','small','long','short']);

function capWord(s){return s?s.charAt(0).toUpperCase()+s.slice(1):'';}

function extractPeople(text){
  const lower=text.toLowerCase();
  const found=[];
  PROLES.forEach(r=>{if(lower.includes(r)){const l=capWord(r);if(!found.includes(l))found.push(l);}});
  const re=/(?<=[a-z,\s])\b([A-Z][a-z]{2,})\b/g;let m;
  while((m=re.exec(text))!==null){const n=m[1];if(!STOP.has(n.toLowerCase())&&!found.includes(n))found.push(n);}
  return found;
}

function extractAreas(text){
  const ws=text.toLowerCase().replace(/[^a-z\s]/g,' ').split(/\s+/);
  const found=new Set();
  ws.forEach(w=>{const a=LA[w];if(a)found.add(a);});
  for(let i=0;i<ws.length-1;i++){const bg=ws[i]+' '+ws[i+1];const a=LA[bg];if(a)found.add(a);}
  return[...found];
}

// ── 3. GRAPH ENGINE ───────────────────────────────────────────
const SK='lumina_v4';
const NC={self:'#ec4899',person:'#3b82f6',lifeArea:'#22c55e',
  emotion:'#f0b429',trauma:'#ef4444',memory:'#a78bfa'};
const NR={self:22,trauma:16,emotion:13,person:12,lifeArea:12,memory:10};

const G={
  nodes:{},edges:[],userName:null,
  profile:{internalizer:0,externalizer:0,avoidant:0,dominant:'Balanced',
    primaryEmotion:'Neutral',emotionCounts:{},stressors:[],strengths:[]},

  addNode({id,type,label,emotion='Neutral',strength=0.5}){
    if(!id||!type||!label)return null;
    if(this.nodes[id]){
      const n=this.nodes[id];n.strength=Math.min(1,n.strength+0.12);
      n.mentions=(n.mentions||1)+1;n.emotion=emotion;this._sv();return n;
    }
    const node={id,type,label,emotion,strength,mentions:1,timestamp:Date.now(),connections:[]};
    this.nodes[id]=node;this._sv();return node;
  },

  addEdge(src,tgt,rel='linked',emotion='Neutral'){
    if(!src||!tgt||src===tgt)return;
    if(!this.nodes[src]||!this.nodes[tgt])return;
    const ex=this.edges.find(e=>(e.source===src&&e.target===tgt)||(e.source===tgt&&e.target===src));
    if(ex){ex.strength=Math.min(1,ex.strength+0.15);ex.emotion=emotion;this._sv();return;}
    this.edges.push({source:src,target:tgt,rel,emotion,strength:0.5});
    if(!this.nodes[src].connections.includes(tgt))this.nodes[src].connections.push(tgt);
    if(!this.nodes[tgt].connections.includes(src))this.nodes[tgt].connections.push(src);
    this._sv();
  },

  // Person + emotion edge
  person(label,emotion){
    const isNew=!this.nodes[label];
    const n=this.addNode({id:label,type:'person',label,emotion});
    if(this.userName)this.addEdge(this.userName,label,'knows',emotion);
    if(emotion!=='Neutral'){
      this.addNode({id:emotion,type:'emotion',label:emotion,emotion});
      this.addEdge(label,emotion,'triggers',emotion);
    }
    this._upProf(emotion);
    return isNew?n:null;
  },

  // Life area + emotion edge
  life(label,emotion){
    const isNew=!this.nodes[label];
    const n=this.addNode({id:label,type:'lifeArea',label,emotion});
    if(this.userName)this.addEdge(this.userName,label,'part_of_life',emotion);
    if(emotion!=='Neutral'){
      this.addNode({id:emotion,type:'emotion',label:emotion,emotion});
      this.addEdge(label,emotion,'causes',emotion);
    }
    if(['Fear','Anger'].includes(emotion)&&!this.profile.stressors.includes(label))this.profile.stressors.push(label);
    if(['Joy','Trust'].includes(emotion)&&!this.profile.strengths.includes(label))this.profile.strengths.push(label);
    this._upProf(emotion);
    return isNew?n:null;
  },

  // Trauma + life area + emotion
  trauma(label,areaLabel,emotion){
    const isNew=!this.nodes[label];
    const n=this.addNode({id:label,type:'trauma',label,emotion,strength:0.9});
    if(this.userName)this.addEdge(this.userName,label,'experienced',emotion);
    if(areaLabel){
      this.addNode({id:areaLabel,type:'lifeArea',label:areaLabel,emotion});
      if(this.userName)this.addEdge(this.userName,areaLabel,'part_of_life',emotion);
      this.addEdge(label,areaLabel,'happened_in',emotion);
    }
    if(emotion!=='Neutral'){
      this.addNode({id:emotion,type:'emotion',label:emotion,emotion});
      this.addEdge(label,emotion,'caused',emotion);
    }
    if(['Fear','Sadness'].includes(emotion))this.profile.internalizer++;
    if(['Anger','Disgust'].includes(emotion))this.profile.externalizer++;
    if(areaLabel&&['Fear','Anger'].includes(emotion)&&!this.profile.stressors.includes(areaLabel))
      this.profile.stressors.push(areaLabel);
    this._upProf(emotion);
    return isNew?n:null;
  },

  _upProf(emotion){
    this.profile.emotionCounts[emotion]=(this.profile.emotionCounts[emotion]||0)+1;
    const s=Object.entries(this.profile.emotionCounts).sort((a,b)=>b[1]-a[1]);
    if(s.length)this.profile.primaryEmotion=s[0][0];
    const{internalizer:i,externalizer:e,avoidant:a}=this.profile;
    this.profile.dominant=i>e&&i>a?'Internalizer':e>i&&e>a?'Externalizer':a>i?'Avoidant':'Balanced';
    this._sv();
  },

  neighbourhood(name){
    const s=new Set([name]);
    this.edges.forEach(e=>{
      if(e.emotion===name||e.source===name||e.target===name){s.add(e.source);s.add(e.target);}
    });
    return s;
  },

  toD3(){
    const nodeIds = new Set(Object.keys(this.nodes));
    return {
      nodes: Object.values(this.nodes).map(n => ({...n})),
      links: this.edges
        .filter(e => {
          const s = typeof e.source === 'object' ? e.source.id : e.source;
          const t = typeof e.target === 'object' ? e.target.id : e.target;
          return nodeIds.has(s) && nodeIds.has(t);
        })
        .map(e => ({...e}))
    };
  },

  reset(){
    this.nodes={};this.edges=[];this.userName=null;
    this.profile={internalizer:0,externalizer:0,avoidant:0,dominant:'Balanced',
      primaryEmotion:'Neutral',emotionCounts:{},stressors:[],strengths:[]};
    localStorage.removeItem(SK);
  },

  _sv(){try{localStorage.setItem(SK,JSON.stringify(
    {nodes:this.nodes,edges:this.edges,userName:this.userName,profile:this.profile}
  ));}catch(e){}},

  load(){
    try{
      const r=localStorage.getItem(SK);if(!r)return false;
      const d=JSON.parse(r);
      this.nodes=d.nodes||{};this.edges=d.edges||[];
      this.userName=d.userName||null;this.profile={...this.profile,...d.profile};
      return Object.keys(this.nodes).length>0;
    }catch(e){return false;}
  }
};

// ── 4. QUESTIONS ──────────────────────────────────────────────
// Each question: text, hint, what nodes it creates, process()
// SECTION questions show a banner transition, no input needed

const ST={lastPeople:[],lastAreas:[],lastTrauma:null};

const QS=[
  // INTRO
  {id:'q_name',phase:'INTRO',nodes:'self',
   text:"Hi, I'm Lumina. What's your name?",
   hint:'Just your first name...',
   process(a){
     const nm=a.split(/\s+/)[0];G.userName=nm;
     const n=G.addNode({id:nm,type:'self',label:nm,strength:1.0});
     return n?[n]:[];
   }},

  // ── PEOPLE SECTION ──
  {id:'s_people',phase:'SECTION',
   title:'👤 People in Your World',
   desc:"Let's map the people who matter most to you."},

  {id:'q_family',phase:'PERSON',nodes:'person',
   text:(g)=>`${g.userName}, who are the most important family members in your life? (names or roles, comma separated)`,
   hint:'e.g. Mom, Dad, Sister, Uncle Raj...',multi:true,
   process(a){
     const ps=a.split(/[,،;]+/).map(s=>capWord(s.trim())).filter(s=>s.length>1);
     ST.lastPeople=ps;
     return ps.map(p=>{
       const n=G.addNode({id:p,type:'person',label:p,emotion:'Neutral'});
       if(G.userName)G.addEdge(G.userName,p,'family','Neutral');
       return n&&n.mentions===1?n:null;
     }).filter(Boolean);
   }},

  {id:'q_family_emo',phase:'PERSON_EMO',nodes:'emotion',
   text:()=>`How do you feel around your family? What emotion comes up most?`,
   hint:'e.g. loved, stressed, anxious, comfortable, lonely...',
   process(a){
     const emotion=emo(a);
     const nodes=[];
     ST.lastPeople.forEach(p=>{
       if(G.nodes[p]){G.nodes[p].emotion=emotion;
         G.addNode({id:emotion,type:'emotion',label:emotion,emotion});
         G.addEdge(p,emotion,'triggers',emotion);}
     });
     const en=G.addNode({id:emotion,type:'emotion',label:emotion,emotion});
     if(en&&en.mentions===1)nodes.push(en);
     G._upProf(emotion);return nodes;
   }},

  {id:'q_friends',phase:'PERSON',nodes:'person',
   text:()=>`Who are your closest friends? (1-3 names)`,
   hint:'Names — or say "no close friends" to skip',multi:true,
   process(a){
     if(/no |none|don't|dont/.test(a.toLowerCase())){ST.lastPeople=[];return[];}
     const ps=a.split(/[,،;]+/).map(s=>capWord(s.trim())).filter(s=>s.length>1);
     ST.lastPeople=ps;
     return ps.map(p=>{
       const n=G.addNode({id:p,type:'person',label:p,emotion:'Neutral'});
       if(G.userName)G.addEdge(G.userName,p,'friend','Neutral');
       return n&&n.mentions===1?n:null;
     }).filter(Boolean);
   }},

  {id:'q_friends_emo',phase:'PERSON_EMO',nodes:'emotion',
   text:()=>`When you're with your friends, how do you feel?`,
   hint:'e.g. happy, at ease, drained, excited, jealous...',
   process(a){
     const emotion=emo(a);const nodes=[];
     ST.lastPeople.forEach(p=>{
       if(G.nodes[p]){
         const en=G.addNode({id:emotion,type:'emotion',label:emotion,emotion});
         if(en&&en.mentions===1)nodes.push(en);
         G.addEdge(p,emotion,'triggers',emotion);}
     });
     G._upProf(emotion);return nodes;
   }},

  {id:'q_partner',phase:'PERSON',nodes:'person',
   text:()=>`Are you in a relationship? If yes, what's their name?`,
   hint:'Name, or say "no" / "single"...',
   process(a){
     if(/^(no|nope|single|not really|none)$/i.test(a.trim())){ST.lastPeople=[];return[];}
     const p=capWord(a.split(/\s+/)[0]);
     const n=G.person(p,'Trust');
     ST.lastPeople=[p];
     const rel=G.life('Relationship','Trust');
     G.addEdge(p,'Relationship','linked','Trust');
     return[n,rel].filter(Boolean);
   }},

  {id:'q_partner_emo',phase:'PERSON_EMO',nodes:'emotion',
   text:()=>ST.lastPeople.length
     ?`How does your relationship with ${ST.lastPeople[0]} make you feel?`
     :`How does being single feel for you right now?`,
   hint:'e.g. loved, happy, anxious, lonely, content...',
   process(a){
     const emotion=emo(a);const nodes=[];
     ST.lastPeople.forEach(p=>{
       if(G.nodes[p]){
         const en=G.addNode({id:emotion,type:'emotion',label:emotion,emotion});
         if(en&&en.mentions===1)nodes.push(en);
         G.addEdge(p,emotion,'triggers',emotion);}
     });
     G._upProf(emotion);return nodes;
   }},

  {id:'q_difficult_person',phase:'PERSON',nodes:'person',
   text:()=>`Is there anyone who causes you stress or conflict — a person who makes life harder?`,
   hint:'Role or name — e.g. "my boss", "a classmate", or "no one"',
   process(a){
     if(/no |none|nobody|no one/.test(a.toLowerCase())&&a.length<20){ST.lastPeople=[];return[];}
     const ps=extractPeople(a);
     if(!ps.length){const raw=capWord(a.split(/\s+/).slice(-1)[0]);if(raw.length>2)ps.push(raw);}
     ST.lastPeople=ps;
     return ps.map(p=>{
       const n=G.addNode({id:p,type:'person',label:p,emotion:'Anger'});
       if(G.userName)G.addEdge(G.userName,p,'conflict','Anger');
       return n&&n.mentions===1?n:null;
     }).filter(Boolean);
   }},

  {id:'q_difficult_emo',phase:'PERSON_EMO',nodes:'emotion',
   text:()=>ST.lastPeople.length
     ?`What emotion does ${ST.lastPeople[0]} bring out in you?`
     :`What emotion do difficult people bring out in you?`,
   hint:'e.g. angry, anxious, small, frustrated, sad...',
   process(a){
     const emotion=emo(a);const nodes=[];
     ST.lastPeople.forEach(p=>{
       if(G.nodes[p]){
         const en=G.addNode({id:emotion,type:'emotion',label:emotion,emotion});
         if(en&&en.mentions===1)nodes.push(en);
         G.addEdge(p,emotion,'triggers',emotion);}
     });
     G._upProf(emotion);return nodes;
   }},

  // ── LIFE SECTION ──
  {id:'s_life',phase:'SECTION',
   title:'🌍 Areas of Your Life',
   desc:"Now let's explore how different areas of your life feel."},

  {id:'q_work',phase:'LIFE',nodes:'lifeArea',
   text:()=>`What kind of work or study are you currently doing?`,
   hint:'e.g. Engineering student, startup job, job searching...',
   process(a){
     let areas=extractAreas(a);
     if(!areas.length)areas.push(a.toLowerCase().includes('stud')?'College':'Work');
     ST.lastAreas=areas;
     return areas.map(ar=>{
       const n=G.addNode({id:ar,type:'lifeArea',label:ar,emotion:'Neutral'});
       if(G.userName)G.addEdge(G.userName,ar,'part_of_life','Neutral');
       return n&&n.mentions===1?n:null;
     }).filter(Boolean);
   }},

  {id:'q_work_emo',phase:'LIFE_EMO',nodes:'emotion',
   text:()=>`How does ${ST.lastAreas[0]||'your work/study'} make you feel?`,
   hint:'e.g. stressed, motivated, bored, exhausted, passionate...',
   process(a){
     const emotion=emo(a);const nodes=[];
     ST.lastAreas.forEach(ar=>{
       if(G.nodes[ar]){G.nodes[ar].emotion=emotion;
         const en=G.addNode({id:emotion,type:'emotion',label:emotion,emotion});
         if(en&&en.mentions===1)nodes.push(en);
         G.addEdge(ar,emotion,'causes',emotion);}
     });
     G._upProf(emotion);return nodes;
   }},

  {id:'q_health',phase:'LIFE',nodes:'lifeArea',
   text:()=>`How is your physical and mental health lately?`,
   hint:'e.g. good, struggling with sleep, anxiety, gym regularly...',
   process(a){
     const n=G.addNode({id:'Health',type:'lifeArea',label:'Health',emotion:'Neutral'});
     if(G.userName)G.addEdge(G.userName,'Health','part_of_life','Neutral');
     ST.lastAreas=['Health'];return n&&n.mentions===1?[n]:[];
   }},

  {id:'q_health_emo',phase:'LIFE_EMO',nodes:'emotion',
   text:()=>`What emotion comes up when you think about your health?`,
   hint:'e.g. worried, calm, motivated, guilty, content...',
   process(a){
     const emotion=emo(a);const nodes=[];
     const en=G.addNode({id:emotion,type:'emotion',label:emotion,emotion});
     if(en&&en.mentions===1)nodes.push(en);
     if(G.nodes['Health'])G.addEdge('Health',emotion,'causes',emotion);
     G._upProf(emotion);return nodes;
   }},

  {id:'q_finance',phase:'LIFE',nodes:'lifeArea',
   text:()=>`How are things financially for you?`,
   hint:'e.g. stable, stressed about money, in debt, comfortable...',
   process(a){
     const n=G.addNode({id:'Finance',type:'lifeArea',label:'Finance',emotion:'Neutral'});
     if(G.userName)G.addEdge(G.userName,'Finance','part_of_life','Neutral');
     ST.lastAreas=['Finance'];return n&&n.mentions===1?[n]:[];
   }},

  {id:'q_finance_emo',phase:'LIFE_EMO',nodes:'emotion',
   text:()=>`What emotion does thinking about money bring up?`,
   hint:'e.g. stressed, secure, anxious, hopeful, embarrassed...',
   process(a){
     const emotion=emo(a);const nodes=[];
     const en=G.addNode({id:emotion,type:'emotion',label:emotion,emotion});
     if(en&&en.mentions===1)nodes.push(en);
     if(G.nodes['Finance'])G.addEdge('Finance',emotion,'causes',emotion);
     G._upProf(emotion);return nodes;
   }},

  {id:'q_hobbies',phase:'LIFE',nodes:'lifeArea',
   text:()=>`What do you love doing in your free time?`,
   hint:'e.g. music, gaming, reading, gym, cooking, travel...',multi:true,
   process(a){
     let areas=extractAreas(a);if(!areas.length)areas=['Hobbies'];
     ST.lastAreas=areas;
     const nodes=[];
     areas.forEach(ar=>{
       const n=G.addNode({id:ar,type:'lifeArea',label:ar,emotion:'Joy'});
       if(G.userName)G.addEdge(G.userName,ar,'enjoys','Joy');
       if(n&&n.mentions===1)nodes.push(n);
       G.addNode({id:'Joy',type:'emotion',label:'Joy',emotion:'Joy'});
       G.addEdge(ar,'Joy','brings','Joy');
     });
     return nodes;
   }},

  {id:'q_hobbies_emo',phase:'LIFE_EMO',nodes:'emotion',
   text:()=>`What do your hobbies or free time make you feel?`,
   hint:'e.g. peaceful, joyful, alive, distracted, happy...',
   process(a){
     const emotion=emo(a);const nodes=[];
     ST.lastAreas.forEach(ar=>{
       if(G.nodes[ar]){
         const en=G.addNode({id:emotion,type:'emotion',label:emotion,emotion});
         if(en&&en.mentions===1)nodes.push(en);
         G.addEdge(ar,emotion,'causes',emotion);}
     });
     G._upProf(emotion);return nodes;
   }},

  // ── TRAUMA SECTION ──
  {id:'s_trauma',phase:'SECTION',
   title:'💭 Experiences That Shaped You',
   desc:"Gently — a few questions about difficult moments. Skip anything you're not ready for."},

  {id:'q_past',phase:'TRAUMA',nodes:'trauma',sensitive:true,
   text:(g)=>`${g.userName}, is there something difficult from your past — school, family, a relationship — that still affects how you feel today?`,
   hint:"Share as much as you're comfortable with. You can skip.",
   process(a){
     if(/^(no|nope|nothing|fine|okay|skip|pass)$/i.test(a.trim())){ST.lastTrauma=null;return[];}
     const TKW={bully:'Bullying',bullied:'Bullying',abuse:'Abuse',abused:'Abuse',
       accident:'Accident',death:'Loss',died:'Loss',failure:'Failure',failed:'Failure',
       breakup:'Breakup',cheated:'Betrayal',betrayed:'Betrayal',rejected:'Rejection',
       expelled:'Expulsion',fired:'Job Loss',divorce:'Divorce',
       harass:'Harassment',neglect:'Neglect',abandoned:'Abandonment',
       humiliat:'Humiliation',embarrass:'Humiliation',violence:'Violence'};
     let label=null;
     for(const[k,v]of Object.entries(TKW))if(a.toLowerCase().includes(k)){label=v;break;}
     if(!label){
       const ws=a.toLowerCase().replace(/[^a-z\s]/g,' ').split(/\s+/).filter(w=>w.length>3&&!STOP.has(w));
       if(ws.length)label=capWord(ws[0]);else label='Difficult Experience';
     }
     const areas=extractAreas(a);const emotion=emo(a)||'Sadness';
     const n=G.trauma(label,areas[0]||null,emotion);
     ST.lastTrauma=label;return n?[n]:[];
   }},

  {id:'q_past_emo',phase:'TRAUMA_EMO',nodes:'emotion',
   text:()=>ST.lastTrauma
     ?`What emotion does ${ST.lastTrauma} still bring up for you today?`
     :`When you think about difficult past moments, what emotion comes up?`,
   hint:'e.g. sadness, anger, shame, fear, grief, numbness...',
   process(a){
     const emotion=emo(a);const nodes=[];
     const en=G.addNode({id:emotion,type:'emotion',label:emotion,emotion});
     if(en&&en.mentions===1)nodes.push(en);
     if(ST.lastTrauma&&G.nodes[ST.lastTrauma])G.addEdge(ST.lastTrauma,emotion,'caused',emotion);
     G._upProf(emotion);return nodes;
   }},

  {id:'q_current_struggle',phase:'TRAUMA',nodes:'trauma',sensitive:true,
   text:()=>`What's the biggest struggle or challenge weighing on you right now?`,
   hint:'e.g. exam pressure, a conflict, feeling stuck, a loss, burnout...',
   process(a){
     if(/^(no|nothing|fine|okay|none)$/i.test(a.trim())){ST.lastTrauma=null;return[];}
     const CKW={pressure:'Pressure',stress:'Stress',stuck:'Feeling Stuck',
       conflict:'Conflict',fight:'Conflict',loss:'Loss',lonely:'Loneliness',
       fail:'Failure',debt:'Debt',burnout:'Burnout',anxious:'Anxiety',
       depress:'Depression',breakup:'Breakup',divorce:'Divorce'};
     let label=null;
     for(const[k,v]of Object.entries(CKW))if(a.toLowerCase().includes(k)){label=v;break;}
     if(!label){
       const ws=a.toLowerCase().replace(/[^a-z\s]/g,' ').split(/\s+/).filter(w=>w.length>3&&!STOP.has(w));
       if(ws.length)label=capWord(ws[0]);else label='Current Struggle';
     }
     const areas=extractAreas(a);const emotion=emo(a)||'Fear';
     const n=G.trauma(label,areas[0]||null,emotion);
     ST.lastTrauma=label;return n?[n]:[];
   }},

  {id:'q_current_emo',phase:'TRAUMA_EMO',nodes:'emotion',
   text:()=>ST.lastTrauma
     ?`How does ${ST.lastTrauma} make you feel?`
     :`What emotion does your current struggle bring up?`,
   hint:'e.g. overwhelmed, hopeless, angry, scared, exhausted...',
   process(a){
     const emotion=emo(a);const nodes=[];
     const en=G.addNode({id:emotion,type:'emotion',label:emotion,emotion});
     if(en&&en.mentions===1)nodes.push(en);
     if(ST.lastTrauma&&G.nodes[ST.lastTrauma])G.addEdge(ST.lastTrauma,emotion,'caused',emotion);
     G._upProf(emotion);return nodes;
   }},

  {id:'q_trigger',phase:'TRAUMA',nodes:'trauma',
   text:()=>`What kinds of situations trigger strong emotions in you — even if you're unsure why?`,
   hint:'e.g. being ignored, loud arguments, criticism, failing, being compared...',
   process(a){
     const TG={ignor:'Being Ignored',compet:'Competition',fail:'Failure',
       argument:'Arguments',argument2:'Arguments',shout:'Shouting',alone:'Being Alone',
       reject:'Rejection',critic:'Criticism',pressure:'Pressure',crowd:'Crowds',
       compari:'Being Compared',loud:'Loud Situations'};
     let label=null;
     for(const[k,v]of Object.entries(TG))if(a.toLowerCase().includes(k)){label=v;break;}
     if(!label){
       const ws=a.toLowerCase().replace(/[^a-z\s]/g,' ').split(/\s+/).filter(w=>w.length>3&&!STOP.has(w));
       label=ws.length?capWord(ws[0])+' Trigger':'Emotional Trigger';
     }
     const emotion=emo(a)||'Fear';
     const n=G.trauma(label,null,emotion);
     ST.lastTrauma=label;return n?[n]:[];
   }},

  {id:'q_trigger_emo',phase:'TRAUMA_EMO',nodes:'emotion',
   text:()=>`What emotion does that trigger most strongly?`,
   hint:'e.g. fear, anger, sadness, shame, anxiety...',
   process(a){
     const emotion=emo(a);const nodes=[];
     const en=G.addNode({id:emotion,type:'emotion',label:emotion,emotion});
     if(en&&en.mentions===1)nodes.push(en);
     if(ST.lastTrauma&&G.nodes[ST.lastTrauma])G.addEdge(ST.lastTrauma,emotion,'caused',emotion);
     G._upProf(emotion);return nodes;
   }},

  // ── CLOSE ──
  {id:'s_close',phase:'SECTION',
   title:'✨ Right Now',
   desc:"Two last questions about where you are today."},

  {id:'q_mood',phase:'CLOSE',nodes:'emotion',
   text:(g)=>`${g.userName}, on a scale of 1-10 how are you feeling right now? (1=very low, 10=great)`,
   hint:'Just a number...',
   process(a){
     const sc=parseInt(a);
     const emotion=isNaN(sc)?emo(a):sc>=7?'Joy':sc>=5?'Trust':sc>=3?'Sadness':'Fear';
     const n=G.addNode({id:emotion,type:'emotion',label:emotion,emotion});
     if(G.userName)G.addEdge(G.userName,emotion,'currently_feels',emotion);
     G._upProf(emotion);return n&&n.mentions===1?[n]:[];
   }},

  {id:'q_dream',phase:'CLOSE',nodes:'memory',
   text:()=>`What's one thing you're really hoping for or working towards?`,
   hint:'A goal, a dream, anything you\'re looking forward to...',
   process(a){
     const ws=a.replace(/[^a-zA-Z\s]/g,' ').split(/\s+/).filter(w=>w.length>3&&!STOP.has(w.toLowerCase()));
     const label=ws.slice(0,3).map(capWord).join(' ')||'My Dream';
     const n=G.addNode({id:label,type:'memory',label,emotion:'Anticipation',strength:0.8});
     if(G.userName)G.addEdge(G.userName,label,'hopes_for','Anticipation');
     G.addNode({id:'Anticipation',type:'emotion',label:'Anticipation',emotion:'Anticipation'});
     G.addEdge(label,'Anticipation','brings','Anticipation');
     return n&&n.mentions===1?[n]:[];
   }}
];

const QM={};QS.forEach(q=>{QM[q.id]=q;});
const QIDS=QS.map(q=>q.id);

// ── 5. FLOW STATE ─────────────────────────────────────────────
let curIdx=0;

function curQ(){return QS[curIdx];}
function advance(){if(curIdx<QS.length-1)curIdx++;}

// ── 6. D3 GRAPH ───────────────────────────────────────────────
let svg=null,sim=null,LL=null,NL=null;
let d3N=[],d3L=[];
let W=window.innerWidth,H=window.innerHeight;
let selId=null;

function initGraph(cont){
  cont.querySelectorAll('svg').forEach(e=>e.remove());
  W=window.innerWidth;H=window.innerHeight;

  svg=d3.select(cont).append('svg').attr('width',W).attr('height',H);
  const df=svg.append('defs');
  ['gl','gl2'].forEach((id,i)=>{
    const f=df.append('filter').attr('id',id);
    f.append('feGaussianBlur').attr('stdDeviation',i?7:3).attr('result','b');
    const m=f.append('feMerge');m.append('feMergeNode').attr('in','b');m.append('feMergeNode').attr('in','SourceGraphic');
  });
  df.append('marker').attr('id','ar').attr('viewBox','0 -4 8 8')
    .attr('refX',18).attr('refY',0).attr('markerWidth',5).attr('markerHeight',5).attr('orient','auto')
    .append('path').attr('d','M0,-4L8,0L0,4').attr('fill','rgba(255,255,255,0.15)');

  LL=svg.append('g');NL=svg.append('g');
  svg.on('click',()=>{selId=null;resetHL();rmDetail();});

  const{nodes,links}=G.toD3();
  d3N=nodes.map(n=>({...n,x:n.x||(W/2+(Math.random()-.5)*250),y:n.y||(H/2+(Math.random()-.5)*250),r:n.r||10}));
  d3L=links.map(l=>({...l}));
  buildSim();renderAll();

  window.addEventListener('resize',()=>{
    W=window.innerWidth;H=window.innerHeight;
    svg.attr('width',W).attr('height',H);
    sim?.force('center',d3.forceCenter(W/2,H/2)).alpha(.2).restart();
  });
}

function buildSim(){
  if(sim)sim.stop();
  sim=d3.forceSimulation(d3N)
    .force('link',d3.forceLink(d3L).id(d=>d.id)
      .distance(d=>d.source.type==='self'||d.target.type==='self'?130:80)
      .strength(d=>(d.strength||.5)*.7))
    .force('charge',d3.forceManyBody().strength(d=>d.type==='self'?-450:d.type==='trauma'?-280:-190))
    .force('center',d3.forceCenter(W/2,H/2))
    .force('collide',d3.forceCollide().radius(d=>(NR[d.type]||12)+15))
    .on('tick',()=>{
      LL.selectAll('line')
        .attr('x1',d=>d.source?.x || W/2)
        .attr('y1',d=>d.source?.y || H/2)
        .attr('x2',d=>d.target?.x || W/2)
        .attr('y2',d=>d.target?.y || H/2);
      NL.selectAll('g.nd')
        .attr('transform',d=>`translate(${d.x || W/2},${d.y || H/2})`);
    });
}

function renderAll(){
  const ls=LL.selectAll('line').data(d3L,d=>`${d.source?.id||d.source}-${d.target?.id||d.target}`);
  ls.enter().append('line')
    .attr('stroke',d=>EC[d.emotion]||'rgba(255,255,255,0.1)')
    .attr('stroke-width',d=>.8+(d.strength||.5)*1.4)
    .attr('stroke-opacity',d=>.1+(d.strength||.5)*.28)
    .attr('marker-end','url(#ar)');
  ls.exit().remove();

  const ne=NL.selectAll('g.nd').data(d3N,d=>d.id).enter()
    .append('g').attr('class','nd').style('cursor','pointer')
    .call(d3.drag()
      .on('start',(e,d)=>{if(!e.active)sim.alphaTarget(.3).restart();d.fx=d.x;d.fy=d.y;})
      .on('drag',(e,d)=>{d.fx=e.x;d.fy=e.y;})
      .on('end',(e,d)=>{if(!e.active)sim.alphaTarget(0);d.fx=null;d.fy=null;}))
    .on('click',(ev,d)=>{ev.stopPropagation();nodeClick(d);});

  ne.append('circle').attr('r',0)
    .attr('fill',d=>NC[d.type]||'#888').attr('fill-opacity',.88)
    .attr('stroke','#fff').attr('stroke-width',d=>d.type==='self'?2.5:d.type==='trauma'?2:1)
    .attr('filter',d=>['self','trauma'].includes(d.type)?'url(#gl)':null)
    .transition().duration(600).ease(d3.easeBackOut).attr('r',d=>NR[d.type]||11);

  ne.append('text').text(d=>d?.type==='self'?'':(d?.type?d.type.toUpperCase():''))
    .attr('fill','rgba(255,255,255,0.2)').attr('font-size','6px')
    .attr('font-family',"'JetBrains Mono',monospace").attr('text-anchor','middle')
    .attr('dy',d=>-(NR[d.type]||11)-6).attr('opacity',0)
    .transition().delay(350).duration(400).attr('opacity',1);

  ne.append('text').text(d=>d?.label||'')
    .attr('fill','rgba(255,255,255,0.82)').attr('font-size',d=>d.type==='self'?'13px':'10px')
    .attr('font-family',"'JetBrains Mono',monospace").attr('text-anchor','middle')
    .attr('dy',d=>(NR[d.type]||11)+15).attr('opacity',0)
    .transition().delay(200).duration(500).attr('opacity',1);

  ne.filter(d=>d.type!=='emotion').append('circle')
    .attr('r',3.5).attr('cx',d=>(NR[d.type]||11)*.68).attr('cy',d=>-(NR[d.type]||11)*.68)
    .attr('fill',d=>EC[d.emotion]||'transparent')
    .attr('fill-opacity',d=>(d.emotion&&d.emotion!=='Neutral')?.9:0);

  NL.selectAll('g.nd').exit().remove();
}

function addLive(node){
  if(!svg)return;
  if(d3N.find(n=>n.id===node.id)){
    NL.selectAll('g.nd').filter(d=>d.id===node.id).select('circle')
      .transition().duration(250).attr('r',d=>(NR[d.type]||11)*1.6)
      .transition().duration(350).attr('r',d=>NR[d.type]||11);
    return;
  }
  d3N.push({...node,x:node.x||(W/2+(Math.random()-.5)*200),y:node.y||(H/2+(Math.random()-.5)*200),r:node.r||10});
  G.edges.forEach(e=>{
    const has=d3L.find(l=>(l.source?.id||l.source)===e.source&&(l.target?.id||l.target)===e.target);
    if(!has&&(e.source===node.id||e.target===node.id))d3L.push({...e});
  });
  sim.nodes(d3N);sim.force('link').links(d3L);sim.alpha(.45).restart();
  renderAll();showToast(node);
}

function highlightEmo(name){
  if(!svg||!name||name==='Neutral'){resetHL();return;}
  const s=G.neighbourhood(name);s.add(name);
  NL.selectAll('g.nd').each(function(d){
    const on=s.has(d.id);
    d3.select(this).select('circle').transition().duration(380)
      .attr('fill-opacity',on?1:.08)
      .attr('r',on?((NR[d.type]||11)*(d.id===name?1.9:1.35)):(NR[d.type]||11))
      .attr('filter',on?'url(#gl2)':null);
    d3.select(this).selectAll('text').transition().duration(380)
      .attr('fill',on?'#fff':'rgba(255,255,255,0.06)');
  });
  LL.selectAll('line').transition().duration(380)
    .attr('stroke-opacity',d=>{const sc=d.source?.id||d.source,t=d.target?.id||d.target;return(s.has(sc)&&s.has(t))?.9:.03;})
    .attr('stroke-width',d=>{const sc=d.source?.id||d.source,t=d.target?.id||d.target;return(s.has(sc)&&s.has(t))?2.5:.5;});
}

function resetHL(){
  if(!svg)return;
  NL.selectAll('g.nd').each(function(d){
    d3.select(this).select('circle').transition().duration(380)
      .attr('fill-opacity',.88).attr('r',NR[d.type]||11)
      .attr('filter',['self','trauma'].includes(d.type)?'url(#gl)':null);
    d3.select(this).selectAll('text').transition().duration(380).attr('fill','rgba(255,255,255,0.82)');
  });
  LL.selectAll('line').transition().duration(380)
    .attr('stroke-opacity',d=>.1+(d.strength||.5)*.28)
    .attr('stroke-width',d=>.8+(d.strength||.5)*1.4);
}

function filterType(type){
  if(!svg)return;
  if(type==='all'){resetHL();return;}
  NL.selectAll('g.nd').each(function(d){
    const on=d.type===type;
    d3.select(this).select('circle').transition().duration(320)
      .attr('fill-opacity',on?1:.06).attr('r',on?(NR[d.type]||11)*1.3:NR[d.type]||11);
    d3.select(this).selectAll('text').transition().duration(320)
      .attr('fill',on?'#fff':'rgba(255,255,255,0.04)');
  });
}

function nodeClick(d){
  if(selId===d.id){selId=null;resetHL();rmDetail();return;}
  selId=d.id;
  const nb=new Set([d.id]);
  G.edges.forEach(e=>{if(e.source===d.id)nb.add(e.target);if(e.target===d.id)nb.add(e.source);});
  NL.selectAll('g.nd').each(function(nd){
    const on=nb.has(nd.id);
    d3.select(this).select('circle').transition().duration(280)
      .attr('fill-opacity',on?1:.08).attr('r',on?(NR[nd.type]||11)*(nd.id===d.id?1.65:1.25):NR[nd.type]||11);
    d3.select(this).selectAll('text').transition().duration(280).attr('fill',on?'#fff':'rgba(255,255,255,0.05)');
  });
  LL.selectAll('line').transition().duration(280)
    .attr('stroke-opacity',l=>{const s=l.source?.id||l.source,t=l.target?.id||l.target;return(nb.has(s)&&nb.has(t))?.9:.03;});
  showDetail(d,nb);
}

function showToast(node){
  const toast=document.getElementById('lm-toast');if(!toast)return;
  const col=NC[node.type]||'#fff';
  const p=document.createElement('div');
  p.style.cssText=`padding:4px 12px;border-radius:999px;font-size:8px;letter-spacing:.12em;
    border:1px solid ${col}50;background:${col}16;color:${col};
    animation:lmT 3s ease forwards;font-family:'JetBrains Mono',monospace;white-space:nowrap;`;
  p.textContent=`+ ${node?.label||''}  [${node?.type||''}]`;
  toast.appendChild(p);setTimeout(()=>p.remove(),3200);
}

function showDetail(node,nb){
  rmDetail();
  const col=NC[node.type]||'#fff';const emCol=EC[node.emotion]||'#888';
  const peers=[...nb].filter(id=>id!==node.id).map(id=>G.nodes[id]).filter(Boolean);
  const el=document.createElement('div');el.id='lm-detail';
  el.style.cssText=`position:fixed;right:24px;top:60px;width:196px;z-index:50;
    background:rgba(5,5,8,0.97);border:1px solid ${col}35;border-radius:12px;
    padding:18px;font-family:'JetBrains Mono',monospace;animation:lmFd .2s ease;`;
  el.innerHTML=`<style>@keyframes lmFd{from{opacity:0;transform:translateY(-5px)}to{opacity:1}}</style>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
      <div style="width:9px;height:9px;border-radius:50%;background:${col}"></div>
      <div style="font-size:13px;color:#fff">${node?.label||''}</div></div>
    <div style="font-size:7px;letter-spacing:.25em;color:rgba(255,255,255,.22);margin-bottom:10px">${node?.type?node.type.toUpperCase():''}</div>
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px">
      <div style="width:6px;height:6px;border-radius:50%;background:${emCol}"></div>
      <div style="font-size:9px;color:${emCol}">${node.emotion||'Neutral'}</div></div>
    <div style="font-size:8px;color:rgba(255,255,255,.2);margin-bottom:12px">
      Strength ${Math.round((node.strength||.5)*100)}% · ${node.mentions||1}× mentioned</div>
    <div style="height:1px;background:rgba(255,255,255,.05);margin-bottom:10px"></div>
    <div style="font-size:7px;letter-spacing:.18em;color:rgba(255,255,255,.18);margin-bottom:7px">CONNECTED TO</div>
    ${peers.slice(0,5).map(n=>`<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px">
      <div style="width:5px;height:5px;border-radius:50%;background:${NC[n.type]||'#888'}"></div>
      <div style="font-size:9px;color:rgba(255,255,255,.45)">${n?.label||''}</div></div>`).join('')}
    <button onclick="document.getElementById('lm-detail').remove()" style="margin-top:12px;width:100%;
      padding:6px;border-radius:7px;border:1px solid rgba(255,255,255,.08);background:transparent;
      color:rgba(255,255,255,.25);font-size:8px;letter-spacing:.14em;cursor:pointer;
      font-family:'JetBrains Mono',monospace;">CLOSE</button>`;
  document.body.appendChild(el);
}

function rmDetail(){const e=document.getElementById('lm-detail');if(e)e.remove();}

// ── 7. UI ─────────────────────────────────────────────────────
let memCont=null,ivEl=null;

function buildUI(){
  memCont=document.createElement('div');
  memCont.id='lm-mc';
  Object.assign(memCont.style,{position:'fixed',inset:'0',background:'#050508',display:'none',zIndex:'5'});
  document.body.appendChild(memCont);

  const toast=document.createElement('div');toast.id='lm-toast';
  Object.assign(toast.style,{position:'fixed',bottom:'28px',left:'50%',transform:'translateX(-50%)',
    display:'flex',gap:'8px',flexWrap:'wrap',justifyContent:'center',maxWidth:'80vw',zIndex:'300',pointerEvents:'none'});
  document.body.appendChild(toast);

  const tb=document.getElementById('lm-tabs');
  const bBtn=mkTab(tb||document.body,'Brain',()=>showBrain());
  const mBtn=mkTab(tb||document.body,'Memory Map',()=>showMemory());
  window._lmB=bBtn;window._lmM=mBtn;setTab(bBtn);

  document.querySelectorAll('.e-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const n=btn.dataset.e;highlightEmo(n.charAt(0).toUpperCase()+n.slice(1));
    });
  });
}

function mkTab(bar,label,fn){
  const b=document.createElement('button');b.textContent=label;
  Object.assign(b.style,{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.12)',
    color:'rgba(255,255,255,0.4)',fontSize:'10px',letterSpacing:'0.18em',padding:'6px 20px',
    cursor:'pointer',borderRadius:'6px',transition:'all 0.2s',fontFamily:"'JetBrains Mono',monospace"});
  b.onclick=fn;bar.appendChild(b);return b;
}

function setTab(active){
  [window._lmB,window._lmM].forEach(b=>{
    if(!b)return;const on=b===active;
    b.style.background=on?'rgba(255,255,255,0.10)':'rgba(255,255,255,0.04)';
    b.style.color=on?'rgba(255,255,255,0.90)':'rgba(255,255,255,0.40)';
    b.style.borderColor=on?'rgba(255,255,255,0.25)':'rgba(255,255,255,0.12)';
  });
}

function showBrain(){
  setTab(window._lmB);
  const c=document.querySelector('canvas');if(c)c.style.display='block';
  memCont.style.display='none';if(ivEl)ivEl.style.display='none';
}

function showMemory(){
  setTab(window._lmM);
  const c=document.querySelector('canvas');if(c)c.style.display='none';
  memCont.style.display='block';
  ensureD3(()=>{
    if(ivEl)ivEl.style.display='none';
    if(!svg){initGraph(memCont);buildControls();buildProfile();}
  });
}

// ── 8. INTERVIEW REMOVED ──────────────────────────────────────────────
// The user explicitly requested removing this from the code as it is now handled by OnboardingPage

// ── 9. CONTROLS + PROFILE ─────────────────────────────────────
function buildControls(){
  document.getElementById('lm-ctrl')?.remove();
  const w=document.createElement('div');w.id='lm-ctrl';
  Object.assign(w.style,{position:'absolute',bottom:'20px',right:'24px',
    display:'flex',gap:'7px',flexDirection:'column',zIndex:'20',fontFamily:"'JetBrains Mono',monospace"});

  const fr=document.createElement('div');fr.style.cssText='display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end;';
  [{id:'all',label:'All',col:'rgba(255,255,255,0.5)'},{id:'person',label:'People',col:'#3b82f6'},
   {id:'lifeArea',label:'Life',col:'#22c55e'},{id:'emotion',label:'Emotions',col:'#f0b429'},
   {id:'trauma',label:'Traumas',col:'#ef4444'},{id:'memory',label:'Memories',col:'#a78bfa'}
  ].forEach(t=>{
    const b=document.createElement('button');b.textContent=t.label;
    b.style.cssText=`font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:.12em;
      padding:5px 10px;border-radius:6px;cursor:pointer;transition:all .2s;
      border:1px solid ${t.col}40;background:${t.col}12;color:${t.col};`;
    b.onclick=()=>filterType(t.id);fr.appendChild(b);
  });
  w.appendChild(fr);

  const info=document.createElement('div');
  info.style.cssText='font-size:8px;letter-spacing:.1em;color:rgba(255,255,255,.18);text-align:right;';
  info.textContent=`${Object.keys(G.nodes).length} nodes · ${G.edges.length} edges · click to explore`;
  w.appendChild(info);

  const rb=document.createElement('button');rb.textContent='Reset Map';
  rb.style.cssText=`font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:.12em;
    padding:6px 12px;border-radius:6px;cursor:pointer;align-self:flex-end;
    border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02);
    color:rgba(255,255,255,.2);`;
  rb.onclick=()=>{if(confirm('Reset your memory map?')){G.reset();svg=null;d3N=[];d3L=[];startIV();}};
  w.appendChild(rb);memCont.appendChild(w);
}

function buildProfile(){
  document.getElementById('lm-prof')?.remove();
  const p=G.profile;const tot=Math.max(1,p.internalizer+p.externalizer+p.avoidant);
  const emCol=EC[p.primaryEmotion]||'#888';
  const el=document.createElement('div');el.id='lm-prof';
  Object.assign(el.style,{position:'absolute',top:'50px',right:'24px',width:'185px',zIndex:'20',
    background:'rgba(5,5,8,0.92)',border:'1px solid rgba(255,255,255,.07)',
    borderRadius:'10px',padding:'16px',fontFamily:"'JetBrains Mono',monospace"});
  el.innerHTML=`
    <div style="font-size:8px;letter-spacing:.22em;color:rgba(255,255,255,.18);margin-bottom:12px">PROFILE</div>
    <div style="font-size:11px;color:rgba(255,255,255,.6);margin-bottom:14px">
      ${G.userName||'You'} · <span style="color:${emCol}">${p.primaryEmotion}</span></div>
    ${[['Internalizer',p.internalizer/tot,'#3a5fa8'],['Externalizer',p.externalizer/tot,'#c0392b'],['Avoidant',p.avoidant/tot,'#6b8c3a']].map(([l,v,c])=>`
      <div style="margin-bottom:9px">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px">
          <span style="font-size:8px;color:rgba(255,255,255,.3)">${l}</span>
          <span style="font-size:8px;color:rgba(255,255,255,.3)">${Math.round(v*100)}%</span>
        </div>
        <div style="width:100%;height:2px;background:rgba(255,255,255,.06);border-radius:1px">
          <div style="width:${v*100}%;height:100%;background:${c};border-radius:1px"></div>
        </div>
      </div>`).join('')}
    <div style="margin-top:12px;font-size:8px;color:rgba(255,255,255,.18)">Type</div>
    <div style="font-size:10px;color:rgba(255,255,255,.55);margin-top:3px">${p.dominant}</div>
    ${p.stressors.length?`<div style="margin-top:10px;font-size:8px;color:rgba(255,255,255,.18)">Stressors</div>
    <div style="font-size:9px;color:rgba(192,57,43,.75);margin-top:3px">${p.stressors.slice(0,2).join(', ')}</div>`:''}
    ${p.strengths.length?`<div style="margin-top:8px;font-size:8px;color:rgba(255,255,255,.18)">Strengths</div>
    <div style="font-size:9px;color:rgba(34,197,94,.75);margin-top:3px">${p.strengths.slice(0,2).join(', ')}</div>`:''}`;
  memCont.appendChild(el);
}

// ── 10. INTERVIEW DOM REMOVED ─────────────────────────────────────────

function ensureD3(cb){
  if(window.d3){cb();return;}
  const s=document.createElement('script');s.src='https://d3js.org/d3.v7.min.js';s.onload=cb;
  document.head.appendChild(s);
}

// Boot
window.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'PROCESS_ANSWER') {
    const { qId, value } = e.data;
    // We try to find the question and run process()
    const matchQ = QS.find(q => q.id === qId);
    if (matchQ && matchQ.process) {
      const nodes = matchQ.process(value);
      if (nodes && nodes.length > 0) {
        nodes.filter(Boolean).forEach(n => addLive(n));
        if (!svg && memCont && memCont.style.display === 'block') {
          ensureD3(() => { if(!svg){ initGraph(memCont); buildControls(); buildProfile(); }});
        }
      }
    }
  } else if (e.data && e.data.type === 'HIDE_UI') {
    // Hide UI elements if running as a hidden observer
    if (memCont) memCont.style.display = 'none';
    const b = document.getElementById('lm-toast'); if(b) b.style.display = 'none';
    const m = document.getElementById('iv-prof'); if(m) m.style.display = 'none';
  } else if (e.data && e.data.type === 'GET_GRAPH') {
    window.parent.postMessage({ type: 'GRAPH_DATA', data: { nodes: G.nodes, edges: G.edges, profile: G.profile } }, '*');
  } else if (e.data && e.data.type === 'LOAD_GRAPH') {
    const { data } = e.data;
    if (data && data.nodes) {
      G.nodes = data.nodes;
      G.edges = data.edges || [];
      G.profile = { ...G.profile, ...(data.profile || {}) };
      if (data.userName) G.userName = data.userName;
      // Persist this loaded state into iframe's own localStorage immediately
      // so subsequent PROCESS_ANSWER additions build on top of it
      G._sv();
      
      // Ensure D3 graph gets updated and profile is re-rendered
      if (!svg && memCont) {
        ensureD3(() => { if(!svg){ initGraph(memCont); buildControls(); buildProfile(); }});
      } else if (svg) {
        updateD3();
        buildProfile();
      }
    }
  } else if (e.data && e.data.type === 'SHOW_MAP') {
    showMemory();
  } else if (e.data && e.data.type === 'SHOW_BRAIN') {
    showBrain();
  } else if (e.data && e.data.type === 'SET_EMOTION') {
    // Drive the 3D brain glow with the correct emotion
    if (window.luminaBrain && typeof window.luminaBrain.setEmotion === 'function') {
      window.luminaBrain.setEmotion(e.data.emotion || 'neutral');
    }
  } else if (e.data && e.data.type === 'HIGHLIGHT_NODE') {
    // Flash a specific trigger node on the 2D memory map
    const nodeId = e.data.nodeId;
    if (!nodeId || !svg) return;
    // Normalize: backend triggers are lowercase, graph nodes may be capitalized
    const matchId = Object.keys(G.nodes).find(k =>
      k.toLowerCase() === nodeId.toLowerCase() || k.toLowerCase().includes(nodeId.toLowerCase())
    );
    if (!matchId) return;

    // Pulse the matching node circle
    NL.selectAll('g.nd')
      .filter(d => d.id === matchId)
      .select('circle')
      .transition().duration(120)
        .attr('r', d => (NR[d.type] || 11) * 2.2)
        .attr('fill-opacity', 1)
        .attr('filter', 'url(#gl2)')
      .transition().duration(600)
        .attr('r', d => NR[d.type] || 11)
        .attr('fill-opacity', 0.88)
        .attr('filter', d => ['self','trauma'].includes(d.type) ? 'url(#gl)' : null);
  }
});

function updateD3() {
  const {nodes, links} = G.toD3();
  const oldPos = new Map((d3N || []).map(n => [n.id, {x:n.x, y:n.y}]));
  
  d3N = nodes.map(n => {
    const p = oldPos.get(n.id);
    return {
      ...n, 
      x: (p && typeof p.x === 'number') ? p.x : W/2 + (Math.random()-.5)*100,
      y: (p && typeof p.y === 'number') ? p.y : H/2 + (Math.random()-.5)*100
    };
  });
  d3L = links.map(l => ({...l}));

  if (sim) {
    sim.nodes(d3N);
    sim.force('link').links(d3L);
    sim.alpha(0.3).restart();
  }
  renderAll();
}

buildUI();
console.log('✅ LUMINA Memory Graph ready');
})();