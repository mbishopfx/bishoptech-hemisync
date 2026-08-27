'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, LockKey, X } from '@phosphor-icons/react';
import Link from 'next/link';

export function AgenticAuthModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#13201d]/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 18 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
            className="relative w-full max-w-md rounded-[2rem] border border-[#cbd6cf] bg-[#f7f8f5] p-8 text-[#1d302c] shadow-2xl sm:p-10"
          >
            <button type="button" onClick={onClose} className="absolute right-5 top-5 rounded-full p-2 text-[#7a8983] transition hover:bg-[#e5ece7] hover:text-[#1d302c]" aria-label="Close account prompt">
              <X className="size-5" aria-hidden="true" />
            </button>

            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#dcece2] text-[#315e55]">
              <LockKey className="size-6" weight="duotone" aria-hidden="true" />
            </div>
            <h2 id="auth-modal-title" className="mt-7 text-3xl font-medium tracking-[-0.045em]">Keep building your practice.</h2>
            <p className="mt-4 text-sm leading-6 text-[#66746f]">Create an account to unlock the private workspace, expanded tone library, and saved sessions.</p>

            <div className="mt-8 flex flex-col gap-3">
              <Link href="/signup" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1d302c] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[#315e55] active:translate-y-px">
                Create your account <ArrowRight className="size-4" weight="bold" aria-hidden="true" />
              </Link>
              <Link href="/login" className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[#bfcfc5] px-5 py-3.5 text-sm font-medium text-[#315e55] transition hover:border-[#6b9587] hover:bg-[#edf4ef] active:translate-y-px">
                Sign in
              </Link>
            </div>

            <p className="mt-7 text-xs leading-5 text-[#7a8983]">You stay in control of every account and payment step.</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
