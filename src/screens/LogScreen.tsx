import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, View, Alert } from "react-native";
import { theme } from "../ui/theme";
import type { ProfileId, VisitEntry } from "../types/entry";
import { loadEntries } from "../storage/entries";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { t } from "../i18n/i18n";

const KEY = "revisit.entries.v1";

type Stored = { entries: VisitEntry[] };

async function deleteOne(entryId: string) {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return;

  let parsed: Stored | null = null;
  try {
    parsed = JSON.parse(raw) as Stored;
  } catch {
    parsed = null;
  }
  if (!parsed || !Array.isArray(parsed.entries)) return;

  const next = parsed.entries.filter((e) => e.id !== entryId);
  await AsyncStorage.setItem(KEY, JSON.stringify({ entries: next }));
}

function ratingLabel(r: VisitEntry["rating"]) {
  if (r === "yes") return t("log.rating.yes");
  if (r === "neutral") return t("log.rating.neutral");
  return t("log.rating.no");
}

function prettyDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function LogScreen({
  isActive,
  activeProfile,
}: {
  isActive: boolean;
  activeProfile: ProfileId;
}) {
  const [entries, setEntries] = useState<VisitEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const refresh = useCallback(async () => {
    setBusy(true);
    try {
      const e = await loadEntries(activeProfile);
      setEntries(e);
    } finally {
      setBusy(false);
    }
  }, [activeProfile]);

  useEffect(() => {
    if (isActive) refresh();
  }, [isActive, refresh]);

  useEffect(() => {
    if (isActive) refresh();
    setEditMode(false);
  }, [activeProfile, isActive, refresh]);

  const empty = useMemo(() => entries.length === 0, [entries.length]);

  const onDelete = (entry: VisitEntry) => {
    Alert.alert(t("log.deleteDialogTitle"), t("log.deleteDialogMsg"), [
      { text: t("log.cancel"), style: "cancel" },
      {
        text: t("log.confirmDelete"),
        style: "destructive",
        onPress: async () => {
          await deleteOne(entry.id);
          await refresh();
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <Text style={{ color: theme.muted, flex: 1 }}>
          {busy ? t("log.loading") : `${entries.length} ${t("log.entries")}`}
        </Text>

        <Pressable onPress={() => setEditMode((v) => !v)} style={{ padding: 10 }}>
          <Text style={{ color: theme.accent, fontWeight: "900" }}>
            {editMode ? t("log.done") : t("log.edit")}
          </Text>
        </Pressable>
      </View>

      {empty ? (
        <View style={{ paddingTop: 40 }}>
          <Text style={{ color: theme.text, fontWeight: "800", fontSize: 16 }}>
            {t("log.emptyTitle")}
          </Text>
          <Text style={{ color: theme.muted, marginTop: 8 }}>
            {t("log.emptyMsg")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View
              style={{
                marginBottom: 12,
                backgroundColor: theme.card,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.border,
                overflow: "hidden",
              }}
            >
              <View>
                <Image
                  source={{ uri: item.photoUri }}
                  style={{ width: "100%", height: 220 }}
                  resizeMode="cover"
                />

                {editMode ? (
                  <Pressable
                    onPress={() => onDelete(item)}
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 14,
                      backgroundColor: "rgba(0,0,0,0.55)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.25)",
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "900" }}>
                      {t("log.delete")}
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              <View style={{ padding: 12 }}>
                <Text style={{ color: theme.text, fontWeight: "900" }}>
                  {ratingLabel(item.rating)}
                </Text>

                <Text style={{ color: theme.muted, marginTop: 6 }}>
                  {prettyDate(item.createdAtIso)}
                </Text>

                {item.location ? (
                  <Text style={{ color: theme.muted, marginTop: 6 }}>
                    {item.location.lat.toFixed(5)}, {item.location.lng.toFixed(5)}
                  </Text>
                ) : (
                  <Text style={{ color: theme.muted, marginTop: 6 }}>
                    {t("log.noGps")}
                  </Text>
                )}

                {item.comment ? (
                  <Text style={{ color: theme.text, marginTop: 10 }}>
                    {item.comment}
                  </Text>
                ) : null}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
