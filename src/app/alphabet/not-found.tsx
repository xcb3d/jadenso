import Link from "next/link";

export default function AlphabetNotFound() {
  return (
    <div className="container mx-auto py-12 text-center">
      <h2 className="text-3xl font-bold mb-4">Alphabet Not Found</h2>
      <p className="text-gray-600 mb-6">Sorry, we couldn&apos;t find the alphabet you&apos;re looking for.</p>
      <Link 
        href="/alphabet" 
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Return to All Alphabets
      </Link>
    </div>
  );
} 