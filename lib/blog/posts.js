import {
  consciousnessMechanicsPostMeta,
  hemisphericCoherencePostMeta,
  interoceptiveBreathPostMeta,
  predictiveCodingPostMeta,
  salienceGatePostMeta,
  sleepGatePostMeta,
  thetaLiminalCorridorPostMeta,
} from "@/lib/blog/posts-data";

export const blogPosts = [
  salienceGatePostMeta,
  thetaLiminalCorridorPostMeta,
  interoceptiveBreathPostMeta,
  hemisphericCoherencePostMeta,
  sleepGatePostMeta,
  predictiveCodingPostMeta,
  consciousnessMechanicsPostMeta,
];

export function getBlogPostBySlug(slug) {
  return blogPosts.find((post) => post.slug === slug) || null;
}

export function getRecentBlogPosts(limit = 6) {
  return [...blogPosts]
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, limit);
}
