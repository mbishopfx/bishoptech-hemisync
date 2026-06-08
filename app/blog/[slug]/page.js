import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import InteroceptivePrecisionArbiterPost, {
  interoceptivePrecisionArbiterPost,
} from "@/components/blog/posts/interoceptive-precision-arbiter";
import LocusCoeruleusGainControllerPost, {
  locusCoeruleusGainControllerPost,
} from "@/components/blog/posts/locus-coeruleus-gain-controller";
import PredictionErrorRecalibratesRealityPost, {
  predictionErrorRecalibratesRealityPost,
} from "@/components/blog/posts/prediction-error-recalibrates-reality";
import NestedRhythmsCoordinationLayerPost, {
  nestedRhythmsCoordinationLayerPost,
} from "@/components/blog/posts/nested-rhythms-coordination-layer";
import VestibularFrameBuilderPost, {
  vestibularFrameBuilderPost,
} from "@/components/blog/posts/vestibular-frame-builder";
import HypnagogiaStateTransitionPost, {
  hypnagogiaStateTransitionPost,
} from "@/components/blog/posts/hypnagogia-state-transition";
import CancellationSignalPost, {
  cancellationSignalPost,
} from "@/components/blog/posts/the-world-needs-a-cancellation-signal";
import AgencyIsAPredictionPost, {
  agencyIsAPredictionPost,
} from "@/components/blog/posts/agency-is-a-prediction";
import DefaultModeNetworkPost, {
  defaultModeNetworkPost,
} from "@/components/blog/posts/default-mode-network";
import ClaustrumAccessPost, {
  claustrumAccessPost,
} from "@/components/blog/posts/claustrum-access";
import PrecisionDecisionPost, {
  precisionDecisionPost,
} from "@/components/blog/posts/precision-is-a-decision";
import BodyBoundaryPost, {
  bodyBoundaryPost,
} from "@/components/blog/posts/the-body-sets-the-boundary";
import PhaseResetCoherentMomentPost, {
  phaseResetCoherentMomentPost,
} from "@/components/blog/posts/phase-reset-coherent-moment";
import BodyMapPresenceDriftPost, {
  bodyMapPresenceDriftPost,
} from "@/components/blog/posts/body-map-presence-drift";
import ThalamusPrecisionGovernorPost, {
  thalamusPrecisionGovernorPost,
} from "@/components/blog/posts/thalamus-precision-governor";
import InteroceptiveLoopControlRoomPost, {
  interoceptiveLoopControlRoomPost,
} from "@/components/blog/posts/interoceptive-loop-control-room";
import ConsciousnessMechanicsPost, {
  consciousnessMechanicsPost,
} from "@/components/blog/posts/consciousness-mechanics";
import SalienceNetworkPriorityPost, {
  salienceNetworkPriorityPost,
} from "@/components/blog/posts/salience-network-priority";
import CrossFrequencyCouplingPost, {
  crossFrequencyCouplingPost,
} from "@/components/blog/posts/cross-frequency-coupling";
import MemoryReconsolidationPost, {
  memoryReconsolidationPost,
} from "@/components/blog/posts/memory-reconsolidation";
import HemisphericCoherencePost, {
  hemisphericCoherencePost,
} from "@/components/blog/posts/hemispheric-coherence";
import InteroceptiveBreathPost, {
  interoceptiveBreathPost,
} from "@/components/blog/posts/interoceptive-breath";
import PredictiveCodingEntrainmentPost, {
  predictiveCodingPost,
} from "@/components/blog/posts/predictive-coding-entrainment";
import SalienceGatePost, {
  salienceGatePost,
} from "@/components/blog/posts/salience-gate";
import SleepGatePost, {
  sleepGatePost,
} from "@/components/blog/posts/sleep-thalamic-gates";
import ThalamicRouterPost, {
  thalamicRouterPost,
} from "@/components/blog/posts/thalamic-router";
import ThetaLiminalCorridorPost, {
  thetaLiminalCorridorPost,
} from "@/components/blog/posts/theta-liminal-corridor";
import { blogPosts } from "@/lib/blog/posts";

export const dynamic = "force-dynamic";

const postComponentBySlug = {
  [interoceptivePrecisionArbiterPost.slug]: InteroceptivePrecisionArbiterPost,
  [locusCoeruleusGainControllerPost.slug]: LocusCoeruleusGainControllerPost,
  [predictionErrorRecalibratesRealityPost.slug]: PredictionErrorRecalibratesRealityPost,
  [nestedRhythmsCoordinationLayerPost.slug]: NestedRhythmsCoordinationLayerPost,
  [thalamusPrecisionGovernorPost.slug]: ThalamusPrecisionGovernorPost,
  [interoceptiveLoopControlRoomPost.slug]: InteroceptiveLoopControlRoomPost,
  [vestibularFrameBuilderPost.slug]: VestibularFrameBuilderPost,
  [hypnagogiaStateTransitionPost.slug]: HypnagogiaStateTransitionPost,
  [cancellationSignalPost.slug]: CancellationSignalPost,
  [agencyIsAPredictionPost.slug]: AgencyIsAPredictionPost,
  [phaseResetCoherentMomentPost.slug]: PhaseResetCoherentMomentPost,
  [bodyMapPresenceDriftPost.slug]: BodyMapPresenceDriftPost,
  [defaultModeNetworkPost.slug]: DefaultModeNetworkPost,
  [claustrumAccessPost.slug]: ClaustrumAccessPost,
  [precisionDecisionPost.slug]: PrecisionDecisionPost,
  [bodyBoundaryPost.slug]: BodyBoundaryPost,
  [consciousnessMechanicsPost.slug]: ConsciousnessMechanicsPost,
  [salienceNetworkPriorityPost.slug]: SalienceNetworkPriorityPost,
  [crossFrequencyCouplingPost.slug]: CrossFrequencyCouplingPost,
  [memoryReconsolidationPost.slug]: MemoryReconsolidationPost,
  [predictiveCodingPost.slug]: PredictiveCodingEntrainmentPost,
  [sleepGatePost.slug]: SleepGatePost,
  [thalamicRouterPost.slug]: ThalamicRouterPost,
  [hemisphericCoherencePost.slug]: HemisphericCoherencePost,
  [interoceptiveBreathPost.slug]: InteroceptiveBreathPost,
  [thetaLiminalCorridorPost.slug]: ThetaLiminalCorridorPost,
  [salienceGatePost.slug]: SalienceGatePost,
};

const postMetaBySlug = Object.fromEntries(blogPosts.map((post) => [post.slug, post]));

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default function BlogPostPage({ params }) {
  const PostComponent = postComponentBySlug[params.slug];
  const post = postMetaBySlug[params.slug];

  if (!PostComponent || !post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30">
      <PublicHeader />

      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 cyber-grid opacity-10" />
      </div>

      <main className="landing-shell pt-40 pb-20 px-6 relative z-10">
        <div className="page-shell space-y-8 max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-white transition-colors"
              href="/blog"
            >
              <ArrowLeft className="size-3.5" /> Back to archive
            </Link>
            <Link
              className="hidden rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-white transition-colors md:inline-flex"
              href="/"
            >
              Home
            </Link>
          </div>

          <PostComponent />

          <div className="rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-6 shadow-2xl">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
              Post metadata
            </p>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
              <span>Read Time: {post.readTime}</span>
              <span>Published: {new Date(post.publishedAt).toLocaleDateString()}</span>
              <span>Category: {post.category}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
