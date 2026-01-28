import { trpc } from '../lib/trpc';
import { useMemo } from 'react';

export interface StampDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  iconUrl?: string;
  category: string;
}

export interface EarnedStamp {
  id: string;
  stampId: string;
  stamp: StampDefinition;
  earnedAt: string;
  tripId?: string;
}

export function usePassportStamps() {
  const { data: definitions, isLoading: defsLoading } = trpc.stamps.getDefinitions.useQuery();
  const { data: earned, isLoading: earnedLoading, refetch } = trpc.stamps.getMyStamps.useQuery();

  const earnedStampIds = useMemo(() => {
    return new Set(earned?.map((e: EarnedStamp) => e.stampId) ?? []);
  }, [earned]);

  const stamps = useMemo(() => {
    return (definitions ?? []).map((def: StampDefinition) => ({
      ...def,
      isEarned: earnedStampIds.has(def.id),
      earnedAt: earned?.find((e: EarnedStamp) => e.stampId === def.id)?.earnedAt,
    }));
  }, [definitions, earnedStampIds, earned]);

  const earnedCount = earned?.length ?? 0;
  const totalCount = definitions?.length ?? 0;
  const progress = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  return {
    stamps,
    earnedCount,
    totalCount,
    progress,
    isLoading: defsLoading || earnedLoading,
    refetch,
  };
}
