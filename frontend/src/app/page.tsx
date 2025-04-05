"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import Image from 'next/image';

export default function IndexPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [results, setResults] = useState<SanityDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  

  // Fetch all posts on load
  useEffect(() => {
    const fetchAllPosts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search`);
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch posts.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllPosts();
  }, []);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during the search.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto min-h-screen p-8 ">

      <nav className=" justify-center mx-auto flex flex-row items-center mb-6">
        <Image 
          alt="logo" 
          src="/logo.png" 
          width={50} 
          height={50}
        />
        <h1 className="text-2xl font-350">iSchool Undergraduate Student Council • Resources</h1>

      </nav>

      {/* Search Form */}

      <div className="max-w-3xl justify-center mx-auto">

        <p className="mx-auto justify-center text-center mb-7">

          Howdy! This is the iSchool Undergraduate Student Councils resource page. Here you will find all the information that we have found to be helpful for iSchool students.
        </p>
          
      <form onSubmit={handleSearch} className="flex mb-6">
        <input
          type="text"
          placeholder="Search by title, tags, or body content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-6 bg-blue-600 text-white rounded-r-lg"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Error Message */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Loading State */}
      {loading && <p>Loading...</p>}

      {/* Display Results */}
      {!loading && results.length > 0 ? (
        <ul className="flex flex-col gap-y-4">
          {results.map((post) => (
            <li className="hover:underline" key={post._id}>
              <Link href={`/${post.slug.current}`}>
                <h2 className="text-xl font-semibold">{post.title}</h2>
                <p>{new Date(post.publishedAt).toLocaleDateString()}</p>

                {/* Display Tags */}
                {post.tags?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {post.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ) : !loading && (
        <p>No results found.</p>
      )}

      </div>
    
    </main>
  );
}