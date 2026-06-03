import {
  cancellationSignalPostMeta,
  agencyIsAPredictionPostMeta,
  phaseResetCoherentMomentPostMeta,
  bodyMapPresenceDriftPostMeta,
  claustrumAccessPostMeta,
  bodyBoundaryPostMeta,
  consciousnessMechanicsPostMeta,
  crossFrequencyCouplingPostMeta,
  salienceNetworkPriorityPostMeta,
  memoryReconsolidationPostMeta,
  defaultModeNetworkPostMeta,
  hemisphericCoherencePostMeta,
  interoceptiveBreathPostMeta,
  predictiveCodingPostMeta,
  precisionDecisionPostMeta,
  salienceGatePostMeta,
  sleepGatePostMeta,
  thalamicRouterPostMeta,
  thetaLiminalCorridorPostMeta,
} from "@/lib/blog/posts-data";

export const blogPosts = [
  cancellationSignalPostMeta,
  agencyIsAPredictionPostMeta,
  phaseResetCoherentMomentPostMeta,
  bodyMapPresenceDriftPostMeta,
  defaultModeNetworkPostMeta,
  claustrumAccessPostMeta,
  bodyBoundaryPostMeta,
  salienceNetworkPriorityPostMeta,
  crossFrequencyCouplingPostMeta,
  precisionDecisionPostMeta,
  memoryReconsolidationPostMeta,
  thalamicRouterPostMeta,
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
