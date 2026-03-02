import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const docRef = doc(db, 'links', params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return { title: 'Produk Tidak Ditemukan' };

    const data = docSnap.data();
    return {
        title: data.title,
        description: 'Beli sekarang di Shopee',
        openGraph: {
            title: data.title,
            description: 'Klik gambar untuk melihat detail produk di Shopee.',
            images: [data.image], // Menggunakan URL asli dari Vercel Blob
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: data.title,
            images: [data.image]
        }
    };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
    const docRef = doc(db, 'links', params.id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return notFound();
    const data = docSnap.data();

    return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-sm bg-[#1e1e1e] rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                <div className="w-full aspect-square bg-gray-800">
                    <img className="w-full h-full object-cover" src={data.image} alt={data.title} />
                </div>
                <div className="p-6 flex flex-col items-center text-center">
                    <h1 className="text-xl font-bold mb-6 text-white leading-snug">{data.title}</h1>
                    <a href={data.link} className="w-full bg-[#ee4d2d] hover:bg-[#d73f22] text-white font-bold rounded-xl px-6 py-4 transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-orange-900/50">
                        Beli Sekarang di Shopee
                    </a>
                    <p className="text-xs text-gray-500 mt-4">Anda akan diarahkan ke halaman resmi Shopee.</p>
                </div>
            </div>
        </div>
    );
}

