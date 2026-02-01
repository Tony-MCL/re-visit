import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Image, Platform, Text, TextInput, View } from "react-native";
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

export default function CaptureScreen() {
  const camRef = useRef<CameraView>(null);

  const [camPerm, requestCamPerm] = useCameraPermissions();
  const [locGranted, setLocGranted] = useState<boolean>(false);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [rating, setRating] = useState<Rating | null>(null);
  const [comment, setComment] = useState<string>("");

  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");

  const canSave = useMemo(() => !!photoUri && !!rating && !busy, [photoUri, rating, busy]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocGranted(status === "granted");
      } catch {
        setLocGranted(false);
      }
    })();
  }, []);

  const ensureCamera = async () => {
    if (camPerm?.granted) return true;
    const res = await requestCamPerm();
    return res.granted;
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

      // På web er "uri" ofte upålitelig — vi ber om base64.
      const wantBase64 = Platform.OS === "web";

      const raw = await cam.takePictureAsync({
        quality: wantBase64 ? 0.55 : 0.85,
        base64: wantBase64,
        exif: false,
      });

      // 1) Hvis vi får en brukbar uri (native, eller noen web-case), bruk den
      if (raw?.uri) {
        // For web: komprimer/resize litt slik at lagring og visning blir stabilt
        if (Platform.OS === "web") {
          setStatus("Optimaliserer…");
          const manipulated = await ImageManipulator.manipulateAsync(
            raw.uri,
            [{ resize: { width: 1080 } }],
            { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
          );

          if (manipulated.base64) {
            setPhotoUri(`data:image/jpeg;base64,${manipulated.base64}`);
          } else {
            // fallback: bruk uri hvis base64 ikke finnes
            setPhotoUri(manipulated.uri);
          }
        } else {
          setPhotoUri(raw.uri);
        }

        setStatus("");
        return;
      }

      // 2) Web fallback: base64 direkte fra kamera
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

    if (locGranted) {
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

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 16 }}>
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
            <CameraView ref={camRef} style={{ flex: 1 }} facing="back" />
          </View>
        )}
      </View>

      <View style={{ marginTop: 12 }}>
        <PrimaryButton
          title={photoUri ? "Ta nytt bilde" : "Ta bilde"}
          onPress={onTakePhoto}
          disabled={busy}
        />
      </View>

      {status ? (
        <Text style={{ color: theme.muted, marginTop: 10 }}>{status}</Text>
      ) : null}

      <View style={{ marginTop: 14 }}>
        <Text style={{ color: theme.text, fontWeight: "800", marginBottom: 8 }}>
          Likte jeg dette?
        </Text>
        <SegmentedRating value={rating} onChange={setRating} />
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
          }}
          maxLength={140}
          multiline
        />
      </View>

      <View style={{ marginTop: 14 }}>
        <PrimaryButton title="Lagre øyeblikk" onPress={onSave} disabled={!canSave} />
        <Text style={{ color: theme.muted, marginTop: 8 }}>
          Tid lagres alltid. GPS lagres hvis tillatt.
        </Text>
        {Platform.OS === "web" ? (
          <Text style={{ color: theme.muted, marginTop: 6 }}>
            (Web: bildet lagres som komprimert data for stabil visning.)
          </Text>
        ) : null}
      </View>
    </View>
  );
}
