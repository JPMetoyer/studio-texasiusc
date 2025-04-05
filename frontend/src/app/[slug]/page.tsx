import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import Link from "next/link";

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  publishedAt,
  tags,
  image,
  body
}`;

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const options = { next: { revalidate: 30 } };

// ✅ ONLY CHANGE: Properly type `params` using PageProps
type PageProps = {
  params: {
    slug: string;
  };
};

export default async function PostPage({ params }: PageProps) {
  try {
    const post = await client.fetch<SanityDocument>(POST_QUERY, params, options);

    // Debugging to check if the post is fetched correctly
    console.log("Fetched Post:", post);

    // If no post is found, display a 404-style message
    if (!post) {
      return (
        <main className="container mx-auto min-h-screen max-w-3xl p-8">
          <h1 className="text-4xl font-bold mb-8">Post Not Found</h1>
          <Link href="/" className="hover:underline">← Back to posts</Link>
        </main>
      );
    }

    const postImageUrl = post?.image
      ? urlFor(post.image)?.width(550).height(310).url()
      : null;

    return (
      <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
        <Link href="/" className="hover:underline">← Back to posts</Link>

        {postImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={postImageUrl}
            alt={post?.title || "Post Image"}
            className="aspect-video rounded-xl"
            width="550"
            height="310"
          />
        )}

        <h1 className="text-4xl font-bold mb-8">{post.title}</h1>

        <div className="prose">
          <p>Published: {new Date(post.publishedAt).toLocaleDateString()}</p>
          {Array.isArray(post.body) && <PortableText value={post.body} />}
        </div>

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
      </main>
    );
  } catch (error) {
    console.error("Error fetching post:", error);
    return (
      <main className="container mx-auto min-h-screen max-w-3xl p-8">
        <h1 className="text-4xl font-bold mb-8">An error occurred while fetching the post.</h1>
        <Link href="/" className="hover:underline">← Back to posts</Link>
      </main>
    );
  }
}