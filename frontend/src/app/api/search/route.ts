import { client } from "@/sanity/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  try {
    let results;

    // If no query, return all posts
    if (!query) {
      results = await client.fetch(`*[_type == "post"]{
        _id,
        title,
        slug,
        publishedAt,
        tags
      }`);
    } else {
      // Perform search with GROQ using proper typing
      const searchQuery = `*[
        _type == "post" &&
        (title match $query || $query in tags || body[].children[].text match $query)
      ]{
        _id,
        title, 
        slug,
        publishedAt,
        tags
      }`;

      // Use correct parameter typing
      results = await client.fetch(searchQuery, { query: `${query}*` } as Record<string, string>);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search Error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}