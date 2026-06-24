import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { roadmapAPI, jobsAPI, aiAPI } from '@/api/client';
import {
  Briefcase, Search, MapPin, Zap, ArrowUp, Tag, TrendingUp, RefreshCw,
  Brain, Mic, MicOff, Send, X, FileText, Upload, ChevronRight, CheckCircle2, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const matchColor = (pct) => pct >= 90 ? '#34A853' : pct >= 75 ? 'var(--color-primary)' : '#FBBC05';

// --- AI Interview Modal Component ---
function InterviewSimulator({ job, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Initial greeting
    setLoading(true);
    aiAPI.interview({
      targetRole: job.role,
      messages: [],
      roadmapContext: user?.roadmapData || {}
    }).then(res => {
      setMessages([{ role: 'assistant', content: res.data.message }]);
    }).finally(() => setLoading(false));
  }, [job.role, user?.roadmapData]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const userMsg = text || input;
    if (!userMsg.trim()) return;

    const newMessages = [...messages, { role: 'user', content: userMsg }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data } = await aiAPI.interview({
        targetRole: job.role,
        messages: newMessages,
        roadmapContext: user?.roadmapData || {}
      });
      setMessages([...newMessages, { role: 'assistant', content: data.message }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setInput(speechToText);
      sendMessage(speechToText);
    };
    if (isListening) recognition.stop();
    else recognition.start();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-card border border-border/80 w-full max-w-2xl h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden mx-auto my-auto"
      >
        <div className="p-4 border-b border-border/60 flex justify-between items-center bg-card/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
              <Brain size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">AI Interview Simulator</h3>
              <p className="text-[9px] text-primary uppercase tracking-widest font-black">Role: {job.role}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 pr-2 scrollbar-thin bg-muted/5">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${m.role === 'user'
                  ? 'bg-primary/10 border border-primary/20 text-foreground rounded-tr-none'
                  : 'bg-card border border-border/60 text-foreground rounded-tl-none'
                }`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border/60 p-4 rounded-2xl rounded-tl-none animate-pulse shadow-sm">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="p-4 border-t border-border/50 bg-card/60 backdrop-blur-md">
          <div className="flex gap-2.5">
            <button
              onClick={toggleListening}
              className={`p-3 rounded-xl transition-all cursor-pointer ${isListening ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30 animate-pulse' : 'bg-muted border border-border text-muted-foreground hover:text-primary hover:bg-card'}`}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <input
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Type your answer or use voice..."
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-muted border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary shadow-sm"
            />
            <button onClick={() => sendMessage()} className="btn-primary p-3 rounded-xl shadow-md cursor-pointer hover:scale-[1.02] active:scale-95 transition-all">
              <Send size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- ATS Grader Component ---
function ATSGrader({ job, onClose }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleAnalyze = async () => {
    if (!file) { toast.error('Please upload a resume first'); return; }
    setLoading(true);
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', `${job.role} at ${job.company}. Requirements: ${job.tags.join(', ')}`);

    try {
      const { data } = await aiAPI.scoreResume(formData);
      setResult(data.data);
    } catch (err) {
      console.error('ATS Grading failed:', err);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-card border border-border/80 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden mx-auto my-auto"
      >
        <div className="p-4 border-b border-border/60 flex justify-between items-center bg-card/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 shadow-sm">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground font-sans">AI Resume ATS Grader</h3>
              <p className="text-[9px] text-orange-500 uppercase tracking-widest font-black">Scan: {job.company}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6">
          {!result ? (
            <div className="space-y-5">
              <div className="border-2 border-dashed border-border/60 rounded-2xl p-6 flex flex-col items-center justify-center bg-muted/20 hover:bg-muted/30 transition-all cursor-pointer relative group">
                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf" />
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-primary">
                  <Upload size={20} />
                </div>
                <h4 className="text-xs font-bold text-foreground mb-1">{file ? file.name : 'Upload Resume (PDF)'}</h4>
                <p className="text-[10px] text-muted-foreground font-medium">Max size 2MB · Only PDF supported</p>
              </div>

              <button
                onClick={handleAnalyze} disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary-dark text-primary-foreground font-bold text-xs uppercase tracking-widest rounded-xl shadow-md cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
                {loading ? 'Analyzing resume files...' : 'Get ATS Score'}
              </button>
            </div>
          ) : (
            <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/60 shadow-sm">
                <div>
                  <p className="text-[9px] font-black tracking-widest text-muted-foreground uppercase mb-1">ATS Match Level</p>
                  <p className="text-4xl font-black text-foreground">{result.score}%</p>
                </div>
                <div className="w-14 h-14 relative flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="22" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
                    <circle cx="28" cy="28" r="22" fill="transparent" stroke={result.score > 70 ? 'var(--color-primary)' : '#ff5f56'} strokeWidth="4" strokeDasharray={138} strokeDashoffset={138 - (result.score / 100) * 138} strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-foreground">{result.score}%</span>
                </div>
              </div>

              <div>
                <h4 className="text-[9px] font-black tracking-widest text-primary uppercase mb-3 flex items-center gap-1.5"><CheckCircle2 size={13} /> Critical Suggestions</h4>
                <div className="space-y-2 pr-1 max-h-[180px] overflow-y-auto scrollbar-thin">
                  {result.improvementTips.map((tip, i) => (
                    <div key={i} className="flex gap-2.5 p-3 bg-muted/20 border border-border/40 rounded-xl text-xs text-foreground font-medium leading-relaxed">
                      <span className="text-primary">•</span> <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setResult(null)} className="w-full py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Analyze another resume
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- High-Fidelity Local SVG Logos for Big Tech Brands ---
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8 select-none">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const MetaIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#0064e0" strokeWidth="2.5" className="w-8 h-8 select-none">
    <path d="M16.5 6a5.5 5.5 0 0 0-4.5 8.66A5.5 5.5 0 1 0 7.5 18c3.2 0 5.5-3.14 9-6 2.1-1.72 3.5-3 5-3a2.5 2.5 0 1 1 0 5c-1.5 0-2.9-1.28-5-3-3.5-2.86-5.8-6-9-6a5.5 5.5 0 0 0 0 11 5.5 5.5 0 0 0 4.5-8.66" />
  </svg>
);

const NetflixIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8 select-none">
    <path fill="#E50914" d="M4 2v20h3.5v-7.1L16.5 22H20V2h-3.5v12.9L7.5 2H4z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-neutral-800 dark:text-neutral-200 select-none">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94.1.08.2.12.31.12.9 0 2.01-.63 2.5-1.45z" />
  </svg>
);

const AmazonIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8 select-none">
    <path fill="#FF9900" d="M18.8 17.5c-2.3 1.8-5.7 2.8-9 2.8-4.5 0-8.5-1.8-11.4-4.8-.3-.3-.1-.7.3-.5 3.2 1.4 6.8 2.2 10.6 2.2 3.3 0 6.6-.6 9.5-1.8.4-.2.6.2.3.4z" />
    <path fill="#FF9900" d="M19 15.5l1.6 2.2-2.7.4.3.4 2.2-1.5-1.4-1.5z" />
    <path fill="currentColor" className="text-neutral-800 dark:text-neutral-200" d="M12 3c-2.8 0-4.5 1.8-4.5 4.5 0 2.2 1.5 3.5 3.5 3.5 1.5 0 2.5-.8 3-1.5v1.2h1.5V3h-1.5v1.2c-.5-.7-1.5-1.2-2-1.2zm.2 6.5c-1.2 0-2.2-.8-2.2-2s1-2 2.2-2 2.2.8 2.2 2-1 2-2.2 2z" />
  </svg>
);

const MicrosoftIcon = () => (
  <svg viewBox="0 0 23 23" className="w-7 h-7 select-none">
    <rect x="0" y="0" width="11" height="11" fill="#F25022" />
    <rect x="12" y="0" width="11" height="11" fill="#7FBA00" />
    <rect x="0" y="12" width="11" height="11" fill="#01A6F0" />
    <rect x="12" y="12" width="11" height="11" fill="#FFB900" />
  </svg>
);

const TataIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8 select-none">
    <circle cx="12" cy="12" r="11" fill="#00539C" />
    <path d="M7 7h10v2h-4v8h-2V9H7V7z" fill="white" />
    <path d="M10 16a3 3 0 0 1 4 0" stroke="white" strokeWidth="1.5" fill="none" />
  </svg>
);

const OpenAIIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#10a37f] select-none">
    <path d="M21.7 10.9c-.1-.7-.4-1.3-.8-1.9.4-.6.6-1.3.6-2.1 0-1.1-.5-2.1-1.3-2.8-.7-.6-1.6-.9-2.6-.9-.3 0-.7 0-1 .1C16 1.8 14.5.9 12.8.9c-1.3 0-2.5.6-3.3 1.7-.5-.3-1.1-.4-1.7-.4-1.3 0-2.5.7-3.1 1.8C3.5 4.3 2.5 5.5 2.1 7c-.6.6-1 1.5-1.1 2.4-.1.7.1 1.5.4 2.1-.4.6-.6 1.3-.6 2.1 0 1.1.5 2.1 1.3 2.8.7.6 1.6.9 2.6.9.3 0 .7 0 1-.1.6 1.5 2.1 2.4 3.8 2.4 1.3 0 2.5-.6 3.3-1.7.5.3 1.1.4 1.7.4 1.3 0 2.5-.7 3.1-1.8 1.2-.3 2.2-1.5 2.6-3 .6-.6 1-1.5 1.1-2.4.1-.7-.1-1.5-.4-2.1.4-.6.6-1.3.6-2.1zm-8.9 9.8c-.8 0-1.5-.3-2-1l4.4-2.5 2 1.2c.4.2.7.6.8 1.1.1.5 0 1-.3 1.3-.3.4-.8.7-1.4.7-.6.1-1.1-.2-1.5-.8zm-4.7-2.7c-.4-.7-.4-1.5 0-2.2l4.4-2.5v5.1l-2.4-1.4c-.4-.2-.8-.6-1-1zm-2.4-6.3c.4-.7 1.1-1.1 1.9-1.1.3 0 .7 0 1 .1v5.1L4.8 12.3c-.4-.2-.7-.6-.8-1.1 0-.5.2-1 .5-1.3.4-.4 1-.7 1.6-.7.2.1.4.1.6.1zm1.4-4.8c.8 0 1.5.3 2 1l-4.4 2.5-2-1.2c-.4-.2-.7-.6-.8-1.1-.1-.5 0-1 .3-1.3.5-.6 1.3-.9 2.1-.9.9.1 1.8 1 2.8 1zm4.7 2.7c.4.7.4 1.5 0 2.2l-4.4 2.5V9.4l2.4 1.4c.4.2.8.6 1 1zm7.4 2.7c-.4.7-1.1 1.1-1.9 1.1-.3 0-.7 0-1-.1V9.4l4.4 2.5c.4.2.7.6.8 1.1.1.5-.1 1-.4 1.3-.4.4-.9.6-1.5.6-.2 0-.3-.1-.4-.1z" />
  </svg>
);

const COMPANY_LOGOS = {
  'google': GoogleIcon,
  'meta': MetaIcon,
  'netflix': NetflixIcon,
  'apple': AppleIcon,
  'amazon': AmazonIcon,
  'microsoft': MicrosoftIcon,
  'tata': TataIcon,
  'tcs': TataIcon,
  'tata consultancy services': TataIcon,
  'tata motors': TataIcon,
  'openai': OpenAIIcon
};

// --- Guess company domain for Clearbit logo fallback ---
function guessCompanyDomain(name) {
  if (!name) return null;
  const clean = name.toLowerCase().trim()
    .replace(/\s*(inc\.?|ltd\.?|llc|corp\.?|gmbh|pvt\.?|limited|technologies|consulting|solutions|services|group|labs|studio|software)\s*/gi, '')
    .trim();
  if (!clean) return null;
  // Common known domain overrides
  const domainMap = {
    'openai': 'openai.com', 'github': 'github.com', 'vercel': 'vercel.com',
    'stripe': 'stripe.com', 'discord': 'discord.com', 'docker': 'docker.com',
    'notion': 'notion.so', 'figma': 'figma.com', 'airbnb': 'airbnb.com',
    'postman': 'postman.com', 'netlify': 'netlify.com', 'cloudflare': 'cloudflare.com',
    'shopify': 'shopify.com', 'spotify': 'spotify.com', 'uber': 'uber.com',
    'lyft': 'lyft.com', 'slack': 'slack.com', 'zoom': 'zoom.us',
    'twilio': 'twilio.com', 'atlassian': 'atlassian.com', 'jira': 'atlassian.com',
    'salesforce': 'salesforce.com', 'oracle': 'oracle.com', 'ibm': 'ibm.com',
    'intel': 'intel.com', 'cisco': 'cisco.com', 'adobe': 'adobe.com',
    'paypal': 'paypal.com', 'linkedin': 'linkedin.com', 'twitter': 'twitter.com',
    'snap': 'snap.com', 'pinterest': 'pinterest.com', 'reddit': 'reddit.com',
    'dropbox': 'dropbox.com', 'elastic': 'elastic.co', 'datadog': 'datadoghq.com',
    'mongodb': 'mongodb.com', 'hashicorp': 'hashicorp.com', 'gitlab': 'gitlab.com',
    'bitbucket': 'bitbucket.org', 'digitalocean': 'digitalocean.com',
    'epam': 'epam.com', 'infosys': 'infosys.com', 'wipro': 'wipro.com',
    'hcl': 'hcltech.com', 'cognizant': 'cognizant.com', 'accenture': 'accenture.com',
    'capgemini': 'capgemini.com', 'deloitte': 'deloitte.com',
    'samsung': 'samsung.com', 'sony': 'sony.com', 'nvidia': 'nvidia.com',
    'amd': 'amd.com', 'qualcomm': 'qualcomm.com',
    'flipkart': 'flipkart.com', 'swiggy': 'swiggy.com', 'zomato': 'zomato.com',
    'razorpay': 'razorpay.com', 'paytm': 'paytm.com', 'phonepe': 'phonepe.com',
    'byju': 'byjus.com', 'ola': 'olacabs.com', 'meesho': 'meesho.com',
    'cred': 'cred.club', 'freshworks': 'freshworks.com', 'zoho': 'zoho.com',
    'thoughtworks': 'thoughtworks.com', 'vmware': 'vmware.com',
    'palantir': 'palantir.com', 'snowflake': 'snowflake.com',
    'coinbase': 'coinbase.com', 'robinhood': 'robinhood.com',
    'square': 'squareup.com', 'block': 'block.xyz',
  };
  for (const [key, domain] of Object.entries(domainMap)) {
    if (clean.includes(key)) return domain;
  }
  // Fallback: derive domain from company name
  const slug = clean.replace(/[^a-z0-9]/g, '');
  return slug ? `${slug}.com` : null;
}

// --- Company Logo Component with Error Fallback ---
function CompanyLogo({ logoUrl, companyName }) {
  const [imgError, setImgError] = useState(false);
  const [clearbitError, setClearbitError] = useState(false);

  const cleanName = companyName ? companyName.toLowerCase().trim() : '';
  
  // 1. Resolve local company brand icon matching
  let IconComponent = null;
  for (const [key, comp] of Object.entries(COMPANY_LOGOS)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      IconComponent = comp;
      break;
    }
  }

  if (IconComponent) {
    return (
      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 p-2 flex items-center justify-center shrink-0 border border-border/80 shadow-md group-hover:scale-105 transition-transform overflow-hidden select-none">
        <IconComponent />
      </div>
    );
  }

  // 2. Try the logo URL passed from the API
  if (logoUrl && !imgError) {
    return (
      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 p-2 flex items-center justify-center shrink-0 border border-border/80 shadow-md group-hover:scale-105 transition-transform overflow-hidden select-none">
        <img
          src={logoUrl}
          alt={`${companyName} Logo`}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // 3. Try Clearbit logo API as automatic fallback
  const domain = guessCompanyDomain(companyName);
  if (domain && !clearbitError) {
    return (
      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 p-2 flex items-center justify-center shrink-0 border border-border/80 shadow-md group-hover:scale-105 transition-transform overflow-hidden select-none">
        <img
          src={`https://logo.clearbit.com/${domain}`}
          alt={`${companyName} Logo`}
          onError={() => setClearbitError(true)}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // 4. Final fallback: styled initial letter
  return (
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary flex items-center justify-center text-lg font-black shrink-0 border border-primary/20 shadow-inner group-hover:scale-105 transition-transform select-none">
      {companyName ? companyName[0].toUpperCase() : 'J'}
    </div>
  );
}

// --- Main Jobs Component ---
export default function Jobs() {
  const { user } = useAuth();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [jobPool, setJobPool] = useState([]);

  // Feature states
  const [interviewJob, setInterviewJob] = useState(null);
  const [atsJob, setAtsJob] = useState(null);

  // Extract baseline user skills
  const github = user?.githubData || {};
  const [userSkillsSet, setUserSkillsSet] = useState(new Set([
    ...(github.languages?.map(l => l.language.toLowerCase()) || []),
    ...(github.frameworks?.map(f => f.toLowerCase()) || []),
    ...(user?.techStack?.map(s => s.toLowerCase()) || [])
  ]));

  useEffect(() => {
    const fetchRealData = async () => {
      const currentUserSkills = new Set([
        ...(github.languages?.map(l => l.language.toLowerCase()) || []),
        ...(github.frameworks?.map(f => f.toLowerCase()) || []),
        ...(user?.techStack?.map(s => s.toLowerCase()) || [])
      ]);

      try {
        let searchKeyword = user?.targetRole || 'developer';

        const { data: roadmapData } = await roadmapAPI.getAll();
        if (roadmapData.roadmaps && roadmapData.roadmaps.length > 0) {
          const roadmap = roadmapData.roadmaps[0];
          searchKeyword = roadmap.targetRole || searchKeyword;
          roadmap.weeks.forEach(w => { if (w.skills) w.skills.forEach(s => currentUserSkills.add(s.toLowerCase())); });
        }

        setLoading(true);
        // Use backend proxy to avoid CORS issues with Remotive API
        const { data: jobsData } = await jobsAPI.getJobs(searchKeyword, 80);

        if (jobsData.jobs) {
          const formattedJobs = jobsData.jobs.map(job => ({
            id: job.id,
            url: job.url,
            company: job.company_name,
            role: job.title,
            location: job.candidate_required_location || 'Remote',
            tags: job.tags || [],
            salary: job.salary ? job.salary.replace(/USD|EUR|GBP/gi, '').trim() : 'Competitive',
            posted: new Date(job.publication_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            hot: (Date.now() - new Date(job.publication_date).getTime() < 86400000 * 3),
            logo: job.logo || null
          }));
          // Store skills so calculateMatch can use them
          setUserSkillsSet(currentUserSkills);
          setJobPool(formattedJobs);
        }
      } catch (err) {
        console.error("Failed to fetch Job Board:", err);
        toast.error('Could not load jobs. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const calculateMatch = (tags) => {
    if (!userSkillsSet.size) return 45; // Default 45% if no skills data yet
    let matches = 0;
    tags.forEach(t => {
      const lowerT = t.toLowerCase();
      for (const skill of userSkillsSet) {
        if (lowerT.includes(skill) || skill.includes(lowerT)) {
          matches++;
          break;
        }
      }
    });
    const percentage = Math.round((matches / (tags.length || 1)) * 100);
    return Math.min(percentage + 30, 100);
  };

  const REAL_JOBS = jobPool
    .map(j => ({ ...j, match: calculateMatch(j.tags) }))
    .sort((a, b) => b.match - a.match);

  const filtered = REAL_JOBS.filter(j =>
    j.role.toLowerCase().includes(query.toLowerCase()) ||
    j.company.toLowerCase().includes(query.toLowerCase()) ||
    j.location.toLowerCase().includes(query.toLowerCase()) ||
    j.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  const handleApply = (job) => {
    toast.info(`Opening ${job.company} application page...`);
    window.open(job.url, '_blank', 'noopener,noreferrer');
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <RefreshCw size={32} className="animate-spin text-primary" />
      <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">Polling live global boards...</p>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6 pb-4">
      {/* Modals */}
      <AnimatePresence>
        {interviewJob && <InterviewSimulator job={interviewJob} onClose={() => setInterviewJob(null)} />}
        {atsJob && <ATSGrader job={atsJob} onClose={() => setAtsJob(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight mb-1">Live Job Match Engine</h1>
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
          Aggregating active remote opportunities mapped directly to your developer DNA.
          <span className="h-1.5 w-1.5 rounded-full bg-[#34A853] animate-pulse" />
        </p>
      </div>

      {/* Search & AI Tools Promo */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-60" />
          <input
            className="w-full bg-card/70 backdrop-blur-md border border-border/60 pl-11 pr-4 py-3 rounded-xl text-xs focus:outline-none focus:ring-2 ring-primary/20 transition-all font-medium text-foreground"
            placeholder="Search roles, verified companies, or tech tags..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-wider text-primary">
            <Brain size={14} /> AI Simulator Ready
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-orange-500/5 border border-orange-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider text-orange-500">
            <FileText size={14} /> ATS Scanner v2.0
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Live Openings', value: filtered.length, color: 'var(--color-primary)', icon: Briefcase },
          { label: 'Avg Match', value: `${Math.round(filtered.reduce((s, j) => s + j.match, 0) / (filtered.length || 1))}%`, color: '#34A853', icon: TrendingUp },
          { label: 'Recently Active', value: filtered.filter(j => j.hot).length, color: '#FBBC05', icon: Zap },
          { label: 'Match Verified', value: '100%', color: '#4285F4', icon: CheckCircle2 },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-card/70 backdrop-blur-md border border-border/60 p-4 rounded-xl shadow-sm flex items-center gap-3.5 hover:shadow-md transition-all duration-300">
            <div className="w-10 h-10 bg-muted/60 rounded-xl flex items-center justify-center shrink-0">
              <Icon size={16} style={{ color }} />
            </div>
            <div>
              <div className="text-base font-bold text-foreground leading-none mb-1">{value}</div>
              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 gap-4 pr-1">
        {filtered.map(job => {
          const color = matchColor(job.match);
          return (
            <motion.div
              layout key={job.id}
              className="bg-card/70 backdrop-blur-md border border-border/60 p-5 rounded-2xl shadow-md hover:shadow-xl hover:border-primary/30 transition-all flex flex-col md:flex-row gap-5 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <Tag className="text-muted-foreground/5" size={120} style={{ transform: 'rotate(-20deg) translate(40px, -20px)' }} />
              </div>

              {/* Company Logo Badge */}
              <CompanyLogo logoUrl={job.logo} companyName={job.company} />

              {/* Main Info */}
              <div className="flex-1 space-y-4 relative z-10">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="font-bold text-base text-foreground leading-tight">{job.role}</h3>
                      {job.hot && <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">🔥 NEW</span>}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-muted-foreground">
                      <span className="font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md text-[10px]">{job.company}</span>
                      <span className="flex items-center gap-1.5"><MapPin size={13} className="text-muted-foreground/60" /> {job.location}</span>
                      <span className="text-[#34A853] font-bold">{job.salary}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 md:self-start lg:self-center shrink-0">
                    <div className="text-right">
                      <div className="text-xl font-black text-foreground leading-none mb-0.5">{job.match}%</div>
                      <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">DNA Match</div>
                    </div>
                    <div className="w-11 h-11 relative flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="22" cy="22" r="18" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
                        <circle cx="22" cy="22" r="18" fill="transparent" stroke={color} strokeWidth="4" strokeDasharray={113} strokeDashoffset={113 - (job.match / 100) * 113} strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-[9px] font-black text-foreground">{job.match}%</span>
                    </div>
                  </div>
                </div>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {job.tags.slice(0, 6).map(tag => (
                    <span key={tag} className="text-[9px] font-black px-2 py-0.5 bg-muted/60 border border-border/50 rounded-lg text-muted-foreground uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action Row */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2.5 pt-2">
                  <button onClick={() => handleApply(job)} className="px-3 py-1.5 sm:px-5 sm:py-2.5 bg-primary hover:bg-primary-dark text-white text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer">
                    <Zap size={11} className="sm:w-[13px] sm:h-[13px]" /> Apply Now <ExternalLink size={9} className="opacity-70 sm:w-[11px] sm:h-[11px]" />
                  </button>
                  <button onClick={() => setInterviewJob(job)} className="px-3 py-1.5 sm:px-5 sm:py-2.5 bg-muted border border-border text-foreground text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl hover:bg-card hover:border-primary/30 transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95">
                    <Brain size={11} className="text-primary sm:w-[13px] sm:h-[13px]" /> AI Simulator
                  </button>
                  <button onClick={() => setAtsJob(job)} className="px-3 py-1.5 sm:px-5 sm:py-2.5 bg-muted border border-border text-foreground text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl hover:bg-card hover:border-orange-500/30 transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-95">
                    <FileText size={11} className="text-orange-500 sm:w-[13px] sm:h-[13px]" /> ATS Grader
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
