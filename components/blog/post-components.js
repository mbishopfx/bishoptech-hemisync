import { blogPosts } from '@/lib/blog/posts';
import { TheArchitectureOfAStartingRitualPostMeta } from "@/lib/blog/posts-data";
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
  [TheArchitectureOfAStartingRitualPostMeta.slug]: TheArchitectureOfAStartingRitualPost,
};

export function getBlogPostComponentBySlug(slug) {
  return blogPostComponents[slug] || null;
}
