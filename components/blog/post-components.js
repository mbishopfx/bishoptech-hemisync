import { blogPosts } from '@/lib/blog/posts';
import Link from "next/link";
import { TheAuditorySystemNeverSleepsPredictableSoundSafetyPostMeta, TheArchitectureOfAStartingRitualPostMeta, quietTenMinuteResetPostMeta } from "@/lib/blog/posts-data";
import TheAuditorySystemNeverSleepsPredictableSoundSafetyPost from "@/components/blog/posts/the-auditory-system-never-sleeps-predictable-sound-safety";
import TheArchitectureOfAStartingRitualPost from "@/components/blog/posts/the-architecture-of-a-starting-ritual";

import WhyCognistrationFeelsPrivatePost from '@/components/blog/posts/why-cognistration-feels-private';
import CalmFirstSessionSetupPost from '@/components/blog/posts/calm-first-session-setup';
import PulvinarPrecisionBrokerPost from '@/components/blog/posts/pulvinar-precision-broker';
import ReticularStateBrokerPost from '@/components/blog/posts/reticular-state-broker';
import SuperiorColliculusOrientingEnginePost from '@/components/blog/posts/superior-colliculus-orienting-engine';
import CerebellumTimingCompilerPost from '@/components/blog/posts/cerebellum-timing-compiler';
import InteroceptivePrecisionArbiterPost from '@/components/blog/posts/interoceptive-precision-arbiter';
import LocusCoeruleusGainControllerPost from '@/components/blog/posts/locus-coeruleus-gain-controller';
import PredictionErrorRecalibratesRealityPost from '@/components/blog/posts/prediction-error-recalibrates-reality';
import NestedRhythmsCoordinationLayerPost from '@/components/blog/posts/nested-rhythms-coordination-layer';
import ThalamusPrecisionGovernorPost from '@/components/blog/posts/thalamus-precision-governor';
import InteroceptiveLoopControlRoomPost from '@/components/blog/posts/interoceptive-loop-control-room';
import VestibularFrameBuilderPost from '@/components/blog/posts/vestibular-frame-builder';
import HypnagogiaStateTransitionPost from '@/components/blog/posts/hypnagogia-state-transition';
import WorldNeedsCancellationSignalPost from '@/components/blog/posts/the-world-needs-a-cancellation-signal';
import AgencyIsAPredictionPost from '@/components/blog/posts/agency-is-a-prediction';
import PhaseResetCoherentMomentPost from '@/components/blog/posts/phase-reset-coherent-moment';
import BodyMapPresenceDriftPost from '@/components/blog/posts/body-map-presence-drift';
import DefaultModeNetworkPost from '@/components/blog/posts/default-mode-network';
import ClaustrumAccessPost from '@/components/blog/posts/claustrum-access';
import BodySetsTheBoundaryPost from '@/components/blog/posts/the-body-sets-the-boundary';
import SalienceNetworkPriorityPost from '@/components/blog/posts/salience-network-priority';
import PosteriorParietalCoordinateEnginePost from '@/components/blog/posts/posterior-parietal-coordinate-engine';
import PrecuneusContinuityBrokerPost from '@/components/blog/posts/precuneus-continuity-broker';
import CrossFrequencyCouplingPost from '@/components/blog/posts/cross-frequency-coupling';
import PrecisionIsADecisionPost from '@/components/blog/posts/precision-is-a-decision';
import MemoryReconsolidationPost from '@/components/blog/posts/memory-reconsolidation';
import ThalamicRouterPost from '@/components/blog/posts/thalamic-router';
import SalienceGatePost from '@/components/blog/posts/salience-gate';
import ThetaLiminalCorridorPost from '@/components/blog/posts/theta-liminal-corridor';
import InteroceptiveBreathPost from '@/components/blog/posts/interoceptive-breath';
import HemisphericCoherencePost from '@/components/blog/posts/hemispheric-coherence';
import SleepGatePost from '@/components/blog/posts/sleep-thalamic-gates';
import PredictiveCodingPost from '@/components/blog/posts/predictive-coding-entrainment';
import ConsciousnessMechanicsPost from '@/components/blog/posts/consciousness-mechanics';

function QuietTenMinuteResetPost() {
  const sections = [
    {
      title: 'Why a ten-minute reset works',
      paragraphs: [
        'A short reset is most useful when it fits cleanly into an ordinary day. It should be easy to start, easy to repeat, and easy to understand after it ends.',
        'The point is not to create a dramatic moment. The point is to give the next hour a clearer edge so the next step feels more usable.',
      ],
    },
    {
      title: 'Set the room once',
      paragraphs: [
        'Keep the setup simple: headphones ready, notifications quiet, and a seat that lets your body settle without extra adjustment.',
        'Consistency makes the session easier to learn from. If the setup stays the same, the experience becomes more comparable from one day to the next.',
      ],
    },
    {
      title: 'What to avoid',
      paragraphs: [
        'Do not chase intensity. Do not change every variable at once. Do not judge the whole routine by one pass.',
        'Repeatability matters more than novelty when the goal is a steadier day.',
      ],
    },
  ];

  return (
    <article className="space-y-12">
      <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl px-7 py-10 shadow-2xl md:px-10 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.03),transparent_35%)] pointer-events-none" />
        <div className="relative max-w-4xl space-y-6">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-400">
            Cognistration Blog
          </p>
          <h1 className="text-balance text-4xl font-light tracking-tight text-white md:text-6xl md:leading-[0.95]">
            {quietTenMinuteResetPostMeta.title}
          </h1>
          <p className="max-w-3xl text-balance text-sm leading-relaxed text-white/50">
            {quietTenMinuteResetPostMeta.excerpt}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30">
            <span>{quietTenMinuteResetPostMeta.category}</span>
            <span>{quietTenMinuteResetPostMeta.readTime}</span>
            <span>{new Date(quietTenMinuteResetPostMeta.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </header>

      <section className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
        <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">
          Keep the reset small enough to use on an ordinary day
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-white/50">
          <p>
            A useful reset is one you can do again tomorrow without having to relearn it.
          </p>
          <p>
            The best short session is not the biggest one. It is the smallest one that still helps
            the next choice feel clearer.
          </p>
        </div>
      </section>

      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="space-y-6 rounded-3xl border border-white/5 bg-zinc-900/40 backdrop-blur-3xl p-7 shadow-xl md:p-8">
            <h2 className="text-3xl font-light tracking-tight text-white md:text-4xl leading-tight">{section.title}</h2>
            <div className="space-y-4 text-sm leading-relaxed text-white/50">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <Link className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-sm text-white/70 transition-colors hover:bg-white/[0.04] hover:text-white" href="/tutorial">
          Open the setup guide
        </Link>
        <Link className="rounded-2xl border border-white/5 bg-zinc-950/40 p-5 text-sm text-white/70 transition-colors hover:bg-white/[0.04] hover:text-white" href="/pricing">
          Review the current plans
        </Link>
      </section>
    </article>
  );
}


export const blogPostComponents = {
  [blogPosts[0].slug]: WhyCognistrationFeelsPrivatePost,
  [blogPosts[1].slug]: CalmFirstSessionSetupPost,
  [blogPosts[2].slug]: PulvinarPrecisionBrokerPost,
  [blogPosts[3].slug]: ReticularStateBrokerPost,
  [blogPosts[4].slug]: SuperiorColliculusOrientingEnginePost,
  [blogPosts[5].slug]: CerebellumTimingCompilerPost,
  [blogPosts[6].slug]: InteroceptivePrecisionArbiterPost,
  [blogPosts[7].slug]: LocusCoeruleusGainControllerPost,
  [blogPosts[8].slug]: PredictionErrorRecalibratesRealityPost,
  [blogPosts[9].slug]: NestedRhythmsCoordinationLayerPost,
  [blogPosts[10].slug]: ThalamusPrecisionGovernorPost,
  [blogPosts[11].slug]: InteroceptiveLoopControlRoomPost,
  [blogPosts[12].slug]: VestibularFrameBuilderPost,
  [blogPosts[13].slug]: HypnagogiaStateTransitionPost,
  [blogPosts[14].slug]: WorldNeedsCancellationSignalPost,
  [blogPosts[15].slug]: AgencyIsAPredictionPost,
  [blogPosts[16].slug]: PhaseResetCoherentMomentPost,
  [blogPosts[17].slug]: BodyMapPresenceDriftPost,
  [blogPosts[18].slug]: DefaultModeNetworkPost,
  [blogPosts[19].slug]: ClaustrumAccessPost,
  [blogPosts[20].slug]: BodySetsTheBoundaryPost,
  [blogPosts[21].slug]: SalienceNetworkPriorityPost,
  [blogPosts[22].slug]: PosteriorParietalCoordinateEnginePost,
  [blogPosts[23].slug]: PrecuneusContinuityBrokerPost,
  [blogPosts[24].slug]: CrossFrequencyCouplingPost,
  [blogPosts[25].slug]: PrecisionIsADecisionPost,
  [blogPosts[26].slug]: MemoryReconsolidationPost,
  [blogPosts[27].slug]: ThalamicRouterPost,
  [blogPosts[28].slug]: SalienceGatePost,
  [blogPosts[29].slug]: ThetaLiminalCorridorPost,
  [blogPosts[30].slug]: InteroceptiveBreathPost,
  [blogPosts[31].slug]: HemisphericCoherencePost,
  [blogPosts[32].slug]: SleepGatePost,
  [blogPosts[33].slug]: PredictiveCodingPost,
  [blogPosts[34].slug]: ConsciousnessMechanicsPost,
  [quietTenMinuteResetPostMeta.slug]: QuietTenMinuteResetPost,
  [TheAuditorySystemNeverSleepsPredictableSoundSafetyPostMeta.slug]: TheAuditorySystemNeverSleepsPredictableSoundSafetyPost,
  [TheArchitectureOfAStartingRitualPostMeta.slug]: TheArchitectureOfAStartingRitualPost,
};

export function getBlogPostComponentBySlug(slug) {
  return blogPostComponents[slug] || null;
}
