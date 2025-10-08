import type { ModDto } from "@deadlock-mods/shared";
import { Badge } from "@deadlock-mods/ui/components/badge";
import { CalendarIcon } from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import NSFWBlur from "@/components/mod-browsing/nsfw-blur";
import AudioPlayerPreview from "@/components/mod-management/audio-player-preview";
import { useNSFWBlur } from "@/hooks/use-nsfw-blur";

interface LatestModItemProps {
  mod: ModDto;
}

export const LatestModItem = ({ mod }: LatestModItemProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { shouldBlur, handleNSFWToggle, nsfwSettings } = useNSFWBlur(mod);

  return (
    <button
      className='group -mx-2 w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/50'
      onClick={() => navigate(`/mods/${mod.remoteId}`)}
      type='button'>
      <div className='flex items-start gap-3'>
        {/* Thumbnail */}
        <div className='relative h-12 w-12 shrink-0 overflow-hidden rounded-md'>
          {mod.isAudio ? (
            <AudioPlayerPreview
              audioUrl={mod.audioUrl || ""}
              onPlayClick={(e) => e.stopPropagation()}
              variant='compact'
            />
          ) : mod.images && mod.images.length > 0 ? (
            <NSFWBlur
              blurStrength={nsfwSettings.blurStrength}
              className='h-full w-full'
              disableBlur={nsfwSettings.disableBlur}
              isNSFW={shouldBlur}
              onToggleVisibility={handleNSFWToggle}
              showControls={false}>
              <img
                alt={mod.name}
                className='h-full w-full object-cover'
                height='48'
                src={mod.images[0]}
                width='48'
              />
            </NSFWBlur>
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-secondary'>
              <div className='text-center text-foreground/60'>
                <div className='mx-auto h-4 w-4' />
              </div>
            </div>
          )}
        </div>

        <div className='flex flex-1 items-start justify-between gap-2'>
          <div className='flex-1 space-y-1'>
            <p className='group-hover:text-primary font-medium text-sm transition-colors'>
              {mod.name}
            </p>
            <p className='text-muted-foreground text-xs'>
              {t("mods.by")} {mod.author}
            </p>
          </div>
          <div className='flex flex-col items-end gap-1'>
            {mod.isAudio && (
              <Badge className='text-[10px] py-0 px-1'>{t("mods.audio")}</Badge>
            )}
            {mod.isNSFW && (
              <Badge className='text-[10px] py-0 px-1'>NSFW</Badge>
            )}
            <div className='flex items-center gap-1 text-muted-foreground text-xs'>
              <CalendarIcon className='h-3 w-3' />
              <span>
                {formatDistanceToNow(new Date(mod.remoteAddedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};
