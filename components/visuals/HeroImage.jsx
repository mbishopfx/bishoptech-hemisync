'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import heroImg from '../../91410CC2-2A5B-46E7-8F41-39442CF832D9_1_105_c.jpeg';

export function HeroImage() {
  return (
    <div className="relative mx-auto flex max-w-[520px] items-center justify-center py-4">
      <motion.div
        initial={{ scale: 0.98, rotate: 0 }}
        animate={{
          scale: [0.98, 1.0, 0.98],
          rotate: [0, 0.6, 0],
          filter: ['drop-shadow(0 0 0 rgba(6,182,212,0.0))', 'drop-shadow(0 0 18px rgba(6,182,212,0.35))', 'drop-shadow(0 0 0 rgba(6,182,212,0.0))']
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-10"
      >
        <Image
          src={heroImg}
          alt="Bishop HemiSync"
          priority
          className="rounded-xl bg-transparent"
        />
      </motion.div>
    </div>
  );
}


