import type { ModDto, SharedProfile } from "@deadlock-mods/shared";
import { ImportIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueries } from "react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProfileImport } from "@/hooks/use-profile-import";
import { getMod, getProfile } from "@/lib/api";
import {
  ProfileImportForm,
  type ProfileImportFormData,
} from "./profile-import-form";
import { ProfilePreview } from "./profile-preview";

export const ProfileImportDialog = () => {
  const [open, setOpen] = useState(false);
  const [importedProfile, setImportedProfile] = useState<SharedProfile | null>(
    null,
  );
  const [isImporting, setIsImporting] = useState(false);
  const [selectedAction, setSelectedAction] = useState<
    "create" | "override" | null
  >(null);
  const { t } = useTranslation();
  const { createProfileFromImport, addToCurrentProfile, importProgress } =
    useProfileImport();

  const { isLoading, mutate } = useMutation(
    (profileId: string) => getProfile(profileId.trim()),
    {
      onSuccess: (data) => {
        setImportedProfile(data);
        toast.success(t("profiles.importSuccess"));
      },
      onError: () => {
        toast.error(t("profiles.importError"));
        setImportedProfile(null);
      },
    },
  );

  // Fetch mod details for each mod in the imported profile
  const modQueries = useQueries(
    importedProfile?.payload.mods.map((mod) => ({
      queryKey: ["mod", mod.remoteId],
      queryFn: () => getMod(mod.remoteId),
      enabled: !!importedProfile,
    })) || [],
  );

  const modsLoading = modQueries.some((query) => query.isLoading);
  const modsData = modQueries
    .map((query) => query.data)
    .filter(Boolean) as ModDto[];

  const onSubmit = async (values: ProfileImportFormData) => {
    if (!values.profileId?.trim()) {
      toast.error(t("profiles.profileIdRequired"));
      return;
    }
    return mutate(values.profileId);
  };

  const handleCancel = () => {
    setImportedProfile(null);
    setSelectedAction(null);
    setOpen(false);
  };

  const handleCreateNewProfile = async () => {
    if (!importedProfile) return;

    setSelectedAction("create");
    setIsImporting(true);

    try {
      await createProfileFromImport(importedProfile.payload.mods, modsData);
      handleCancel();
    } catch (error) {
      toast.error(t("profiles.createError"));
    } finally {
      setIsImporting(false);
      setSelectedAction(null);
    }
  };

  const handleOverrideProfile = async () => {
    if (!importedProfile) return;

    setSelectedAction("override");
    setIsImporting(true);

    try {
      await addToCurrentProfile(importedProfile.payload.mods, modsData);
      handleCancel();
    } catch (error) {
      toast.error(t("profiles.updateError"));
    } finally {
      setIsImporting(false);
      setSelectedAction(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant='outline' icon={<ImportIcon />}>
          {t("profiles.import")}
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>
            {importedProfile
              ? t("profiles.importPreview")
              : t("profiles.import")}
          </DialogTitle>
          <DialogDescription>
            {importedProfile
              ? t("profiles.importPreviewDescription")
              : t("profiles.importDescription")}
          </DialogDescription>
        </DialogHeader>

        {importedProfile ? (
          <ProfilePreview
            importedProfile={importedProfile}
            modsLoading={modsLoading}
            modsData={modsData}
            onCreateNew={handleCreateNewProfile}
            onOverride={handleOverrideProfile}
            onCancel={handleCancel}
            isImporting={isImporting}
            importProgress={importProgress}
            selectedAction={selectedAction}
          />
        ) : (
          <ProfileImportForm
            onSubmit={onSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
