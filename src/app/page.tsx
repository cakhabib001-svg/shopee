"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from "firebase/auth";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { Copy, Edit, Trash2, LogOut } from "lucide-react";
import { uploadImageToVercel } from "./actions";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [shopeeUrl, setShopeeUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const q = query(collection(db, "links"), orderBy("createdAt", "desc"));
        const unsubDb = onSnapshot(q, (snapshot) => {
          setLinks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubDb();
      }
    });
    return () => unsubAuth();
  }, []);

  const handleLogin = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  const handleImage = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = Math.min(img.width, img.height);
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, size, size);
        setImagePreview(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!title || !shopeeUrl) return alert("Isi judul dan link!");
    setLoading(true);
    
    try {
      let finalImageUrl = imagePreview;

      // Jika ada gambar baru (Base64), upload ke Vercel Blob menggunakan Server Action
      if (imagePreview.startsWith("data:image")) {
        finalImageUrl = await uploadImageToVercel(imagePreview);
      } else if (!imagePreview && !editId) {
        alert("Upload foto dulu!");
        setLoading(false); return;
      }

      if (editId) {
        await updateDoc(doc(db, "links", editId), {
          title, link: shopeeUrl, image: finalImageUrl
        });
        alert("Berhasil diupdate!");
      } else {
        await addDoc(collection(db, "links"), {
          title, link: shopeeUrl, image: finalImageUrl,
          userId: user?.uid, createdAt: new Date().toISOString()
        });
        alert("Berhasil dibuat!");
      }

      resetForm();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan!");
    }
    setLoading(false);
  };

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setTitle(item.title);
    setShopeeUrl(item.link);
    setImagePreview(item.image);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin hapus link ini?")) await deleteDoc(doc(db, "links", id));
  };

  const resetForm = () => {
    setEditId(null); setTitle(""); setShopeeUrl(""); setImagePreview("");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <button onClick={handleLogin} className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700">
          Login dengan Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-orange-500">Dashboard Link Shopee</h1>
          <button onClick={() => signOut(auth)} className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded text-sm hover:bg-gray-700">
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl mb-8 border border-gray-700">
          <h2 className="text-xl mb-4 font-semibold">{editId ? "Edit Halaman" : "Buat Halaman Baru"}</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm mb-2 text-gray-400">Foto Produk (1:1)</label>
              <div className="aspect-square bg-gray-900 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center relative overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                ) : <span className="text-gray-500">Klik untuk Upload</span>}
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImage} />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-400">Judul Produk (Tampil di FB)</label>
                <input value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg focus:outline-none focus:border-orange-500" placeholder="Sepatu Sneakers..." />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-400">Link Shopee Asli</label>
                <input value={shopeeUrl} onChange={e => setShopeeUrl(e.target.value)} type="url" className="w-full bg-gray-900 border border-gray-700 p-3 rounded-lg focus:outline-none focus:border-orange-500" placeholder="[https://shopee.co.id/](https://shopee.co.id/)..." />
              </div>
              
              <div className="flex gap-2">
                <button disabled={loading} type="submit" className="flex-1 bg-orange-600 text-white font-bold p-3 rounded-lg hover:bg-orange-700 disabled:opacity-50">
                  {loading ? "Menyimpan..." : (editId ? "Update Halaman" : "Buat Halaman")}
                </button>
                {editId && <button type="button" onClick={resetForm} className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600">Batal</button>}
              </div>
            </div>
          </div>
        </form>

        {/* LIST */}
        <h2 className="text-xl mb-4 font-semibold">Daftar Halaman ({links.length})</h2>
        <div className="grid gap-4">
          {links.map((item) => {
            const publicLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${item.id}`;
            return (
              <div key={item.id} className="bg-gray-800 p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 border border-gray-700">
                <img src={item.image} alt={item.title} className="w-20 h-20 rounded-lg object-cover bg-gray-900" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <a href={publicLink} target="_blank" className="text-sm text-blue-400 hover:underline">{publicLink}</a>
                </div>
                <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                  <button onClick={() => { navigator.clipboard.writeText(publicLink); alert("Link disalin!") }} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600" title="Copy Link"><Copy size={18} /></button>
                  <button onClick={() => handleEdit(item)} className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700" title="Edit"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-600 rounded-lg hover:bg-red-700" title="Hapus"><Trash2 size={18} /></button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
