import { createClient } from "next-sanity";

export const client = createClient({
  projectId: "zb4t8a36", // Your actual projectId
  dataset: "production",
  apiVersion: "2023-12-01", // Ensure this is correct
  useCdn: false,
});