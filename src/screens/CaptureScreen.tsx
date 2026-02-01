import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import * as ImageManipulator from "expo-image-manipulator";

import PrimaryButton from "../components/PrimaryButton";
import SegmentedRating from "../components/SegmentedRating";
import { theme } from "../ui/theme";
import type { Rating, VisitEntry } from "../types/entry";
import { addEntry } from "../storage/entries";

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type LocPermissionState = "unknown" | "granted" | "denied";

export default function CaptureScreen({ isActive }: { isActive: boolean }) {
  const camRef = useRef<CameraView>(null);

  const [camPerm, requestCamPerm] = useCameraPermissions();

  const [locPerm, setLocPerm] = useState<LocPermissionState>("unknown");

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [rating, setRating] = useState<Rating | null>(null);
  const [comment, setComment] = useState<string>("");

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");

  const [camReady, setCamReady] = useState(false);

  const canSave = useMemo(
    () => !!photoUri && !!rating && !busy,
    [photoUri, rating, busy]
  );

  // Reset transient status when coming back to this tab
  useEffect(() => {
    if (isActive) {
      setStatus("");
      // If we show camera again, we want a fresh "ready" signal
      setCamReady(false);
    }
  }, [isActive]);

  const ensureCamera = async () => {
    if (camPerm?.granted) return true;
    const res = await requestCamPerm();
    return res.granted;
  };

  const ensureLocationPermission = async (): Promise<boolean> => {
    if (locPerm === "granted") return true;
    if (locPerm === "denied") return false;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const ok = status === "granted";
      setLocPerm(ok ? "granted" : "denied");
      return ok;
    } catch {
      setLocPerm("denied");
      return false;
    }
  };

  const onTakePhoto = async () => {
    const ok = await ensureCamera();
    if (!ok) {
      Alert.alert("Kamera", "Du må gi kameratilgang for å ta bilde.");
      return;
    }

    setBusy(true);
    setStatus("Tar bilde…");

    try {
      const cam = camRef.current;
      if (!cam) throw new Error("Camera ref missing");

      // Web: prefer base64 for stable preview + storage
      const wantBase64 = Platform.OS === "web";

      const raw = await cam.takePictureAsync({
        quality: wantBase64 ? 0.5 : 0.85,
        base64: wantBase64,
        exif: false,
      });

      if (raw?.uri) {
        if (Platform.OS === "web") {
          setStatus("Optimaliserer…");
          const manipulated = await ImageManipulator.manipulateAsync(
            raw.uri,
            // Slightly smaller than before => faster + less storage on web
            [{ resize: { width: 900 } }],
            {
              compress: 0.6,
              format: ImageManipulator.SaveFormat.JPEG,
              base64: true,
            }
          );

          if (manipulated.base64) {
            setPhotoUri(`data:image/jpeg;base64,${manipulated.base64}`);
          } else {
            setPhotoUri(manipulated.uri);
          }
        } else {
          setPhotoUri(raw.uri);
        }

        setStatus("");
        return;
      }

      if (wantBase64 && raw?.base64) {
        setPhotoUri(`data:image/jpeg;base64,${raw.base64}`);
        setStatus("");
        return;
      }

      throw new Error("No usable photo data returned");
    } catch (e) {
      console.error(e);
      setStatus("");
      Alert.alert("Feil", "Kunne ikke ta bilde. Prøv igjen.");
    } finally {
      setBusy(false);
    }
  };

  const onSave = async () => {
    if (!photoUri || !rating) return;

    setBusy(true);
    setStatus("Lagrer…");

    let loc:
      | { lat: number; lng: number; accuracyM?: number }
      | undefined = undefined;

    // Ask for location only when saving (much faster app start)
    const locOk = await ensureLocationPermission();

    if (locOk) {
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyM: pos.coords.accuracy ?? undefined,
        };
      } catch {
        // ok: save without location if it fails
      }
    }

    const entry: VisitEntry = {
      id: makeId(),
      createdAtIso: new Date().toISOString(),
      photoUri,
      rating,
      comment: comment.trim() ? comment.trim() : undefined,
      location: loc,
    };

    try {
      await addEntry(entry);

      setPhotoUri(null);
      setRating(null);
      setComment("");
      setStatus("");

      Alert.alert("Lagret", "Opplevelsen er lagret i loggen din.");
    } catch (e) {
      console.error(e);
      setStatus("");
      Alert.alert("Feil", "Kunne ikke lagre opplevelsen.");
    } finally {
      setBusy(false);
    }
  };

  // Only mount the camera when:
  // - Capture tab is active
  // - we don't already have a photo preview
  // This reduces “hanging” and background camera work.
  const shouldShowCamera = isActive && !photoUri;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 28,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.border,
            overflow: "hidden",
          }}
        >
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={{ width: "100%", height: 360 }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ height: 360 }}>
              {shouldShowCamera ? (
                <>
                  {/* pointerEvents none => camera won't steal touches on mobile web */}
                  <View style={{ flex: 1 }} pointerEvents="none">
                    <CameraView
                      ref={camRef}
                      style={{ flex: 1 }}
                      facing="back"
                      onCameraReady={() => setCamReady(true)}
                    />
                  </View>

                  {!camReady ? (
                    <View
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(0,0,0,0.25)",
                      }}
                      pointerEvents="none"
                    >
                      <Text style={{ color: theme.text, fontWeight: "900" }}>
                        Starter kamera…
                      </Text>
                      <Text style={{ color: theme.muted, marginTop: 6 }}>
                        (Mobil-web kan være tregere her)
                      </Text>
                    </View>
                  ) : null}
                </>
              ) : (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: theme.muted }}>
                    Kamera pauset
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={{ marginTop: 12 }}>
          <PrimaryButton
            title={photoUri ? "Ta nytt bilde" : "Ta bilde"}
            onPress={onTakePhoto}
            disabled={busy || (shouldShowCamera && !camReady)}
          />
        </View>

        {status ? (
          <Text style={{ color: theme.muted, marginTop: 10 }}>{status}</Text>
        ) : null}

        <View style={{ marginTop: 14 }}>
          <Text style={{ color: theme.text, fontWeight: "800", marginBottom: 8 }}>
            Likte jeg dette?
          </Text>

          <View
            style={{
              borderRadius: 16,
              borderWidth: rating ? 2 : 1,
              borderColor: rating ? theme.accent : theme.border,
              padding: 2,
            }}
          >
            <SegmentedRating value={rating} onChange={setRating} />
          </View>

          <Text style={{ color: theme.muted, marginTop: 8 }}>
            Valgt:{" "}
            <Text style={{ color: theme.text, fontWeight: "800" }}>
              {rating === "yes"
                ? "Ja"
                : rating === "neutral"
                ? "Nøytral"
                : rating === "no"
                ? "Nei"
                : "—"}
            </Text>
          </Text>
        </View>

        <View style={{ marginTop: 14 }}>
          <Text style={{ color: theme.text, fontWeight: "800", marginBottom: 8 }}>
            Valgfri kommentar (1–2 linjer)
          </Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Skriv kort..."
            placeholderTextColor={theme.muted}
            style={{
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 14,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: theme.text,
              minHeight: 44,
            }}
            maxLength={140}
            multiline
          />
        </View>

        <View style={{ marginTop: 14 }}>
          <PrimaryButton
            title="Lagre øyeblikk"
            onPress={onSave}
            disabled={!canSave}
          />
          <Text style={{ color: theme.muted, marginTop: 8 }}>
            Tid lagres alltid. GPS spør vi om først ved lagring.
          </Text>
        </View>

        {/* Extra space so bottom tab bar never hides the save button */}
        <View style={{ height: 90 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
