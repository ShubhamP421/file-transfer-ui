import React, { useState, useEffect } from 'react';
import { Upload, Download, Copy, Check, FileText, Loader2, ShieldCheck, Cloud, ArrowRight } from 'lucide-react';

const App = () => {
  const [tab, setTab] = useState('upload'); 
  const [file, setFile] = useState(null);
  const [code, setCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // New state for server status: 'checking', 'online', or 'offline'
  const [serverStatus, setServerStatus] = useState('checking');

  // ⚠️ REPLACE THIS with your actual Render URL
  const API_URL = "https://file-transfer-system-ug93.onrender.com"; 

  // --- Logic: Check Server Status ---
  useEffect(() => {
    const checkServer = async () => {
      try {
        // Pinging the base URL to check if the server is awake
        const res = await fetch(API_URL);
        if (res.ok) {
          setServerStatus('online');
        } else {
          setServerStatus('offline');
        }
      } catch (error) {
        setServerStatus('offline');
      }
    };

    checkServer();
    
    // Optional: Poll the server every 30 seconds to keep status updated
    const interval = setInterval(checkServer, 30000); 
    return () => clearInterval(interval);
  }, []);

  // --- Logic: Copy to Clipboard ---
  const copyToClipboard = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Logic: Drag & Drop ---
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

  // --- Logic: Upload File ---
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

  // --- Logic: Retrieve File ---
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
    <div className="min-h-screen bg-[#09090b] text-zinc-200 flex flex-col items-center justify-center p-4 font-sans selection:bg-blue-500/30">
      
      {/* Background Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.03)_0%,transparent_100%)] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[420px] bg-[#0c0c0e]/80 backdrop-blur-xl border border-zinc-800/60 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative z-10 transition-all duration-500">
        
        {/* Header / Brand */}
        <div className="pt-8 pb-4 px-8 text-center">
          <div className="flex justify-center mb-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <Cloud size={24} className="text-blue-500" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Flash Share</h2>
          <p className="text-zinc-500 text-xs mt-1 font-medium">Secure, ephemeral file transfer</p>
        </div>

        {/* Navigation Tabs */}
        <div className="px-8 pb-4">
          <div className="flex p-1 bg-zinc-900/80 rounded-xl border border-zinc-800/50">
            <button 
              onClick={() => {setTab('upload'); setCode(''); setFile(null);}}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${tab === 'upload' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Send
            </button>
            <button 
              onClick={() => {setTab('download'); setInputCode(''); setResultUrl('');}}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${tab === 'download' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Receive
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-8 pb-8">
          {tab === 'upload' ? (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* Drag & Drop Zone */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 flex flex-col items-center justify-center text-center group bg-zinc-900/30
                  ${isDragging ? 'border-blue-500 bg-blue-500/5' : 'border-zinc-800 hover:border-zinc-700'} 
                  ${file ? 'border-blue-500/30 bg-blue-500/5' : ''}`}
              >
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                
                <div className={`p-3 rounded-full mb-3 transition-colors duration-300 ${file ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-300'}`}>
                  {file ? <FileText size={24} /> : <Upload size={24} />}
                </div>
                
                <p className="text-sm font-medium text-zinc-300 truncate w-full px-4">
                  {file ? file.name : "Click or drag file here"}
                </p>
                {file && <p className="text-xs text-zinc-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>}
              </div>

              {/* Upload Button */}
              <button 
                onClick={handleUpload}
                disabled={loading || !file}
                className="w-full py-3.5 bg-zinc-100 hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : (
                  <>Generate Code <ArrowRight size={16} /></>
                )}
              </button>

              {/* Success Result */}
              {code && (
                <div className="mt-4 p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between animate-in zoom-in-95 duration-300">
                  <div>
                    <span className="text-[11px] font-medium text-zinc-500 mb-0.5 block">Access Code</span>
                    <p className="text-2xl font-mono font-semibold text-blue-400 tracking-widest">{code}</p>
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors active:scale-90"
                    title="Copy code"
                  >
                    {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
              
              {/* Download Form */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-zinc-500 block text-center">
                  Enter your 4-character code
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toLowerCase())} 
                    maxLength={4} 
                    placeholder="e.g. x7y2"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-4 text-center text-2xl font-mono tracking-[0.3em] lowercase focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-zinc-100 placeholder:text-zinc-700 placeholder:tracking-normal placeholder:font-sans placeholder:text-base"
                  />
                </div>
                
                <button 
                  onClick={handleRetrieve}
                  disabled={loading || inputCode.length < 4}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl font-semibold text-sm transition-all active:scale-[0.98] flex justify-center items-center gap-2 mt-2"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Retrieve File"}
                </button>
              </div>

              {/* Download Success */}
              {resultUrl && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Check className="text-green-400" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">Download Complete</p>
                    <p className="text-xs text-zinc-500">Your file has been saved.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Status */}
      <div className="mt-8 flex items-center gap-2 text-xs font-medium text-zinc-500">
        <ShieldCheck size={14} className="text-zinc-400" />
        <span>End-to-end encrypted</span>
        <span className="mx-2 w-1 h-1 rounded-full bg-zinc-700"></span>
        <div className="flex items-center gap-1.5 transition-colors duration-300">
          <div className={`w-1.5 h-1.5 rounded-full ${
            serverStatus === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
            serverStatus === 'offline' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
            'bg-amber-500 animate-pulse'
          }`} />
          <span>
            {serverStatus === 'online' ? 'Systems operational' : 
             serverStatus === 'offline' ? 'System offline' : 
             'Checking server...'}
          </span>
        </div>
      </div>
      
    </div>
  );
};

export default App;
