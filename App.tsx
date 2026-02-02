import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, View, Text, Pressable, Modal } from "react-native";
import { StatusBar } from "expo-status-bar";
import CaptureScreen from "./src/screens/CaptureScreen";
import LogScreen from "./src/screens/LogScreen";
import { theme } from "./src/ui/theme";
import { initI18n, getLang, setLang, t } from "./src/i18n/i18n";
import Splash from "./src/components/Splash";

type Tab = "capture" | "log";

export default function App() {
  const [tab, setTab] = useState<Tab>("capture");
  const [lang, setLangState] = useState<"no" | "en">("no");
  const [ready, setReady] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  // Splash overlay after init
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    (async () => {
      await initI18n();
      setLangState(getLang());
      setReady(true);

      // Show splash a short moment after app is "ready"
      // (tweak duration as you like)
      setShowSplash(true);
      window.setTimeout(() => setShowSplash(false), 2200);
    })();
  }, []);

  const headerTitle = useMemo(() => {
    return tab === "capture" ? t("app.title") : t("log.title");
  }, [tab, lang]);

  if (!ready) {
    // While init runs, show splash too (feels smoother)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <StatusBar style="light" />
        <Splash />
      </SafeAreaView>
    );
  }

  const chooseLang = async (next: "no" | "en") => {
    await setLang(next);
    setLangState(next);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style="light" />

      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              color: theme.text,
              fontSize: 20,
              fontWeight: "700",
              flex: 1,
            }}
          >
            {headerTitle}
          </Text>

          <Pressable
            onPress={() => setMenuOpen(true)}
            style={{
              width: 40,
              height: 36,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.surface,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: theme.text, fontWeight: "900", fontSize: 18 }}>
              ☰
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

      {/* Hamburger menu */}
      <Modal
        transparent
        visible={menuOpen}
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable
          onPress={() => setMenuOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            padding: 16,
            justifyContent: "flex-start",
          }}
        >
          <Pressable
            onPress={() => {}}
            style={{
              alignSelf: "flex-end",
              width: 280,
              backgroundColor: theme.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 14,
            }}
          >
            <Text style={{ color: theme.text, fontWeight: "900", fontSize: 16 }}>
              {t("app.menu.title")}
            </Text>

            <View style={{ height: 12 }} />

            <Text style={{ color: theme.muted, fontWeight: "800" }}>
              {t("language.label")}
            </Text>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <MenuChoice
                label={t("language.no")}
                active={lang === "no"}
                onPress={() => chooseLang("no")}
              />
              <MenuChoice
                label={t("language.en")}
                active={lang === "en"}
                onPress={() => chooseLang("en")}
              />
            </View>

            <View style={{ height: 12 }} />

            <Pressable
              onPress={() => setMenuOpen(false)}
              style={{
                marginTop: 6,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: theme.border,
                alignItems: "center",
              }}
            >
              <Text style={{ color: theme.text, fontWeight: "900" }}>OK</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Splash overlay (in-app) */}
      {showSplash ? (
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            zIndex: 9999,
          }}
        >
          <Splash />
        </View>
      ) : null}
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

function MenuChoice({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: active ? 2 : 1,
        borderColor: active ? theme.accent : theme.border,
        backgroundColor: active ? theme.surface : "transparent",
        alignItems: "center",
      }}
    >
      <Text style={{ color: active ? theme.text : theme.muted, fontWeight: "900" }}>
        {label}
      </Text>
    </Pressable>
  );
}
