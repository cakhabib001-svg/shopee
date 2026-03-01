import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../firebase";

export async function generateMetadata({ params }) {
  const docRef = doc(db, "artifacts", "link-shopee-ku", "public", "data", "links", params.id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      title: data.title,
      description: "Klik untuk melihat produk di Shopee!",
      openGraph: {
        title: data.title,
        description: "Promo Spesial Shopee!",
        images: [data.imageUrl],
        url: data.targetUrl,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        images: [data.imageUrl],
      }
    };
  }
  return { title: "Link Tidak Ditemukan" };
}

export default async function RedirectPage({ params }) {
  const docRef = doc(db, "artifacts", "link-shopee-ku", "public", "data", "links", params.id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    return <div className="p-10 text-center font-bold">Link tidak valid atau sudah dihapus.</div>;
  }
  const targetUrl = docSnap.data().targetUrl;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-sm w-full animate-pulse">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Mengarahkan ke Shopee...</h2>
        <p className="text-gray-500 text-sm mb-6">Tunggu sebentar...</p>
        <script dangerouslySetInnerHTML={{ __html: "window.location.replace('" + targetUrl + "');" }}></script>
        <a href={targetUrl} className="text-[#ee4d2d] text-sm font-medium underline">Klik di sini jika tidak otomatis pindah</a>
      </div>
    </div>
  );
}