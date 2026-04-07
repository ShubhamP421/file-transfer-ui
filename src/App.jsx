import React, { useState } from 'react';
import { Upload, Download, Copy, Check, FileText, Loader2, ShieldCheck } from 'lucide-react';

const App = () => {
  const [tab, setTab] = useState('upload'); 
  const [file, setFile] = useState(null);
  const [code, setCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const API_URL = "https://file-transfer-system-ug93.onrender.com"; 

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
  
        const link = document.createElement('a');
        link.href = data.downloadUrl;
      
        link.setAttribute('target', '_blank');
        link.setAttribute('download', data.fileName || 'file');
        
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        setResultUrl(data.downloadUrl); 
      } else {
        alert("Invalid or expired code ❌");
      }
    } catch (err) {
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-4 font-sans text-sm">
      
      {/* Glow Effect in Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10">
        
        {/* Navigation Tabs */}
        <div className="flex p-2 gap-1 bg-slate-950/50 m-4 rounded-2xl border border-slate-800">
          <button 
            onClick={() => {setTab('upload'); setCode(''); setFile(null);}}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${tab === 'upload' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:bg-slate-800/50'}`}
          >
            <Upload size={18} /> Send
          </button>
          <button 
            onClick={() => {setTab('download'); setInputCode(''); setResultUrl('');}}
            className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${tab === 'download' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' : 'text-slate-500 hover:bg-slate-800/50'}`}
          >
            <Download size={18} /> Receive
          </button>
        </div>

        <div className="p-8 pt-4">
          {tab === 'upload' ? (
            /* SEND VIEW */
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-3xl font-black text-white italic tracking-tighter">FLASH SHARE</h2>
                <p className="text-slate-500 text-[10px] font-medium tracking-[0.2em] uppercase">Ephemeral Cloud Transfer</p>
              </div>

              <div className="group relative border-2 border-dashed border-slate-700 rounded-3xl p-10 hover:border-blue-500/50 transition-all bg-slate-950/30 flex flex-col items-center justify-center text-center">
                <input 
                  type="file" 
                  onChange={(e) => setFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
                <div className="p-4 bg-blue-500/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="text-blue-500" size={32} />
                </div>
                <p className="text-sm font-semibold text-slate-300">
                  {file ? file.name : "Drop file or Click to Browse"}
                </p>
                {file && <p className="text-xs text-blue-500/70 mt-2 font-mono">{(file.size / 1024).toFixed(1)} KB</p>}
              </div>

              <button 
                onClick={handleUpload}
                disabled={loading || !file}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-900/20 transition-all flex justify-center items-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : "GENERATE SECURE CODE"}
              </button>

              {code && (
                <div className="mt-4 p-5 bg-slate-950 border border-blue-500/30 rounded-2xl flex items-center justify-between animate-in zoom-in duration-300">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-blue-500 font-bold block mb-1">Your Passcode</span>
                    <p className="text-4xl font-mono font-black text-white leading-tight tracking-tighter lowercase break-all">{code}</p>
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="p-4 bg-slate-900 rounded-xl hover:bg-slate-800 text-blue-400 transition-colors active:scale-95"
                  >
                    {copied ? <Check size={24} className="text-green-400" /> : <Copy size={24} />}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* RECEIVE VIEW */
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-3xl font-black text-white italic tracking-tight">RETRIEVE</h2>
                <p className="text-slate-500 text-[10px] font-medium tracking-widest uppercase italic">Enter the unique 4-character code</p>
              </div>

              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="code"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toLowerCase())} 
                  maxLength={4} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 text-center text-3xl font-mono tracking-[0.4em] lowercase focus:ring-2 focus:ring-purple-500 outline-none transition-all text-purple-400 placeholder:text-slate-700"
                />
                <button 
                  onClick={handleRetrieve}
                  disabled={loading || !inputCode}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-purple-900/20 transition-all flex justify-center items-center gap-3"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "SEARCH CLOUD"}
                </button>
              </div>

              {/* POPUP / PREVIEW CARD */}
              {resultUrl && (
                <div className="mt-6 p-6 bg-green-500/5 border border-green-500/20 rounded-[2rem] flex flex-col items-center text-center space-y-4 animate-in slide-in-from-bottom-6 duration-500">
                  <div className="p-4 bg-green-500/10 rounded-full border border-green-500/20">
                    <FileText className="text-green-500" size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-white tracking-tight leading-none">File Located!</p>
                    <p className="text-xs text-slate-500">Ready for secure download</p>
                  </div>
                  <a 
                    href={resultUrl} 
                    download
                    rel="noreferrer"
                    className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    DOWNLOAD FILE <Download size={20} />
                  </a>
                  <button 
                    onClick={() => setResultUrl('')}
                    className="text-[10px] uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors"
                  >
                    Close Preview
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Security Badge Footer */}
      <div className="mt-8 flex items-center gap-6 px-6 py-3 bg-slate-900/50 rounded-full border border-slate-800 text-[10px] uppercase tracking-widest font-bold text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-blue-500" />
          End-to-End Cloud
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          Server Active
        </div>
      </div>
    </div>
  );
};

export default App;
