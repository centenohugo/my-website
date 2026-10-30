"use client";

import { useRef, useState } from "react";
import type { LandingProfile } from "@/lib/profile";
import { aboutLayout } from "../about/theme";
import { UploadIcon } from "./icons";
import PhotoCropper from "./PhotoCropper";
import { adminColors, adminTypography } from "./theme";

const ERROR_COLOR = "#a24b3f";

async function errorFrom(res: Response, fallback: string) {
  const data = await res.json().catch(() => null);
  return (data?.error as string | undefined) ?? `${fallback} (${res.status})`;
}

/** The landing's bio and photo, which the home page reads from site_profile. */
export default function LandingForm({ initialProfile }: { initialProfile: LandingProfile }) {
  const [bio, setBio] = useState(initialProfile.bio);
  const [savingBio, setSavingBio] = useState(false);
  const [bioStatus, setBioStatus] = useState<{ error: boolean; text: string } | null>(null);

  const [photoUrl, setPhotoUrl] = useState(initialProfile.photoUrl);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function saveBio(event: React.FormEvent) {
    event.preventDefault();
    setSavingBio(true);
    setBioStatus(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio }),
      });
      if (!res.ok) throw new Error(await errorFrom(res, "Couldn't save the bio"));
      setBioStatus({ error: false, text: "Saved" });
    } catch (err) {
      setBioStatus({ error: true, text: err instanceof Error ? err.message : "Couldn't save the bio" });
    } finally {
      setSavingBio(false);
    }
  }

  async function uploadPhoto(photo: Blob) {
    setUploading(true);
    setPhotoError(null);
    try {
      const formData = new FormData();
      formData.append("file", photo, "photo.jpg");
      const res = await fetch("/api/profile/photo", { method: "POST", body: formData });
      if (!res.ok) throw new Error(await errorFrom(res, "Upload failed"));
      const data = await res.json();
      setPhotoUrl(data.url as string);
      setPendingPhoto(null);
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Couldn't upload the photo");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-12">
      <form onSubmit={saveBio} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <span className="uppercase" style={adminTypography.label}>
            Bio
          </span>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={4}
            required
            style={adminTypography.textarea}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={savingBio}
            className="w-fit uppercase"
            style={adminTypography.buttonPrimary}
          >
            {savingBio ? "Saving…" : "Save bio"}
          </button>
          {bioStatus && (
            <span
              style={{
                ...adminTypography.label,
                color: bioStatus.error ? ERROR_COLOR : adminTypography.label.color,
              }}
            >
              {bioStatus.text}
            </span>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-3">
        <span className="uppercase" style={adminTypography.label}>
          Photo
        </span>

        {pendingPhoto ? (
          <PhotoCropper
            file={pendingPhoto}
            busy={uploading}
            onCancel={() => {
              setPendingPhoto(null);
              setPhotoError(null);
            }}
            onConfirm={uploadPhoto}
          />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt=""
              className="rounded-full object-cover"
              style={{
                width: aboutLayout.faceSize,
                height: aboutLayout.faceSize,
                border: `3px solid ${adminColors.textPrimary}`,
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-fit items-center gap-2 uppercase"
              style={{ ...adminTypography.tab, cursor: "pointer" }}
            >
              <UploadIcon />
              Change photo
            </button>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            // Cleared so picking the same file again after a cancel still fires.
            event.target.value = "";
            if (file) {
              setPhotoError(null);
              setPendingPhoto(file);
            }
          }}
        />

        {photoError && <span style={{ ...adminTypography.label, color: ERROR_COLOR }}>{photoError}</span>}
      </div>
    </div>
  );
}
