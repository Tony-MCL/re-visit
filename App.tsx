import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, View, Text, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import CaptureScreen from "./src/screens/CaptureScreen";
import LogScreen from "./src/screens/LogScreen";
import { theme } from "./src/ui/theme";
import { initI18n, getLang, setLang, t } from "./src/i18n/i18n";

type Tab = "capture" | "log";

export default function App() {
  const [tab, setTab] = useState<Tab>("capture");
  const [lang, setLangState] = useState<"no" | "en">("no");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initI18n();
      setLangState(getLang());
      setReady(true);
    })();
  }, []);

  const headerTitle = useMemo(() => {
    return tab === "capture" ? t("app.title") : t("log.title");
  }, [tab, lang]);

  if (!ready) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <StatusBar style="light" />
        <View style={{ padding: 16 }}>
          <Text style={{ color: theme.text, fontWeight: "800" }}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const toggleLang = async () => {
    const next = lang === "no" ? "en" : "no";
    await setLang(next);
    setLangState(next);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style="light" />
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ color: theme.text, fontSize: 20, fontWeight: "700", flex: 1 }}>
            {headerTitle}
          </Text>

          <Pressable
            onPress={toggleLang}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.surface,
            }}
          >
            <Text style={{ color: theme.text, fontWeight: "900" }}>
              {lang === "no" ? t("language.no") : t("language.en")}
            </Text>
          </Pressable>
        </View>

        <Text style={{ color: theme.muted, marginTop: 6 }}>
          {t("app.subtitle")}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, display: tab === "capture" ? "flex" : "none" }}>
          <CaptureScreen isActive={tab === "capture"} />
        </View>

        <View style={{ flex: 1, display: tab === "log" ? "flex" : "none" }}>
          <LogScreen isActive={tab === "log"} />
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderTopColor: theme.border,
          backgroundColor: theme.surface,
        }}
      >
        <TabButton active={tab === "capture"} onPress={() => setTab("capture")}>
          {t("app.tabs.capture")}
        </TabButton>
        <TabButton active={tab === "log"} onPress={() => setTab("log")}>
          {t("app.tabs.log")}
        </TabButton>
      </View>
    </SafeAreaView>
  );
}

function TabButton({
  active,
  onPress,
  children,
}: {
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: active ? theme.text : theme.muted,
          fontWeight: active ? "700" : "600",
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
