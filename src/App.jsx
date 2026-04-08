import React, { useState, useEffect } from 'react';
import { Upload, Download, Copy, Check, FileText, Loader2, ShieldCheck, ArrowRight, Files, Zap } from 'lucide-react';
import { Waves } from './Waves.jsx'; 

const App = () => {
  const [tab, setTab] = useState('upload'); 
  const [file, setFile] = useState(null);
  const [code, setCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');

  const API_URL = "https://file-transfer-system-ug93.onrender.com"; 

useEffect(() => {
    const checkServer = async () => {
      setServerStatus('checking'); 

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      try {
        const res = await fetch(`${API_URL}/?t=${Date.now()}`, {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal 
        });
        
        clearTimeout(timeoutId); 
        
        if (res.ok) {
          setServerStatus('online'); 
        } else {
          setServerStatus('offline'); 
        }
      } catch (error) {
        clearTimeout(timeoutId);
        setServerStatus('offline'); 
      }
    };


    checkServer();
    
    const interval = setInterval(checkServer, 30000); 
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setCode('');
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/upload`, { 
        method: "POST", 
        body: formData 
      });
      const data = await res.json();
      if (data.code) {
        setCode(data.code);
      }
    } catch (err) {
      alert("Upload failed. Make sure your Backend is running!");
    } finally {
      setLoading(false);
    }
  };

  const handleRetrieve = async () => {
    if (!inputCode) return;
    setLoading(true);
    setResultUrl(''); 
    
    try {
      const cleanCode = inputCode.trim().toLowerCase();
      const res = await fetch(`${API_URL}/file/${cleanCode}`);
      
      if (res.ok) {
        const data = await res.json();
        
        const fileResponse = await fetch(data.downloadUrl);
        const blob = await fileResponse.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = data.fileName; 
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        
        setResultUrl(data.downloadUrl); 
      } else {
        alert("Invalid or expired code ❌");
      }
    } catch (err) {
      console.error("Download Error:", err);
      alert("Download blocked by browser. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen text-zinc-200 flex flex-col items-center justify-center p-4 font-sans selection:bg-blue-500/30 overflow-hidden">
      
      {/* Interactive Waves Background */}
      <div className="fixed inset-0 z-0">
        <Waves 
          backgroundColor="#09090b" 
          strokeColor="rgba(59, 130, 246, 0.15)" 
          pointerSize={0.4} 
        />
      </div>

      {/* Main Container wrapper for the glowing effect */}
      <div className="relative w-full max-w-[420px] group z-10">
        
        {/* Animated Background Aura that responds to hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-600/20 via-indigo-500/10 to-purple-600/20 rounded-[2.5rem] blur-xl opacity-60 group-hover:opacity-100 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-700 pointer-events-none" />

        {/* The Actual Card */}
        <div className="relative bg-[#0c0c0e]/85 backdrop-blur-2xl border border-zinc-800/80 rounded-3xl overflow-hidden shadow-[0_8px_40px_rgb(0,0,0,0.8)] transition-all duration-500">
          
          {/* Header / Brand */}
          <div className="pt-10 pb-6 px-8 text-center relative">
            <div className="flex justify-center mb-5 relative">
              {/* Custom File + Flash Logo */}
              <div className="relative p-3 bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.15)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] transition-shadow duration-500">
                <Files size={32} className="text-zinc-300 group-hover:text-blue-400 transition-colors duration-500" />
                <div className="absolute -bottom-2 -right-2 p-1.5 bg-blue-600 rounded-full shadow-lg border-2 border-[#0c0c0e]">
                  <Zap size={14} className="text-white fill-white" />
                </div>
              </div>
            </div>
            
            {/* Big, Bold Font with Gradient */}
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-400 drop-shadow-md">
              Flash Share
            </h1>
            <p className="text-zinc-500 text-xs mt-2 font-medium tracking-widest uppercase">Secure Cloud Transfer</p>
          </div>

          {/* Navigation Tabs with Sliding Pill Transition */}
          <div className="px-8 pb-4">
            <div className="relative flex p-1 bg-zinc-900/80 rounded-xl border border-zinc-800/50">
              
              {/* The Sliding Pill Background */}
              <div 
                className="absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] bg-zinc-800/80 rounded-lg shadow-md transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) border border-zinc-700/50"
                style={{ transform: tab === 'upload' ? 'translateX(0)' : 'translateX(100%)' }}
              />

              <button 
                onClick={() => {setTab('upload'); setCode(''); setFile(null);}}
                className={`relative z-10 flex-1 py-2 rounded-lg text-sm font-semibold transition-colors duration-500 flex items-center justify-center gap-2 ${tab === 'upload' ? 'text-blue-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Send
              </button>
              <button 
                onClick={() => {setTab('download'); setInputCode(''); setResultUrl('');}}
                className={`relative z-10 flex-1 py-2 rounded-lg text-sm font-semibold transition-colors duration-500 flex items-center justify-center gap-2 ${tab === 'download' ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Receive
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="px-8 pb-8">
            {tab === 'upload' ? (
              <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
                
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 flex flex-col items-center justify-center text-center group/drop bg-zinc-900/30
                    ${isDragging ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-800 hover:border-zinc-700'} 
                    ${file ? 'border-blue-500/30 bg-blue-500/5' : ''}`}
                >
                  <input 
                    type="file" 
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  
                  <div className={`p-3 rounded-full mb-3 transition-colors duration-300 ${file ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-400 group-hover/drop:text-zinc-300'}`}>
                    {file ? <FileText size={24} /> : <Upload size={24} />}
                  </div>
                  
                  <p className="text-sm font-medium text-zinc-300 truncate w-full px-4">
                    {file ? file.name : "Click or drag file here"}
                  </p>
                  {file && <p className="text-xs text-blue-400/80 mt-1 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>}
                </div>

                <button 
                  onClick={handleUpload}
                  disabled={loading || !file}
                  className="w-full py-4 bg-zinc-100 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex justify-center items-center gap-2 shadow-lg"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : (
                    <>Generate Code <ArrowRight size={16} /></>
                  )}
                </button>

                {code && (
                  <div className="mt-4 p-4 bg-zinc-900/80 border border-blue-500/30 rounded-xl flex items-center justify-between animate-in zoom-in-95 duration-300 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 mb-0.5 block">Access Code</span>
                      <p className="text-2xl font-mono font-bold text-blue-400 tracking-widest">{code}</p>
                    </div>
                    <button 
                      onClick={copyToClipboard}
                      className="p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors active:scale-90"
                      title="Copy code"
                    >
                      {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                
                <div className="space-y-3">
                  <label className="text-xs font-bold tracking-widest uppercase text-zinc-500 block text-center">
                    Enter 4-character code
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toLowerCase())} 
                      maxLength={4} 
                      placeholder="e.g. x7y2"
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-5 text-center text-3xl font-mono tracking-[0.3em] lowercase focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all text-zinc-100 placeholder:text-zinc-700 placeholder:tracking-normal placeholder:font-sans placeholder:text-base shadow-inner"
                    />
                  </div>
                  
                  <button 
                    onClick={handleRetrieve}
                    disabled={loading || inputCode.length < 4}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex justify-center items-center gap-2 mt-2 shadow-lg shadow-purple-600/20"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Retrieve File"}
                  </button>
                </div>

                {resultUrl && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="p-2.5 bg-green-500/20 rounded-lg">
                      <Check className="text-green-400" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-green-400 tracking-wide">Download Complete</p>
                      <p className="text-xs text-zinc-400">Your file has been saved.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Status */}
      <div className="mt-8 flex items-center gap-4 text-xs font-semibold tracking-wider uppercase text-zinc-500 relative z-10 bg-zinc-950/60 px-5 py-2.5 rounded-full border border-zinc-800/60 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-zinc-400" />
          <span>End-to-End Encrypted</span>
        </div>
        <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
        <div className="flex items-center gap-2 transition-colors duration-300">
          <div className={`w-2 h-2 rounded-full ${
            serverStatus === 'online' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 
            serverStatus === 'offline' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]' : 
            'bg-amber-500 animate-pulse'
          }`} />
          <span className={serverStatus === 'online' ? 'text-green-500/90' : serverStatus === 'offline' ? 'text-red-500/90' : ''}>
            {serverStatus === 'online' ? 'Operational' : 
             serverStatus === 'offline' ? 'Offline' : 
             'Checking...'}
          </span>
        </div>
      </div>
      
    </div>
  );
};

export default App;