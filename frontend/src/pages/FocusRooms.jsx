import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { io } from 'socket.io-client';
import {
  Users, MessageSquare, Send, X, Brain, Music, Globe, Cloud, Settings,
  Trash2, ArrowLeft, Lock, Unlock, Shield, RefreshCw, Clock, AlertTriangle,
  Plus, RotateCcw, Sparkles, Activity, Copy, Check, Target, Flame, Zap,
  Code2, Terminal, Cpu, BookOpen, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { roomAPI, authAPI } from '@/api/client';

// ─── Socket ───────────────────────────────────────────────────────────────────
const socket = io(
  import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`,
  { autoConnect: true }
);

// ─── Design constants (Dashboard palette) ────────────────────────────────────
const GOOGLE = {
  blue:   '#4285F4',
  green:  '#34A853',
  red:    '#EA4335',
  yellow: '#FBBC05',
};

const CATEGORY_META = {
  Fullstack: { color: GOOGLE.blue,   label: 'FULLSTACK' },
  Frontend:  { color: GOOGLE.yellow, label: 'FRONTEND'  },
  Backend:   { color: GOOGLE.red,    label: 'BACKEND'   },
  DSA:       { color: GOOGLE.green,  label: 'DSA'       },
  DevOps:    { color: GOOGLE.red,    label: 'DEVOPS'    },
  AI:        { color: '#a855f7',     label: 'AI / ML'   },
  Other:     { color: '#6366f1',     label: 'OTHER'     },
};

const VIBES = {
  default: { label: 'Default',  color: '#6366f1', icon: '🎯', desc: 'Clean focus' },
  lofi:    { label: 'Lofi',     color: '#a855f7', icon: '🎵', desc: 'Chill vibes' },
  cyber:   { label: 'Cyber',    color: GOOGLE.blue, icon: '⚡', desc: 'Neon focus' },
  space:   { label: 'Space',    color: '#38bdf8', icon: '🚀', desc: 'Deep work' },
  forest:  { label: 'Forest',   color: GOOGLE.green, icon: '🌿', desc: 'Flow state' },
};

const STATUS_META = {
  FOCUSING: { label: 'FOCUSING', color: 'text-[#34A853] bg-[#34A853]/10 border-[#34A853]/20', dot: 'bg-[#34A853]' },
  BRB:      { label: 'BRB',      color: 'text-[#FBBC05] bg-[#FBBC05]/10 border-[#FBBC05]/20', dot: 'bg-[#FBBC05]' },
  DONE:     { label: 'DONE',     color: 'text-[#4285F4] bg-[#4285F4]/10 border-[#4285F4]/20', dot: 'bg-[#4285F4]' },
};

const REACTIONS = ['🔥', '💡', '✅', '🤔', '❓', '🚀'];

const AMBIENCE = [
  { id: 'lofi',  name: 'Lofi',  icon: Music, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'space', name: 'Space', icon: Globe, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'rain',  name: 'Rain',  icon: Cloud, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

// ─── Vibe animated background component ──────────────────────────────────────
function VibeBackground({ vibe }) {
  if (vibe === 'cyber') return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.06]">
      <div className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${GOOGLE.blue}44 1px, transparent 1px), linear-gradient(90deg, ${GOOGLE.blue}44 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#4285F4] to-transparent animate-pulse" />
    </div>
  );
  if (vibe === 'lofi') return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.08]">
      {[...Array(8)].map((_, i) => (
        <div key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            width: `${80 + i * 30}px`, height: `${80 + i * 30}px`,
            background: `radial-gradient(circle, #a855f788, transparent)`,
            left: `${(i * 137.5) % 100}%`, top: `${(i * 93.7) % 100}%`,
            animation: `pulse ${3 + i}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
  if (vibe === 'space') return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <div key={i}
          className="absolute rounded-full"
          style={{
            width: `${1 + (i % 3)}px`, height: `${1 + (i % 3)}px`,
            background: i % 5 === 0 ? '#4285F4' : '#ffffff',
            opacity: 0.2 + (i % 4) * 0.1,
            left: `${(i * 37.1) % 100}%`, top: `${(i * 61.3) % 100}%`,
            animation: `pulse ${2 + (i % 4)}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
  if (vibe === 'forest') return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.06]">
      <div className="absolute inset-0" style={{
        backgroundImage: `radial-gradient(ellipse at 20% 80%, #34A85340 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, #34A85320 0%, transparent 50%)`,
      }} />
    </div>
  );
  return null;
}

// ─── Code block renderer ──────────────────────────────────────────────────────
function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative bg-[#1e1e2e] border border-border/60 rounded-xl overflow-hidden my-1 group/code">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-b border-border/40">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#EA4335]/60" />
          <span className="w-2 h-2 rounded-full bg-[#FBBC05]/60" />
          <span className="w-2 h-2 rounded-full bg-[#34A853]/60" />
        </div>
        <button onClick={copy} className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
          {copied ? <><Check size={9} className="text-[#34A853]" /> Copied</> : <><Copy size={9} /> Copy</>}
        </button>
      </div>
      <pre className="p-3 text-[11px] text-[#a6e3a1] font-mono leading-relaxed overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, isOwn, onReact, reactions = {} }) {
  const [showPicker, setShowPicker] = useState(false);
  const isCode = msg.message?.startsWith('```');
  const code = isCode ? msg.message.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '') : null;
  const text = isCode ? null : msg.message;

  const reactionEntries = Object.entries(reactions);

  return (
    <div
      className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} group`}
      onMouseEnter={() => setShowPicker(true)}
      onMouseLeave={() => setShowPicker(false)}
    >
      <div className="flex items-center gap-1.5 px-1 mb-1">
        {!isOwn && <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{msg.user?.name}</span>}
        {msg.user?.role && (
          <span className="text-[7px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider"
            style={{ color: GOOGLE.blue, background: `${GOOGLE.blue}15`, borderColor: `${GOOGLE.blue}30` }}>
            {msg.user.role}
          </span>
        )}
        {isOwn && <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">You</span>}
      </div>

      <div className="relative">
        {/* Reaction picker */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 4 }}
              className={`absolute ${isOwn ? 'right-0' : 'left-0'} -top-9 z-10 flex gap-1 bg-card border border-border/60 rounded-full px-2 py-1 shadow-lg`}
            >
              {REACTIONS.map(emoji => (
                <button key={emoji} onClick={() => onReact(msg.msgId, emoji)}
                  className="text-sm hover:scale-125 transition-transform">
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`p-3 rounded-2xl text-[13px] font-medium max-w-[80%] shadow-sm transition-all ${
          isOwn
            ? 'bg-[#4285F4]/10 border border-[#4285F4]/20 text-foreground rounded-tr-none'
            : 'bg-card/80 border border-border/50 text-foreground rounded-tl-none'
        }`}>
          {isCode ? <CodeBlock code={code} /> : <p className="leading-relaxed whitespace-pre-wrap">{text}</p>}
        </div>
      </div>

      {/* Reactions display */}
      {reactionEntries.length > 0 && (
        <div className="flex gap-1 mt-1 flex-wrap">
          {reactionEntries.map(([emoji, users]) => (
            <button key={emoji} onClick={() => onReact(msg.msgId, emoji)}
              className="flex items-center gap-1 text-[10px] bg-muted/50 border border-border/40 rounded-full px-2 py-0.5 hover:bg-muted transition-colors">
              {emoji} <span className="font-bold text-muted-foreground">{users.length}</span>
            </button>
          ))}
        </div>
      )}

      <span className="text-[8px] text-muted-foreground/50 px-1 mt-0.5">
        {new Date(msg.timestamp || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function FocusRooms() {
  const { user } = useAuth();
  const toast = useToast();

  // Room list
  const [rooms, setRooms]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [roomCounts, setRoomCounts] = useState({});

  // Active session
  const [activeRoom, setActiveRoom]     = useState(null);
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState('');
  const [attendees, setAttendees]       = useState([]);

  // New features state
  const [typingUsers, setTypingUsers]   = useState({}); // { socketId: name }
  const [reactions, setReactions]       = useState({}); // { msgId: { emoji: [userName] } }
  const [myStatus, setMyStatus]         = useState('FOCUSING');
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  const [attendeeStatuses, setAttendeeStatuses] = useState({}); // { socketId: status }

  // Pomodoro
  const [timer, setTimer]               = useState(25 * 60);
  const [initialTime]                   = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeAmbience, setActiveAmbience] = useState(null);

  // Modals
  const [showModal, setShowModal]         = useState(false);
  const [isEditing, setIsEditing]         = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [roomData, setRoomData]           = useState({
    name: '', description: '', category: 'Fullstack', color: '#4285F4',
    isPrivate: false, password: '', vibe: 'default', sessionGoal: ''
  });
  const [showPassPrompt, setShowPassPrompt] = useState(false);
  const [passInput, setPassInput]           = useState('');
  const [targetRoom, setTargetRoom]         = useState(null);

  // Refs
  const audioRef   = useRef(null);
  const scrollRef  = useRef();
  const typingRef  = useRef(null);

  // ── Countdown helper ───────────────────────────────────────────────────────
  const getTimeRemaining = useCallback((expiresAt) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return { h, m, totalMs: diff };
  }, []);

  const formatCountdown = (expiresAt) => {
    const t = getTimeRemaining(expiresAt);
    if (!t) return 'Expired';
    if (t.h > 0) return `${t.h}h ${t.m}m left`;
    return `${t.m}m left`;
  };

  // Tick every minute for countdown refresh
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // ── Fetch rooms ────────────────────────────────────────────────────────────
  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await roomAPI.getAll();
      if (res.data.success) setRooms(res.data.rooms);
    } catch { toast.error('Could not load chambers.'); }
    finally { setLoading(false); }
  }, [toast]);

  const exitRoom = useCallback(() => {
    setActiveRoom(null); setMessages([]); setAttendees([]);
    setTypingUsers({}); setReactions({}); setMyStatus('FOCUSING');
    setPomodorosCompleted(0); setTimer(25 * 60); setIsTimerRunning(false);
    fetchRooms();
  }, [fetchRooms]);

  // ── Initial socket setup ───────────────────────────────────────────────────
  useEffect(() => {
    fetchRooms();
    socket.on('room-counts', counts => setRoomCounts(counts));
    socket.emit('get-room-counts');
    socket.on('rooms-updated', fetchRooms);
    return () => { socket.off('room-counts'); socket.off('rooms-updated'); };
  }, [fetchRooms]);

  // ── Active room socket events ──────────────────────────────────────────────
  useEffect(() => {
    if (!activeRoom || !user) return;
    const roomId = activeRoom._id;

    socket.emit('join-room', { roomId, user: { name: user.name, role: user.targetRole } });

    socket.on('user-joined', data => {
      setMessages(prev => [...prev, { system: true, content: `${data.name} joined the chamber.`, timestamp: new Date().toISOString() }]);
      setAttendees(data.roomUsers || []);
    });
    socket.on('new-message', data => setMessages(prev => [...prev, data]));
    socket.on('user-left', data => {
      setMessages(prev => [...prev, { system: true, content: `${data.name} left.`, timestamp: new Date().toISOString() }]);
      setAttendees(data.roomUsers || []);
    });
    socket.on('room-users', users => setAttendees(users));

    // Typing indicators
    socket.on('user-typing', ({ name, socketId }) => {
      setTypingUsers(prev => ({ ...prev, [socketId]: name }));
    });
    socket.on('user-stopped-typing', ({ socketId }) => {
      setTypingUsers(prev => { const n = { ...prev }; delete n[socketId]; return n; });
    });

    // Reactions
    socket.on('reaction-update', ({ msgId, emoji, userName }) => {
      setReactions(prev => {
        const msgReactions = { ...(prev[msgId] || {}) };
        const users = msgReactions[emoji] || [];
        if (users.includes(userName)) {
          msgReactions[emoji] = users.filter(u => u !== userName);
          if (msgReactions[emoji].length === 0) delete msgReactions[emoji];
        } else {
          msgReactions[emoji] = [...users, userName];
        }
        return { ...prev, [msgId]: msgReactions };
      });
    });

    // Status changes
    socket.on('user-status-changed', ({ socketId, status }) => {
      setAttendeeStatuses(prev => ({ ...prev, [socketId]: status }));
    });

    // Room expiry
    socket.on('room-expired', ({ roomId: expiredId, message }) => {
      if (expiredId === roomId) {
        toast.error(message || 'This chamber has expired after 24 hours.');
        exitRoom();
      }
    });

    return () => {
      socket.emit('leave-room', { roomId, user: { name: user.name } });
      ['user-joined','new-message','user-left','room-users',
       'user-typing','user-stopped-typing','reaction-update',
       'user-status-changed','room-expired'].forEach(e => socket.off(e));
    };
  }, [activeRoom, user, exitRoom, toast]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // ── Pomodoro timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    let id;
    if (isTimerRunning && timer > 0) {
      id = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setPomodorosCompleted(p => p + 1);
      toast.success('🍅 Pomodoro complete! +25 XP earned!');
      // Award XP
      try { authAPI.updateProfile({ xpIncrement: 25 }); } catch (err) {
        console.error('Failed to award XP:', err);
      }
    }
    return () => clearInterval(id);
  }, [isTimerRunning, timer, toast]);

  const formatTimer = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const timerProgress = ((initialTime - timer) / initialTime) * 100;

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = () => {
    if (!input.trim() || !activeRoom) return;
    const msgId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    socket.emit('send-message', {
      roomId: activeRoom._id, message: input, msgId,
      user: { name: user.name, role: user.targetRole }
    });
    socket.emit('typing-stop', { roomId: activeRoom._id });
    setInput('');
  };

  // ── Typing indicator ──────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (!activeRoom) return;
    socket.emit('typing-start', { roomId: activeRoom._id, user: { name: user.name } });
    clearTimeout(typingRef.current);
    typingRef.current = setTimeout(() => {
      socket.emit('typing-stop', { roomId: activeRoom._id });
    }, 1500);
  };

  // ── React to message ──────────────────────────────────────────────────────
  const handleReact = (msgId, emoji) => {
    if (!activeRoom) return;
    socket.emit('reaction-add', { roomId: activeRoom._id, msgId, emoji, userName: user.name });
  };

  // ── Status change ──────────────────────────────────────────────────────────
  const changeStatus = (status) => {
    setMyStatus(status);
    if (!activeRoom) return;
    socket.emit('status-change', { roomId: activeRoom._id, status, user: { name: user.name } });
  };

  // ── Ambience ──────────────────────────────────────────────────────────────
  const toggleAmbience = (sound) => {
    if (activeAmbience?.id === sound.id) {
      audioRef.current?.pause(); setActiveAmbience(null);
    } else {
      setActiveAmbience(sound);
      if (audioRef.current) { audioRef.current.src = sound.url; audioRef.current.play(); }
    }
  };

  // ── Room actions ──────────────────────────────────────────────────────────

  const handleJoin = (room) => {
    if (room.isPrivate && room.createdBy !== user?._id) {
      setTargetRoom(room); setShowPassPrompt(true);
    } else { setActiveRoom(room); }
  };

  const verifyAndJoin = async () => {
    try {
      const res = await roomAPI.verifyPassword(targetRoom._id, passInput);
      if (res.data.success) { setActiveRoom(targetRoom); setShowPassPrompt(false); setPassInput(''); toast.success('Access granted.'); }
    } catch { toast.error('Invalid access key.'); }
  };

  const handleSubmit = async () => {
    if (!roomData.name || !roomData.description) return toast.error('Fill all required fields.');
    if (roomData.isPrivate && !roomData.password) return toast.error('Access key required for private rooms.');
    try {
      if (isEditing) {
        const res = await roomAPI.update(editingId, roomData);
        if (res.data.success) setRooms(r => r.map(x => x._id === editingId ? res.data.room : x));
        toast.success('Chamber updated.');
      } else {
        const res = await roomAPI.create(roomData);
        if (res.data.success) setRooms(r => [res.data.room, ...r]);
        toast.success('Chamber initialized.');
      }
      closeModal();
    } catch { toast.error('Operation failed.'); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Decommission this chamber?')) return;
    try {
      const res = await roomAPI.delete(id);
      if (res.data.success) { setRooms(r => r.filter(x => x._id !== id)); toast.success('Chamber removed.'); }
    } catch { toast.error('Delete failed.'); }
  };

  const openEdit = (room, e) => {
    e.stopPropagation();
    setIsEditing(true); setEditingId(room._id);
    setRoomData({ name: room.name, description: room.description, category: room.category,
      color: room.color, isPrivate: room.isPrivate, password: room.password || '',
      vibe: room.vibe || 'default', sessionGoal: room.sessionGoal || '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false); setIsEditing(false); setEditingId(null);
    setRoomData({ name: '', description: '', category: 'Fullstack', color: '#4285F4', isPrivate: false, password: '', vibe: 'default', sessionGoal: '' });
  };

  if (!user) return null;

  const typingList = Object.values(typingUsers);

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col min-h-0 w-full animate-in fade-in duration-500 overflow-hidden font-sans">
      <audio ref={audioRef} loop />

      {/* ══════════════════════════════ LOBBY ══════════════════════════════ */}
      {!activeRoom ? (
        <div className="flex-1 flex flex-col min-h-0 space-y-5 p-5">

          {/* Header — same style as Dashboard command bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card border border-border/80 p-6 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Focus Chambers
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest"
                  style={{ color: GOOGLE.blue, background: `${GOOGLE.blue}15`, borderColor: `${GOOGLE.blue}30` }}>
                  LIVE
                </span>
              </h1>
              <p className="text-xs font-semibold text-muted-foreground">
                Synchronized deep-work zones · <span style={{ color: GOOGLE.green }}>{rooms.length} chambers active</span>
              </p>
            </div>
            <div className="flex gap-2.5">
              <button onClick={fetchRooms} className="flex items-center gap-1.5 px-4 py-2 bg-card border border-border hover:bg-muted text-xs font-semibold text-foreground transition-all shadow-sm rounded-lg hover:border-primary/40 duration-200">
                <RefreshCw size={13} className="text-primary" /> Refresh
              </button>
              <button onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-semibold shadow-sm transition-all rounded-lg duration-200">
                <Plus size={13} /> New Chamber
              </button>
            </div>
          </div>

          {/* Room grid — Dashboard bento style */}
          <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-[220px] bg-muted/40 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : rooms.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 border"
                  style={{ background: `${GOOGLE.blue}15`, borderColor: `${GOOGLE.blue}30`, color: GOOGLE.blue }}>
                  <Target size={24} />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1">No chambers online</h3>
                <p className="text-xs text-muted-foreground mb-6">Create the first focus chamber and invite others.</p>
                <button onClick={() => setShowModal(true)} className="btn-primary py-2.5 px-6 rounded-lg text-xs font-semibold">
                  Initialize First Chamber
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
                {rooms.map(room => {
                  const catMeta = CATEGORY_META[room.category] || CATEGORY_META.Other;
                  const vibeMeta = VIBES[room.vibe || 'default'];
                  const countdown = getTimeRemaining(room.expiresAt);
                  const isUrgent = countdown && countdown.totalMs < 60 * 60 * 1000;

                  return (
                    <motion.div
                      key={room._id}
                      whileHover={{ y: -3, scale: 1.01 }}
                      onClick={() => handleJoin(room)}
                      className="group bg-card border border-border/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col h-[220px] overflow-hidden border-t-4"
                      style={{ borderTopColor: catMeta.color }}
                    >
                      <div className="flex-1 p-5 flex flex-col">
                        {/* Top badges row */}
                        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border"
                            style={{ color: catMeta.color, background: `${catMeta.color}15`, borderColor: `${catMeta.color}30` }}>
                            {catMeta.label}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-muted/60 border border-border/50 text-muted-foreground">
                            {vibeMeta.icon} {vibeMeta.label}
                          </span>
                          {room.isPrivate && <Lock size={11} className="text-muted-foreground/60" />}
                        </div>

                        {/* Name + description */}
                        <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors mb-1.5">
                          {room.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed font-medium flex-1">
                          {room.description}
                        </p>

                        {/* Session goal preview */}
                        {room.sessionGoal && (
                          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Target size={9} style={{ color: catMeta.color }} />
                            <span className="truncate italic">{room.sessionGoal}</span>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="px-5 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#34A853] animate-pulse" />
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                              {roomCounts[room._id] || 0} online
                            </span>
                          </div>
                          {countdown && (
                            <span className={`flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wider ${
                              isUrgent ? 'text-[#EA4335] bg-[#EA4335]/10 border-[#EA4335]/20' : 'text-muted-foreground bg-muted/40 border-border/40'
                            }`}>
                              <Clock size={7} /> {formatCountdown(room.expiresAt)}
                            </span>
                          )}
                        </div>
                        {room.createdBy === user._id && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={e => openEdit(room, e)} className="p-1 hover:text-primary transition-colors text-muted-foreground rounded-md hover:bg-muted/60"><Settings size={12} /></button>
                            <button onClick={e => handleDelete(room._id, e)} className="p-1 hover:text-[#EA4335] transition-colors text-muted-foreground rounded-md hover:bg-muted/60"><Trash2 size={12} /></button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      ) : (
        /* ════════════════════════ ACTIVE ROOM ════════════════════════════ */
        <div className="flex-1 flex flex-col min-h-0 space-y-3 p-3 sm:p-4 animate-in zoom-in duration-300">

          {/* Room header bar */}
          <div className="shrink-0 bg-card border border-border/80 rounded-2xl px-4 py-3 shadow-sm border-t-4"
            style={{ borderTopColor: CATEGORY_META[activeRoom.category]?.color || GOOGLE.blue }}>
            {/* Top row: back button + room name */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <button onClick={exitRoom}
                  className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors shrink-0">
                  <ArrowLeft size={14} /> <span className="hidden sm:inline">Lobby</span>
                </button>
                <span className="w-px h-4 bg-border shrink-0" />
                <div className="min-w-0">
                  <h2 className="font-bold text-sm text-foreground truncate">{activeRoom.name}</h2>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                    {VIBES[activeRoom.vibe || 'default'].icon} {VIBES[activeRoom.vibe || 'default'].label} · {CATEGORY_META[activeRoom.category]?.label}
                  </p>
                </div>
              </div>
              {/* Expiry badge */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg border bg-[#34A853]/5 border-[#34A853]/20 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34A853] animate-pulse" />
                <span className="text-[8px] font-black text-[#34A853] uppercase tracking-widest hidden sm:inline">LIVE · </span>
                <span className="text-[8px] font-black text-[#34A853] uppercase tracking-widest">{formatCountdown(activeRoom.expiresAt)}</span>
              </div>
            </div>

            {/* Bottom row: status + ambience controls */}
            <div className="flex items-center justify-between gap-2 mt-2.5 pt-2.5 border-t border-border/40">
              {/* My status selector */}
              <div className="flex gap-1 flex-wrap">
                {Object.entries(STATUS_META).map(([s, meta]) => (
                  <button key={s} onClick={() => changeStatus(s)}
                    className={`text-[8px] font-black px-2 py-1 rounded-full border uppercase tracking-widest transition-all ${
                      myStatus === s ? meta.color : 'text-muted-foreground bg-muted/30 border-border/40 hover:bg-muted/60'
                    }`}>
                    {meta.label}
                  </button>
                ))}
              </div>
              {/* Ambience */}
              <div className="flex gap-1 shrink-0">
                {AMBIENCE.map(s => (
                  <button key={s.id} onClick={() => toggleAmbience(s)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
                      activeAmbience?.id === s.id
                        ? 'border-primary text-primary bg-primary/10'
                        : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                    }`}>
                    <s.icon size={12} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-0 overflow-hidden">

            {/* ── Chat panel ── */}
            <div className="flex-1 flex flex-col bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden min-h-0 relative">
              <VibeBackground vibe={activeRoom.vibe || 'default'} />

              {/* Expiry warning */}
              {activeRoom.expiresAt && (() => {
                const t = getTimeRemaining(activeRoom.expiresAt);
                if (!t || t.totalMs >= 60 * 60 * 1000) return null;
                return (
                  <div className="px-4 py-2 bg-[#EA4335]/5 border-b border-[#EA4335]/20 flex items-center gap-2 shrink-0 relative z-10">
                    <AlertTriangle size={11} className="text-[#EA4335] shrink-0" />
                    <p className="text-[10px] font-bold text-[#EA4335] uppercase tracking-wider">
                      Chamber closes in {formatCountdown(activeRoom.expiresAt)} — save important notes!
                    </p>
                  </div>
                );
              })()}

              {/* Session goal pinned banner */}
              {activeRoom.sessionGoal && (
                <div className="px-4 py-2.5 border-b border-border/40 shrink-0 relative z-10"
                  style={{ background: `${CATEGORY_META[activeRoom.category]?.color || GOOGLE.blue}08` }}>
                  <div className="flex items-center gap-2">
                    <Target size={12} style={{ color: CATEGORY_META[activeRoom.category]?.color || GOOGLE.blue }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SESSION GOAL</span>
                  </div>
                  <p className="text-xs font-semibold text-foreground mt-0.5">{activeRoom.sessionGoal}</p>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 relative z-10">
                {messages.map((m, i) =>
                  m.system ? (
                    <div key={i} className="flex justify-center">
                      <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest bg-muted/30 px-3 py-1 rounded-full border border-border/40">
                        {m.content}
                      </span>
                    </div>
                  ) : (
                    <MessageBubble
                      key={m.msgId || i}
                      msg={m}
                      isOwn={m.user?.name === user.name}
                      onReact={handleReact}
                      reactions={reactions[m.msgId] || {}}
                    />
                  )
                )}
                {/* Typing indicator */}
                {typingList.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[0,1,2].map(i => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground italic">
                      {typingList.slice(0,2).join(', ')} {typingList.length === 1 ? 'is' : 'are'} typing...
                    </span>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>

              {/* Input */}
              <div className="p-3 sm:p-4 border-t border-border/50 shrink-0 relative z-10 bg-card/80 backdrop-blur-sm">
                <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-2 hidden sm:block">
                  Tip: start with ``` for a code block
                </div>
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Message... (Enter to send)"
                    className="flex-1 min-w-0 bg-muted/50 border border-border/60 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-primary/60 shadow-sm transition-colors"
                  />
                  <button onClick={handleSend}
                    className="px-4 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl font-semibold text-xs transition-all shadow-sm hover:scale-[1.02] active:scale-95 shrink-0">
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Sidebar ── */}
            <div className="w-full lg:w-72 flex flex-col sm:flex-row lg:flex-col gap-3 overflow-y-auto lg:overflow-y-auto shrink-0">

              {/* Pomodoro — Dashboard ring style */}
              <div className="bg-card border border-border/80 border-t-4 rounded-2xl p-4 shadow-sm flex flex-col items-center flex-1 sm:flex-none lg:flex-none"
                style={{ borderTopColor: GOOGLE.red }}>
                <div className="w-full flex justify-between items-start mb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border"
                      style={{ color: GOOGLE.red, background: `${GOOGLE.red}15`, borderColor: `${GOOGLE.red}30` }}>
                      POMODORO
                    </span>
                    <h4 className="font-bold text-foreground text-sm tracking-tight mt-1.5">Focus Timer</h4>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">🍅 {pomodorosCompleted}</p>
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">sessions</p>
                  </div>
                </div>

                {/* Ring */}
                <div className="relative w-32 h-32 my-2">
                  <svg width="100%" height="100%" viewBox="0 0 120 120" className="-rotate-90">
                    <circle cx="60" cy="60" r="48" fill="none" stroke="var(--color-border)" strokeWidth="8" opacity="0.3" />
                    <circle cx="60" cy="60" r="48" fill="none" stroke={GOOGLE.red} strokeWidth="8"
                      strokeDasharray="301.6"
                      strokeDashoffset={301.6 - (301.6 * timerProgress / 100)}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1">
                      {isTimerRunning && <Sparkles size={8} className="animate-pulse" style={{ color: GOOGLE.red }} />}
                      FOCUS
                    </span>
                    <span className="text-2xl font-bold text-foreground tabular-nums tracking-tight">{formatTimer(timer)}</span>
                  </div>
                </div>

                <div className="flex gap-2 w-full mt-3">
                  <button onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="flex-1 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm hover:scale-[1.02] active:scale-95 text-white"
                    style={{ backgroundColor: isTimerRunning ? '#6b7280' : GOOGLE.red }}>
                    {isTimerRunning ? 'Pause' : 'Start Session'}
                  </button>
                  <button onClick={() => { setTimer(25 * 60); setIsTimerRunning(false); }}
                    className="p-2 bg-muted border border-border rounded-xl hover:bg-muted/80 transition-all text-muted-foreground hover:text-foreground hover:scale-[1.02]">
                    <RotateCcw size={14} />
                  </button>
                </div>

                {/* Duration presets */}
                <div className="flex gap-2 w-full mt-2">
                  {[[15,'15m'],[25,'25m'],[50,'50m']].map(([mins, label]) => (
                    <button key={mins} onClick={() => { setTimer(mins * 60); setIsTimerRunning(false); }}
                      className={`flex-1 py-1 rounded-lg text-[9px] font-bold border transition-all uppercase tracking-wider ${
                        initialTime === mins * 60 ? 'border-[#EA4335]/40 text-[#EA4335] bg-[#EA4335]/10' : 'border-border/50 text-muted-foreground hover:bg-muted/60'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Attendees — Dashboard metric cell style */}
              <div className="bg-card border border-border/80 border-t-4 rounded-2xl p-4 shadow-sm flex flex-col flex-1 min-h-[160px] lg:min-h-0"
                style={{ borderTopColor: GOOGLE.green }}>
                <div className="mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border"
                    style={{ color: GOOGLE.green, background: `${GOOGLE.green}15`, borderColor: `${GOOGLE.green}30` }}>
                    SYNCED
                  </span>
                  <h4 className="font-bold text-foreground text-sm tracking-tight mt-1.5 flex items-center gap-1.5">
                    <Activity size={12} style={{ color: GOOGLE.green }} className="animate-pulse" />
                    Active Syncs ({attendees.length})
                  </h4>
                </div>

                <div className="space-y-2 overflow-y-auto flex-1 pr-0.5">
                  {attendees.map((a, i) => {
                    const status = attendeeStatuses[a.socketId] || (a.name === user.name ? myStatus : 'FOCUSING');
                    const sMeta = STATUS_META[status] || STATUS_META.FOCUSING;
                    return (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/50 border border-border/40 hover:bg-muted/70 transition-all">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative shrink-0">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-[11px] shadow-sm"
                              style={{ backgroundColor: CATEGORY_META[activeRoom.category]?.color || GOOGLE.blue }}>
                              {a.name[0]?.toUpperCase()}
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-card ${sMeta.dot}`} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground truncate">{a.name}</p>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{a.role || 'Member'}</p>
                          </div>
                        </div>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-widest ${sMeta.color}`}>
                          {status}
                        </span>
                      </div>
                    );
                  })}
                  {attendees.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">Waiting for others to join...</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════ CREATE/EDIT MODAL ══════════════════════════ */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl z-10 overflow-y-auto max-h-[90vh]">

              {/* Modal header — Dashboard style */}
              <div className="p-6 border-b border-border flex justify-between items-center border-t-4"
                style={{ borderTopColor: roomData.color || GOOGLE.blue }}>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{isEditing ? 'Update' : 'New'} Chamber</h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">FOCUS INFRASTRUCTURE</p>
                </div>
                <button onClick={closeModal} className="text-muted-foreground hover:text-foreground p-1 transition-colors"><X size={20} /></button>
              </div>

              <div className="p-6 space-y-5">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Chamber Identity</label>
                  <input type="text" value={roomData.name} onChange={e => setRoomData({ ...roomData, name: e.target.value })}
                    placeholder="e.g. MERN Deep Dive" maxLength={50}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-primary shadow-sm" />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Mission Brief</label>
                  <textarea rows={2} value={roomData.description} onChange={e => setRoomData({ ...roomData, description: e.target.value })}
                    placeholder="What will this chamber focus on?" maxLength={200}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-primary resize-none shadow-sm" />
                </div>

                {/* Session Goal */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Session Goal (optional)</label>
                  <input type="text" value={roomData.sessionGoal} onChange={e => setRoomData({ ...roomData, sessionGoal: e.target.value })}
                    placeholder="e.g. Complete Chapter 5 of React docs" maxLength={200}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-primary shadow-sm" />
                  <p className="text-[9px] text-muted-foreground">Pinned for all attendees to see</p>
                </div>

                {/* Category + Vibe */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sector</label>
                    <select value={roomData.category} onChange={e => setRoomData({ ...roomData, category: e.target.value })}
                      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-primary">
                      {Object.keys(CATEGORY_META).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Room Vibe</label>
                    <select value={roomData.vibe} onChange={e => setRoomData({ ...roomData, vibe: e.target.value })}
                      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-primary">
                      {Object.entries(VIBES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                    </select>
                  </div>
                </div>

                {/* Color accent */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Accent Color</label>
                  <div className="flex gap-2 p-3 bg-muted/50 rounded-xl border border-border">
                    {[GOOGLE.blue, GOOGLE.green, GOOGLE.red, GOOGLE.yellow, '#a855f7', '#6366f1'].map(c => (
                      <button key={c} onClick={() => setRoomData({ ...roomData, color: c })}
                        className={`w-7 h-7 rounded-lg transition-all ${roomData.color === c ? 'ring-2 ring-primary ring-offset-2 ring-offset-card scale-110' : 'opacity-50 hover:opacity-100 hover:scale-105'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>

                {/* Privacy */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${roomData.isPrivate ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted/50 border-border text-muted-foreground'}`}>
                      {roomData.isPrivate ? <Lock size={15} /> : <Unlock size={15} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Private Chamber</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Require access key</p>
                    </div>
                  </div>
                  <input type="checkbox" checked={roomData.isPrivate} onChange={e => setRoomData({ ...roomData, isPrivate: e.target.checked })}
                    className="w-4 h-4 accent-primary cursor-pointer" />
                </div>

                {roomData.isPrivate && (
                  <div className="space-y-1.5 animate-in slide-in-from-top fade-in">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Access Key</label>
                    <input type="password" value={roomData.password} onChange={e => setRoomData({ ...roomData, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-sm font-bold tracking-widest focus:outline-none focus:border-primary shadow-sm" />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button onClick={closeModal} className="flex-1 py-2.5 bg-muted border border-border rounded-xl font-bold text-sm hover:bg-muted/80 transition-all">Discard</button>
                  <button onClick={handleSubmit}
                    className="flex-1 py-2.5 text-white rounded-xl font-bold text-sm shadow-sm transition-all hover:scale-[1.01] hover:opacity-95"
                    style={{ backgroundColor: roomData.color || GOOGLE.blue }}>
                    {isEditing ? 'Update Chamber' : 'Initialize Chamber'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════ PASSWORD MODAL ══════════════════════════════ */}
      <AnimatePresence>
        {showPassPrompt && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPassPrompt(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-card border border-border rounded-2xl p-8 shadow-2xl z-10 text-center border-t-4"
              style={{ borderTopColor: GOOGLE.blue }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 border"
                style={{ background: `${GOOGLE.blue}15`, borderColor: `${GOOGLE.blue}30`, color: GOOGLE.blue }}>
                <Shield size={28} />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">Restricted Access</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Verification Required</p>
              <input type="password" value={passInput} onChange={e => setPassInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verifyAndJoin()}
                placeholder="Enter access key" autoFocus
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 text-center text-sm font-bold tracking-widest focus:outline-none focus:border-primary shadow-sm mb-5" />
              <div className="flex gap-3">
                <button onClick={() => setShowPassPrompt(false)} className="flex-1 py-2.5 bg-muted border border-border rounded-xl font-bold text-sm hover:bg-muted/80 transition-all">Abort</button>
                <button onClick={verifyAndJoin}
                  className="flex-1 py-2.5 text-white rounded-xl font-bold text-sm shadow-sm transition-all"
                  style={{ backgroundColor: GOOGLE.blue }}>
                  Authorize
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
