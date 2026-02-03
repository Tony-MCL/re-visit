// ============================
// BLOCK: IMPORTS (START)
// ============================
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import type { CameraView } from "expo-camera";
import * as Location from "expo-location";
import * as ImageManipulator from "expo-image-manipulator";

import CaptureCamera from "../components/CaptureCamera";
import PrimaryButton from "../components/PrimaryButton";
import SegmentedRating from "../components/SegmentedRating";
import { theme } from "../ui/theme";
import type { ProfileId, Rating, VisitEntry } from "../types/entry";
import { addEntry, countAllEntries } from "../storage/entries";
import { t } from "../i18n/i18n";
import { CATEGORIES, type CategoryId } from "../constants/categories";
import PaywallModal from "../components/PaywallModal";
import { getPlan } from "../entitlements/plan";
// ============================
// BLOCK: IMPORTS (END)
// ============================

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type LocPermissionState = "unknown" | "granted" | "denied";

const FREE_MAX_ENTRIES = 100;
const FREE_WARN_AT = 80;

export default function CaptureScreen({
  isActive,
  activeProfile,
}: {
  isActive: boolean;
  activeProfile: ProfileId;
}) {
  // ============================
  // BLOCK: STATE / REFS (START)
  // ============================
  const camRef = useRef<CameraView>(null);

  const [camPermGranted, setCamPermGranted] = useState(false);
  const [locPerm, setLocPerm] = useState<LocPermissionState>("unknown");

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [rating, setRating] = useState<Rating | null>(null);
  const [comment, setComment] = useState<string>("");

  const [categoryId, setCategoryId] = useState<CategoryId>("other");

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const [camReady, setCamReady] = useState(false);

  // paywall modal
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallTitle, setPaywallTitle] = useState("");
  const [paywallMsg, setPaywallMsg] = useState("");

  // warning only once per screen-session
  const [warnedThisSession, setWarnedThisSession] = useState(false);
  // ============================
  // BLOCK: STATE / REFS (END)
  // ============================

  const canSave = useMemo(
    () => !!photoUri && !!rating && !busy,
    [photoUri, rating, busy]
  );

  const resetCapture = () => {
    setPhotoUri(null);
    setRating(null);
    setComment("");
    setCategoryId("other");
    setStatus("");
    setCamReady(false);
  };

  const openPaywall = (title: string, msg: string) => {
    setPaywallTitle(title);
    setPaywallMsg(msg);
    setPaywallOpen(true);
  };

  useEffect(() => {
    if (isActive) {
      setStatus("");
      setCamReady(false);
      setWarnedThisSession(false);
    }
  }, [isActive]);

  useEffect(() => {
    resetCapture();
  }, [activeProfile]);

  const ensureLocationPermission = async (): Promise<boolean> => {
    if (locPerm === "granted") return true;
    if (locPerm === "denied") return false;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setLocPerm("granted");
        return true;
      }
      setLocPerm("denied");
      return false;
    } catch (e) {
      console.error(e);
      setLocPerm("denied");
      return false;
    }
  };

  const handleTakePhoto = async () => {
    if (busy) return;

    if (!camPermGranted) {
      Alert.alert(t("capture.cameraTitle"), t("capture.cameraPerm"));
      return;
    }

    setBusy(true);
    setStatus(t("capture.statusTaking"));

    try {
      const cam = camRef.current;
      if (!cam) throw new Error("Camera ref missing");

      const wantBase64 = Platform.OS === "web";

      const raw = await cam.takePictureAsync({
        quality: wantBase64 ? 0.5 : 0.85,
        base64: wantBase64,
        exif: false,
      });

      if (raw?.uri) {
        if (Platform.OS === "web") {
          setStatus(t("capture.statusOptimizing"));
          const manipulated = await ImageManipulator.manipulateAsync(
            raw.uri,
            [{ resize: { width: 900 } }],
            {
              compress: 0.6,
              format: ImageManipulator.SaveFormat.JPEG,
              base64: true,
            }
          );

          setPhotoUri(manipulated.uri);
        } else {
          setPhotoUri(raw.uri);
        }
      }

      setStatus("");
    } catch (e) {
      console.error(e);
      setStatus("");
      Alert.alert(t("capture.errTitle"), t("capture.errPhoto"));
    } finally {
      setBusy(false);
    }
  };

  const handleSave = async () => {
    if (!photoUri || !rating) return;

    // 1) Plan check (Free vs Pro)
    const plan = await getPlan();

    // 2) Count check (free max entries)
    if (plan === "free") {
      const count = await countAllEntries();

      if (count >= FREE_MAX_ENTRIES) {
        openPaywall(
          t("capture.limitHardTitle"),
          t("capture.limitHardMsg").replace("{{max}}", String(FREE_MAX_ENTRIES))
        );
        return;
      }

      if (!warnedThisSession && count >= FREE_WARN_AT) {
        setWarnedThisSession(true);
        openPaywall(
          t("capture.limitWarnTitle"),
          t("capture.limitWarnMsg").replace("{{max}}", String(FREE_MAX_ENTRIES))
        );
        return;
      }
    }

    setBusy(true);
    setStatus(t("capture.statusSaving"));

    let loc: VisitEntry["location"] | undefined;

    try {
      const okLoc = await ensureLocationPermission();
      if (okLoc) {
        try {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          loc = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          };
        } catch {
          // ok
        }
      }

      const entry: VisitEntry = {
        id: makeId(),
        createdAtIso: new Date().toISOString(),
        photoUri,
        rating,
        comment: comment.trim() ? comment.trim() : undefined,
        location: loc,
        profileId: activeProfile,
        categoryId,
      };

      try {
        await addEntry(entry);
        resetCapture();
        Alert.alert(t("capture.savedTitle"), t("capture.savedMsg"));
      } catch (e) {
        console.error(e);
        setStatus("");
        Alert.alert(t("capture.errTitle"), t("capture.errSave"));
      } finally {
        setBusy(false);
      }
    } catch (e) {
      console.error(e);
      setStatus("");
      setBusy(false);
      Alert.alert(t("capture.errTitle"), t("capture.errSave"));
    }
  };

  const shouldShowCamera = isActive && !photoUri;

  return (
    <>
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
              <View>
                <Image
                  source={{ uri: photoUri }}
                  style={{ width: "100%", height: 360 }}
                  resizeMode="cover"
                />

                <Pressable
                  onPress={resetCapture}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    width: 38,
                    height: 38,
                    borderRadius: 14,
                    backgroundColor: "rgba(0,0,0,0.55)",
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.25)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "900", fontSize: 18 }}>
                    ↺
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={{ height: 360 }}>
                {shouldShowCamera ? (
                  <>
                    <View style={{ flex: 1 }}>
                      <CaptureCamera
                        isActive={shouldShowCamera}
                        camRef={camRef}
                        onReadyChange={(ready) => setCamReady(ready)}
                        onPermissionChange={(granted) => setCamPermGranted(granted)}
                        height={360}
                      />
                    </View>

                    {!camReady && camPermGranted ? (
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
                          {t("capture.startingCamera")}
                        </Text>
                        <Text style={{ color: theme.muted, marginTop: 6 }}>
                          {t("capture.startingCameraHint")}
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
                    <Text style={{ color: theme.muted }}>{t("capture.inactive")}</Text>
                  </View>
                )}
              </View>
            )}

            <View style={{ padding: 14 }}>
              <Text style={{ color: theme.text, fontWeight: "900" }}>
                {t("capture.ratingQ")}
              </Text>

              <View style={{ marginTop: 10 }}>
                <SegmentedRating value={rating} onChange={setRating} />
              </View>

              <Text style={{ color: theme.text, fontWeight: "900", marginTop: 14 }}>
                {t("capture.category")}
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingVertical: 8,
                  gap: 10,
                }}
              >
                {CATEGORIES.map((c) => {
                  const active = categoryId === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setCategoryId(c.id)}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderRadius: 999,
                        borderWidth: active ? 2 : 1,
                        borderColor: active ? theme.accent : theme.border,
                        backgroundColor: active ? theme.surface : "transparent",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Text style={{ fontWeight: "900" }}>{c.emoji}</Text>
                      <Text
                        style={{
                          color: active ? theme.text : theme.muted,
                          fontWeight: "900",
                        }}
                      >
                        {t(`categories.${c.id}` as const)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <Text style={{ color: theme.text, fontWeight: "900", marginTop: 14 }}>
                {t("capture.comment")}
              </Text>

              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder={t("capture.commentPh")}
                placeholderTextColor={theme.muted}
                style={{
                  marginTop: 8,
                  minHeight: 44,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.surface,
                  color: theme.text,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
                multiline
              />

              <View style={{ marginTop: 14, gap: 10 }}>
                {!photoUri ? (
                  <PrimaryButton
                    label={t("capture.takePhoto")}
                    onPress={handleTakePhoto}
                    disabled={busy}
                  />
                ) : (
                  <PrimaryButton
                    label={t("capture.save")}
                    onPress={handleSave}
                    disabled={!canSave}
                  />
                )}

                {status ? (
                  <Text style={{ color: theme.muted, textAlign: "center" }}>
                    {status}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <PaywallModal
        visible={paywallOpen}
        title={paywallTitle}
        message={paywallMsg}
        primaryLabel={t("paywall.primary")}
        secondaryLabel={t("paywall.secondary")}
        onPrimary={() => setPaywallOpen(false)}
        onSecondary={() => setPaywallOpen(false)}
      />
    </>
  );
}
