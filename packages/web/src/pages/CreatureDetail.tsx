import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Rarity } from '@hatchling/shared';
import { RARITY_COLORS } from '@hatchling/shared';
import { PixelFrame } from '../components/PixelFrame';
import { PixelButton } from '../components/PixelButton';
import { RarityBadge } from '../components/RarityBadge';
import { CREATURE_MAP } from '../data/creatures';
import { useCreatures } from '../hooks/useCreatures';
import { supabase } from '../lib/supabase';

export function CreatureDetail() {
  const { creatureId } = useParams<{ creatureId: string }>();
  const navigate = useNavigate();
  const { ownedCreatures, loading, refetch } = useCreatures();

  const creatureDefId = Number(creatureId);
  const creatureDef = CREATURE_MAP.get(creatureDefId);

  const userInstances = useMemo(
    () => ownedCreatures.filter((uc) => uc.creature_id === creatureDefId),
    [ownedCreatures, creatureDefId]
  );

  const primaryInstance = userInstances[0] ?? null;
  const [nickname, setNickname] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (primaryInstance?.nickname) {
      setNickname(primaryInstance.nickname);
    }
  }, [primaryInstance]);

  if (!creatureDef) {
    return (
      <div className="max-w-md mx-auto">
        <PixelFrame>
          <p className="text-[9px] text-[#888] font-pixel text-center">Creature not found.</p>
          <div className="mt-4 text-center">
            <PixelButton size="sm" onClick={() => navigate('/collection')}>
              Back to Collection
            </PixelButton>
          </div>
        </PixelFrame>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto">
        <PixelFrame>
          <p className="text-[9px] text-[#888] font-pixel text-center">Loading...</p>
        </PixelFrame>
      </div>
    );
  }

  if (!primaryInstance) {
    return (
      <div className="max-w-md mx-auto">
        <PixelFrame>
          <p className="text-[9px] text-[#888] font-pixel text-center">
            You haven't collected this creature yet.
          </p>
          <div className="mt-4 text-center">
            <PixelButton size="sm" onClick={() => navigate('/collection')}>
              Back to Collection
            </PixelButton>
          </div>
        </PixelFrame>
      </div>
    );
  }

  const handleSaveNickname = async () => {
    if (!primaryInstance) return;
    setSaving(true);
    await supabase
      .from('user_creatures')
      .update({ nickname: nickname.trim() || null })
      .eq('id', primaryInstance.id);
    await refetch();
    setSaving(false);
  };

  const collectedDate = new Date(primaryInstance.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4">
        <PixelButton size="sm" variant="secondary" onClick={() => navigate('/collection')}>
          &larr; Back
        </PixelButton>
      </div>

      <PixelFrame>
        {/* Large sprite placeholder */}
        <div className="flex justify-center mb-4">
          <div
            className="w-32 h-32 border-2 border-[#333] flex items-center justify-center text-white font-pixel text-[24px]"
            style={{
              backgroundColor: RARITY_COLORS[creatureDef.rarity as Rarity],
              imageRendering: 'pixelated',
            }}
          >
            {creatureDef.name[0]}
          </div>
        </div>

        {/* Name and rarity */}
        <div className="text-center mb-3">
          <h2 className="text-[14px] font-pixel mb-1">{creatureDef.name}</h2>
          <RarityBadge rarity={creatureDef.rarity as Rarity} />
          {creatureDef.safariOnly && (
            <span className="ml-2 text-[8px] font-pixel text-[#78c850]">Safari Exclusive</span>
          )}
        </div>

        {/* Description */}
        <p className="text-[9px] text-[#666] font-pixel text-center mb-4 leading-relaxed">
          {creatureDef.description}
        </p>

        <div className="border-t-2 border-[#e8e8e8] pt-3 mb-3">
          {/* Details */}
          <div className="grid grid-cols-2 gap-2 text-[8px] font-pixel">
            <div>
              <span className="text-[#888]">Found via:</span>
              <span className="ml-1 text-[#333] capitalize">{primaryInstance.found_via}</span>
            </div>
            <div>
              <span className="text-[#888]">Collected:</span>
              <span className="ml-1 text-[#333]">{collectedDate}</span>
            </div>
            <div>
              <span className="text-[#888]">Copies owned:</span>
              <span className="ml-1 text-[#333]">{userInstances.length}</span>
            </div>
            <div>
              <span className="text-[#888]">ID:</span>
              <span className="ml-1 text-[#333]">#{String(creatureDef.id).padStart(3, '0')}</span>
            </div>
          </div>
        </div>

        {/* Nickname */}
        <div className="border-t-2 border-[#e8e8e8] pt-3">
          <label className="block text-[8px] font-pixel text-[#888] mb-1">Nickname</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Give it a nickname..."
              maxLength={20}
              className="flex-1 text-[9px] font-pixel border-2 border-[#333] px-2 py-1 bg-white outline-none focus:border-[#78c850]"
            />
            <PixelButton size="sm" onClick={handleSaveNickname} disabled={saving}>
              {saving ? '...' : 'Save'}
            </PixelButton>
          </div>
        </div>
      </PixelFrame>
    </div>
  );
}
