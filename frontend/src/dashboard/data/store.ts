import {useLive, type LiveOwner, type OwnerData} from './live';
import type {Dataset} from './types';

export type {OwnerData};

const emptyDataset = (fileName: string): Dataset => ({
  fileName,
  sheetName: '',
  uploadedAt: '',
  rows: [],
  summary: [],
  summaryTitle: null,
  summaryColumns: [],
  awareness: [],
  awarenessSummary: [],
});

export type OwnerWithData = LiveOwner & {data: OwnerData};

/** Each person's ad-spend data from the backend, in dashboard order (an empty dataset until their sheet is read). */
export function useOwners(): OwnerWithData[] {
  const live = useLive();
  return (live?.owners ?? []).map((o) => ({...o, data: o.data ?? {dataset: emptyDataset(o.fileHint), isSample: false}}));
}
