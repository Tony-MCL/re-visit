import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, View, Text, Pressable, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";

import CaptureScreen from "./src/screens/CaptureScreen";
import LogScreen from "./src/screens/LogScreen";
import { theme } from "./src/ui/theme";
import { initI18n, getLang, setLang, t } from "./src/i18n/i18n";
import Splash from "./src/components/Splash";
import type { ProfileId } from "./src/types/entry";

import { getPlan, setPlan, type Plan } from "./src/entitlements/plan";

type Tab = "capture" | "log";

const PROFILE_KEY = "revisit.profile.v1";

export default function App() {
  const [tab, setTab] = useState<Tab>("capture");
  const [lang, setLangState] = useState<"no" | "en">("no");
  const [ready, setReady] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const [activeProfile, setActiveProfile] = useState<ProfileId>("private");

  // plan (free/pro)
  const [plan, setPlanState] = useState<Plan>("free");

  useEffect(() => {
    (async () => {
      await initI18n();
      const l = await getLang();
      setLangState(l);

      const storedProfile = await AsyncStorage.getItem(PROFILE_KEY);
      if (storedProfile === "private" || storedProfile === "work") {
        setActiveProfile(storedProfile);
      }

      const p = await getPlan();
      setPlanState(p);

      setReady(true);
      window.setTimeout(() => setShowSplash(false), 1600);
    })();
  }, []);

  const headerTitle = useMemo(() => {
    return tab === "capture" ? t("app.title") : t("log.title");
  }, [tab, lang]);

  const chooseLang = async (next: "no" | "en") => {
    await setLang(next);
    setLangState(next);
  };

  const setProfile = async (p: ProfileId) => {
    setActiveProfile(p);
    await AsyncStorage.setItem(PROFILE_KEY, p);
  };

  const setPlanAndPersist = async (next: Plan) => {
    await setPlan(next);
    setPlanState(next);
  };

  if (!ready) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
        <StatusBar style="light" />
        <Splash />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style="light" />

      {showSplash ? (
        <Splash />
      ) : (
        <>
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 14,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
              backgroundColor: theme.bg,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: theme.text, fontWeight: "900", fontSize: 18 }}>
              {headerTitle}
            </Text>

            <Pressable onPress={() => setMenuOpen(true)}>
              <Text style={{ color: theme.accent, fontWeight: "900", fontSize: 18 }}>
                ☰
              </Text>
            </Pressable>
          </View>

          {/* Tabs */}
          <View style={{ flexDirection: "row", paddingHorizontal: 16, paddingTop: 12, gap: 10 }}>
            <Pressable
              onPress={() => setTab("capture")}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: tab === "capture" ? theme.accent : theme.border,
                backgroundColor: tab === "capture" ? theme.surface : "transparent",
                alignItems: "center",
              }}
            >
              <Text style={{ color: tab === "capture" ? theme.text : theme.muted, fontWeight: "900" }}>
                {t("app.tabs.capture")}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setTab("log")}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: tab === "log" ? theme.accent : theme.border,
                backgroundColor: tab === "log" ? theme.surface : "transparent",
                alignItems: "center",
              }}
            >
              <Text style={{ color: tab === "log" ? theme.text : theme.muted, fontWeight: "900" }}>
                {t("app.tabs.log")}
              </Text>
            </Pressable>
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <CaptureScreen isActive={tab === "capture"} activeProfile={activeProfile} />
            <LogScreen isActive={tab === "log"} activeProfile={activeProfile} />
          </View>

          {/* Menu */}
          <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
            <Pressable
              onPress={() => setMenuOpen(false)}
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.55)",
                padding: 18,
                justifyContent: "center",
              }}
            >
              <Pressable
                onPress={() => {}}
                style={{
                  backgroundColor: theme.card,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: theme.border,
                  padding: 16,
                }}
              >
                <Text style={{ color: theme.text, fontWeight: "900", fontSize: 18 }}>
                  {t("app.menu.title")}
                </Text>

                <Text style={{ color: theme.muted, marginTop: 12 }}>
                  {t("settings.language")}
                </Text>

                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                  <Pressable
                    onPress={() => chooseLang("no")}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: lang === "no" ? theme.accent : theme.border,
                      backgroundColor: lang === "no" ? theme.surface : "transparent",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: lang === "no" ? theme.text : theme.muted, fontWeight: "900" }}>
                      Norsk
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => chooseLang("en")}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: lang === "en" ? theme.accent : theme.border,
                      backgroundColor: lang === "en" ? theme.surface : "transparent",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: lang === "en" ? theme.text : theme.muted, fontWeight: "900" }}>
                      English
                    </Text>
                  </Pressable>
                </View>

                <Text style={{ color: theme.muted, marginTop: 14 }}>
                  {t("settings.profile")}
                </Text>

                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                  <Pressable
                    onPress={() => setProfile("private")}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: activeProfile === "private" ? theme.accent : theme.border,
                      backgroundColor: activeProfile === "private" ? theme.surface : "transparent",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: activeProfile === "private" ? theme.text : theme.muted, fontWeight: "900" }}>
                      {t("app.profiles.private")}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setProfile("work")}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: activeProfile === "work" ? theme.accent : theme.border,
                      backgroundColor: activeProfile === "work" ? theme.surface : "transparent",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: activeProfile === "work" ? theme.text : theme.muted, fontWeight: "900" }}>
                      {t("app.profiles.work")}
                    </Text>
                  </Pressable>
                </View>

                <Text style={{ color: theme.muted, marginTop: 14 }}>
                  {t("settings.dev")}
                </Text>

                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                  <Pressable
                    onPress={() => setPlanAndPersist("free")}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: plan === "free" ? theme.accent : theme.border,
                      backgroundColor: plan === "free" ? theme.surface : "transparent",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: plan === "free" ? theme.text : theme.muted, fontWeight: "900" }}>
                      Free
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setPlanAndPersist("pro")}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: plan === "pro" ? theme.accent : theme.border,
                      backgroundColor: plan === "pro" ? theme.surface : "transparent",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: plan === "pro" ? theme.text : theme.muted, fontWeight: "900" }}>
                      Pro
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={() => setMenuOpen(false)}
                  style={{
                    marginTop: 16,
                    paddingVertical: 12,
                    borderRadius: 14,
                    alignItems: "center",
                    backgroundColor: theme.surface,
                    borderWidth: 1,
                    borderColor: theme.border,
                  }}
                >
                  <Text style={{ color: theme.text, fontWeight: "900" }}>OK</Text>
                </Pressable>
              </Pressable>
            </Pressable>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
}
