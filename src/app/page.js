"use client";
import { useState, useRef } from "react";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Copy, Link as LinkIcon, Image as ImageIcon, CheckCircle2, Loader2 } from "lucide-react";

export default function Home() {
  const [imageBase64, setImageBase64] = useState("");
  const [shopeeLink, setShopeeLink] = useState("");
  const [title, setTitle] = useState("Rekomendasi Produk Shopee!");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 400; canvas.height = 400;
        const ctx = canvas.getContext("2d");
        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 400, 400);
        ctx.drawImage(img, startX, startY, size, size, 0, 0, 400, 400);
        setImageBase64(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!imageBase64 || !shopeeLink.includes("shope")) return alert("Data belum lengkap/valid!");
    setLoading(true);
    try {
      const id = Math.random().toString(36).substring(2, 8);
      await setDoc(doc(db, "artifacts", "link-shopee-ku", "public", "data", "links", id), {
        imageUrl: imageBase64,
        targetUrl: shopeeLink,
        title: title,
        createdAt: new Date().toISOString(),
        uid: auth.currentUser?.uid || "anon"
      });
      setGeneratedUrl(window.location.origin + "/link/" + id);
    } catch (err) {
      alert("Error: " + err.message);
    }
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-[#ee4d2d] p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Shopee Link Generator</h1>
          <p className="text-sm opacity-90">Auto Thumbnail Facebook & WA</p>
        </div>
        <div className="p-6 space-y-4">
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:bg-gray-50">
            <input type="file" ref={fileInputRef} onChange={handleImage} accept="image/*" className="hidden" />
            {imageBase64 ? (
              <img src={imageBase64} alt="Preview" className="w-32 h-32 mx-auto object-cover rounded-lg shadow-sm" />
            ) : (
              <div className="text-gray-500">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium">Klik untuk upload gambar</p>
              </div>
            )}
          </div>
          <input type="url" value={shopeeLink} onChange={e => setShopeeLink(e.target.value)} placeholder="Link Shopee (https://shope.ee/...)" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#ee4d2d]" />
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Judul Link" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-[#ee4d2d]" />
          {!generatedUrl ? (
            <button onClick={handleGenerate} disabled={loading} className="w-full bg-[#ee4d2d] text-white p-3 rounded-lg font-bold flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <LinkIcon />} Buat Link Sakti
            </button>
          ) : (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-center space-y-3">
              <p className="font-bold text-green-700 flex items-center justify-center gap-1"><CheckCircle2 /> Berhasil!</p>
              <div className="flex gap-2">
                <input type="text" readOnly value={generatedUrl} className="flex-1 p-2 bg-white border rounded text-sm text-gray-600 outline-none" />
                <button onClick={copyLink} className="bg-gray-800 text-white px-4 rounded text-sm font-bold">{copied ? "Tersalin" : "Salin"}</button>
              </div>
              <p className="text-xs text-gray-500">Link ini sudah bisa diposting ke Status Facebook dan Thumbnail akan muncul!</p>
              <button onClick={() => {setGeneratedUrl(""); setImageBase64(""); setShopeeLink("");}} className="text-sm text-gray-500 underline mt-2">Buat Baru</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}