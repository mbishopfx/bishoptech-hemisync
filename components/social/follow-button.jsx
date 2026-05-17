'use client';

import { useState } from 'react';
import { Loader2, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authedFetch } from '@/lib/frontend/api';

export function FollowButton({ profileId, initialFollowing = false }) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = async () => {
    setIsSaving(true);
    setError('');

    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      await authedFetch(`/api/follows/${profileId}`, { method });
      setIsFollowing(!isFollowing);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update follow status');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant={isFollowing ? 'secondary' : 'primary'}
        className="min-w-44 shadow-premium"
        onClick={handleToggle}
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" /> Updating...
          </>
        ) : isFollowing ? (
          <>
            <Check className="mr-2 size-4" /> Following
          </>
        ) : (
          <>
            <Plus className="mr-2 size-4" /> Follow creator
          </>
        )}
      </Button>
      {error ? <p className="text-xs text-red-200/80">{error}</p> : <p className="text-xs text-muted">Get this creator&apos;s public shares in your feed.</p>}
    </div>
  );
}
