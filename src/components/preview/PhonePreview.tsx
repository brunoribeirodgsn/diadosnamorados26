import type { LovePageDraft } from "@/types/love-page";
import { LovePageRenderer } from "@/components/public/LovePageRenderer";

export function PhonePreview({ page }: { page: LovePageDraft }) {
  return (
    <div className="sticky top-6 mx-auto w-full max-w-[390px]">
      <div className="rounded-[2.6rem] border border-white/16 bg-black p-3 shadow-glow">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-ink">
          <div className="absolute left-1/2 top-2 z-20 h-7 w-28 -translate-x-1/2 rounded-full bg-black/86" />
          <div className="soft-scrollbar h-[760px] max-h-[calc(100vh-4rem)] overflow-y-auto">
            <LovePageRenderer page={page} preview />
          </div>
        </div>
      </div>
    </div>
  );
}
