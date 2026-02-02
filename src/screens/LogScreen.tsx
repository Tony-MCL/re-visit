import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, View, Alert } from "react-native";
import { theme } from "../ui/theme";
import type { ProfileId, VisitEntry } from "../types/entry";
import { clearEntries, loadEntries } from "../storage/entries";
import { t } from "../i18n/i18n";

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

  // Also refresh immediately when profile changes while on the log tab
  useEffect(() => {
    if (isActive) refresh();
  }, [activeProfile, isActive, refresh]);

  const empty = useMemo(() => entries.length === 0, [entries.length]);

  const onClear = async () => {
    Alert.alert(t("log.clearTitle"), t("log.clearMsg"), [
      { text: t("log.cancel"), style: "cancel" },
      {
        text: t("log.deleteAll"),
        style: "destructive",
        onPress: async () => {
          await clearEntries(activeProfile);
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

        <Pressable onPress={refresh} style={{ padding: 10 }}>
          <Text style={{ color: theme.accent, fontWeight: "800" }}>
            {t("log.refresh")}
          </Text>
        </Pressable>

        <Pressable onPress={onClear} style={{ padding: 10 }}>
          <Text style={{ color: theme.danger, fontWeight: "800" }}>
            {t("log.clear")}
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
              <Image
                source={{ uri: item.photoUri }}
                style={{ width: "100%", height: 220 }}
                resizeMode="cover"
              />

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
